CREATE OR REPLACE FUNCTION set_registration_reg_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PENDING' AND NEW.reg_number IS NULL THEN
    NEW.reg_number := 'REG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('reg_number_seq')::TEXT, 5, '0');
  END IF;

  IF NEW.status <> 'REJECTED' THEN
    NEW.rejection_reason := NULL;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_reg_number ON registrations;
CREATE TRIGGER trg_generate_reg_number
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_registration_reg_number();

ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_rejection_reason_required;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_rejection_reason_required
  CHECK (
    (status = 'REJECTED' AND rejection_reason IS NOT NULL AND BTRIM(rejection_reason) <> '')
    OR
    (status <> 'REJECTED' AND rejection_reason IS NULL)
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_enrollments_registration_unique
  ON student_enrollments(registration_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_enrollment_period_unique
  ON invoices(enrollment_id, period_year, period_month);

CREATE OR REPLACE FUNCTION validate_enrollment_session_consistency()
RETURNS TRIGGER AS $$
DECLARE
  reg_course_id UUID;
  session_course_id UUID;
  session_is_active BOOLEAN;
  session_current_count INTEGER;
  session_max_capacity INTEGER;
BEGIN
  SELECT course_id
    INTO reg_course_id
  FROM registrations
  WHERE id = NEW.registration_id;

  IF reg_course_id IS NULL THEN
    RAISE EXCEPTION 'Pendaftaran tidak ditemukan untuk enrollment ini.';
  END IF;

  SELECT course_id, is_active, current_count, max_capacity
    INTO session_course_id, session_is_active, session_current_count, session_max_capacity
  FROM sessions
  WHERE id = NEW.session_id
  FOR UPDATE;

  IF session_course_id IS NULL THEN
    RAISE EXCEPTION 'Sesi kelas tidak ditemukan.';
  END IF;

  IF session_course_id <> reg_course_id THEN
    RAISE EXCEPTION 'Sesi tidak sesuai dengan program pendaftaran.';
  END IF;

  IF session_is_active IS NOT TRUE THEN
    RAISE EXCEPTION 'Sesi kelas tidak aktif.';
  END IF;

  IF NEW.status = 'ACTIVE' AND TG_OP = 'INSERT' AND session_current_count >= session_max_capacity THEN
    RAISE EXCEPTION 'Kapasitas sesi sudah penuh.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_enrollment_session_consistency ON student_enrollments;
CREATE TRIGGER trg_validate_enrollment_session_consistency
  BEFORE INSERT OR UPDATE ON student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION validate_enrollment_session_consistency();

CREATE OR REPLACE FUNCTION admin_approve_registration(p_registration_id UUID, p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_admin_role user_role;
  v_reg registrations%ROWTYPE;
  v_session sessions%ROWTYPE;
  v_enrollment_id UUID;
  v_amount INTEGER;
  v_due_date DATE;
  v_period_month INTEGER;
  v_period_year INTEGER;
BEGIN
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;

  IF v_admin_role IS DISTINCT FROM 'super_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT *
    INTO v_reg
  FROM registrations
  WHERE id = p_registration_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Data pendaftaran tidak ditemukan');
  END IF;

  IF v_reg.status = 'APPROVED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pendaftaran ini sudah pernah disetujui');
  END IF;

  IF v_reg.status = 'REJECTED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pendaftaran yang sudah ditolak tidak bisa disetujui ulang');
  END IF;

  IF v_reg.status <> 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Hanya pendaftaran berstatus PENDING yang bisa disetujui');
  END IF;

  SELECT *
    INTO v_session
  FROM sessions
  WHERE id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesi kelas tidak ditemukan');
  END IF;

  IF v_session.course_id <> v_reg.course_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesi tidak sesuai dengan program pendaftaran');
  END IF;

  IF v_session.is_active IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesi kelas tidak aktif');
  END IF;

  IF v_session.current_count >= v_session.max_capacity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sesi sudah penuh. Pilih sesi lain.');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM student_enrollments
    WHERE registration_id = v_reg.id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pendaftaran ini sudah memiliki enrollment aktif');
  END IF;

  UPDATE registrations
  SET
    status = 'APPROVED',
    preferred_session_id = p_session_id,
    reviewed_by = v_admin_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_reg.id;

  UPDATE profiles
  SET
    role = CASE WHEN role = 'super_admin' THEN role ELSE 'student' END,
    updated_at = NOW()
  WHERE id = v_reg.profile_id;

  INSERT INTO student_enrollments (
    profile_id,
    session_id,
    registration_id,
    participant_category,
    status
  )
  VALUES (
    v_reg.profile_id,
    p_session_id,
    v_reg.id,
    v_reg.participant_category,
    'ACTIVE'
  )
  RETURNING id INTO v_enrollment_id;

  SELECT
    CASE
      WHEN v_reg.participant_category = 'SMP' THEN price_smp
      WHEN v_reg.participant_category = 'SMA' THEN price_sma
      ELSE price_umum
    END
    INTO v_amount
  FROM course_master
  WHERE id = v_reg.course_id;

  v_period_month := EXTRACT(MONTH FROM NOW());
  v_period_year := EXTRACT(YEAR FROM NOW());
  v_due_date := MAKE_DATE(v_period_year, v_period_month, 1) + INTERVAL '1 month' + INTERVAL '9 days';

  INSERT INTO invoices (
    profile_id,
    enrollment_id,
    amount,
    period_month,
    period_year,
    due_date,
    status
  )
  VALUES (
    v_reg.profile_id,
    v_enrollment_id,
    COALESCE(v_amount, 25000),
    v_period_month,
    v_period_year,
    v_due_date,
    'UNPAID'
  )
  ON CONFLICT (enrollment_id, period_year, period_month) DO NOTHING;

  INSERT INTO activity_logs (
    actor_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    v_admin_id,
    'REGISTRATION_APPROVED',
    'registrations',
    v_reg.id::TEXT,
    jsonb_build_object('profile_id', v_reg.profile_id, 'session_id', p_session_id)
  );

  RETURN jsonb_build_object('success', true, 'enrollment_id', v_enrollment_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_reject_registration(p_registration_id UUID, p_reason TEXT)
RETURNS JSONB AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_admin_role user_role;
  v_reg registrations%ROWTYPE;
  v_reason TEXT := BTRIM(COALESCE(p_reason, ''));
BEGIN
  SELECT role INTO v_admin_role
  FROM profiles
  WHERE id = v_admin_id;

  IF v_admin_role IS DISTINCT FROM 'super_admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF v_reason = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Alasan penolakan wajib diisi');
  END IF;

  SELECT *
    INTO v_reg
  FROM registrations
  WHERE id = p_registration_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Data pendaftaran tidak ditemukan');
  END IF;

  IF v_reg.status = 'APPROVED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pendaftaran yang sudah disetujui tidak bisa ditolak');
  END IF;

  IF v_reg.status = 'REJECTED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pendaftaran ini sudah pernah ditolak');
  END IF;

  IF v_reg.status <> 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Hanya pendaftaran berstatus PENDING yang bisa ditolak');
  END IF;

  UPDATE registrations
  SET
    status = 'REJECTED',
    rejection_reason = v_reason,
    reviewed_by = v_admin_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_reg.id;

  INSERT INTO activity_logs (
    actor_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    v_admin_id,
    'REGISTRATION_REJECTED',
    'registrations',
    v_reg.id::TEXT,
    jsonb_build_object('reason', v_reason)
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
