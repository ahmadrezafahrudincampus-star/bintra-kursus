ALTER TABLE registrations
  DROP CONSTRAINT IF EXISTS registrations_rejection_reason_required;

ALTER TABLE registrations
  ADD CONSTRAINT registrations_rejection_reason_required
  CHECK (
    (
      status = 'REJECTED'
      AND rejection_reason IS NOT NULL
      AND LENGTH(BTRIM(rejection_reason)) >= 10
    )
    OR
    (status <> 'REJECTED' AND rejection_reason IS NULL)
  );

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

  IF LENGTH(v_reason) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Alasan penolakan minimal 10 karakter');
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
