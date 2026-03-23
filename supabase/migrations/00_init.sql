-- ============================================
-- Sistem Website Kursus Komputer
-- Database Migration v1.0
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('super_admin', 'applicant', 'student');
CREATE TYPE registration_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE invoice_status AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'OVERDUE');
CREATE TYPE payment_proof_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'SICK', 'PERMIT');
CREATE TYPE enrollment_status AS ENUM ('ACTIVE', 'TRANSFERRED', 'DROPPED');
CREATE TYPE material_type AS ENUM ('PDF', 'VIDEO', 'LINK', 'OTHER');
CREATE TYPE course_level AS ENUM ('pemula', 'menengah', 'lanjut');
CREATE TYPE participant_category AS ENUM ('SMP', 'SMA', 'Umum');

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'applicant',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- COURSE MASTER
-- ============================================
CREATE TABLE course_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level course_level NOT NULL DEFAULT 'pemula',
  price_smp INTEGER NOT NULL DEFAULT 15000,
  price_sma INTEGER NOT NULL DEFAULT 20000,
  price_umum INTEGER NOT NULL DEFAULT 25000,
  estimated_meetings TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SESSIONS (Jadwal Kelas)
-- ============================================
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES course_master(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructor_name TEXT,
  room TEXT,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 15 CHECK (max_capacity <= 25),
  current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REGISTRATIONS (Form Pendaftaran)
-- ============================================
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reg_number TEXT UNIQUE,
  full_name TEXT NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('L', 'P')),
  birth_date DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  school_name TEXT NOT NULL,
  participant_category participant_category NOT NULL,
  class_name TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  course_id UUID NOT NULL REFERENCES course_master(id),
  preferred_session_id UUID REFERENCES sessions(id),
  experience TEXT,
  goals TEXT,
  document_url TEXT,
  status registration_status NOT NULL DEFAULT 'DRAFT',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-generate registration number saat status berubah ke PENDING
CREATE OR REPLACE FUNCTION generate_reg_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'PENDING' AND OLD.status = 'DRAFT' AND NEW.reg_number IS NULL THEN
    NEW.reg_number := 'REG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('reg_number_seq')::TEXT, 5, '0');
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS reg_number_seq START 1;

CREATE TRIGGER trg_generate_reg_number
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION generate_reg_number();

-- ============================================
-- STUDENT ENROLLMENTS
-- ============================================
CREATE TABLE student_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id),
  registration_id UUID NOT NULL REFERENCES registrations(id),
  participant_category participant_category NOT NULL,
  status enrollment_status NOT NULL DEFAULT 'ACTIVE',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, session_id)
);

-- Update current_count di sessions saat enrollment berubah
CREATE OR REPLACE FUNCTION update_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
    UPDATE sessions SET current_count = current_count + 1 WHERE id = NEW.session_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
      UPDATE sessions SET current_count = current_count - 1 WHERE id = NEW.session_id;
    ELSIF OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE' THEN
      UPDATE sessions SET current_count = current_count + 1 WHERE id = NEW.session_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
    UPDATE sessions SET current_count = current_count - 1 WHERE id = OLD.session_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_count
  AFTER INSERT OR UPDATE OR DELETE ON student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_session_count();

-- ============================================
-- INVOICES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id),
  invoice_number TEXT UNIQUE NOT NULL DEFAULT (
    'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0')
  ),
  amount INTEGER NOT NULL CHECK (amount > 0),
  period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INTEGER NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'UNPAID',
  paid_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_invoice_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_timestamp();

-- ============================================
-- PAYMENT PROOFS (Bukti Pembayaran)
-- ============================================
CREATE TABLE payment_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_url TEXT NOT NULL,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status payment_proof_status NOT NULL DEFAULT 'PENDING',
  admin_note TEXT,
  officer_name TEXT,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ATTENDANCES
-- ============================================
CREATE TABLE attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id),
  date DATE NOT NULL,
  meeting_number INTEGER NOT NULL,
  status attendance_status NOT NULL DEFAULT 'PRESENT',
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, date, meeting_number)
);

-- ============================================
-- COURSE MATERIALS
-- ============================================
CREATE TABLE course_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES course_master(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  material_type material_type NOT NULL DEFAULT 'PDF',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ACTIVITY LOGS (Audit Trail)
-- ============================================
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_registrations_profile ON registrations(profile_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_enrollments_profile ON student_enrollments(profile_id);
CREATE INDEX idx_enrollments_session ON student_enrollments(session_id);
CREATE INDEX idx_invoices_profile ON invoices(profile_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period_year, period_month);
CREATE INDEX idx_payment_proofs_invoice ON payment_proofs(invoice_id);
CREATE INDEX idx_attendances_enrollment ON attendances(enrollment_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_activity_logs_actor ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function untuk cek role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (get_user_role() = 'super_admin');
CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE USING (get_user_role() = 'super_admin');
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true); -- service role bypass

-- COURSE MASTER (Public read for active courses)
CREATE POLICY "Anyone can view active courses" ON course_master
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage courses" ON course_master
  FOR ALL USING (get_user_role() = 'super_admin');

-- SESSIONS (Public read for active sessions)
CREATE POLICY "Anyone can view active sessions" ON sessions
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage sessions" ON sessions
  FOR ALL USING (get_user_role() = 'super_admin');

-- REGISTRATIONS
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can create own registration" ON registrations
  FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own DRAFT registration" ON registrations
  FOR UPDATE USING (profile_id = auth.uid() AND status = 'DRAFT');
CREATE POLICY "Admin can view all registrations" ON registrations
  FOR SELECT USING (get_user_role() = 'super_admin');
CREATE POLICY "Admin can update all registrations" ON registrations
  FOR UPDATE USING (get_user_role() = 'super_admin');

-- STUDENT ENROLLMENTS
CREATE POLICY "Students can view own enrollments" ON student_enrollments
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admin can manage enrollments" ON student_enrollments
  FOR ALL USING (get_user_role() = 'super_admin');

-- INVOICES
CREATE POLICY "Students can view own invoices" ON invoices
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admin can manage invoices" ON invoices
  FOR ALL USING (get_user_role() = 'super_admin');

-- PAYMENT PROOFS
CREATE POLICY "Students can view and upload own payment proofs" ON payment_proofs
  FOR SELECT USING (uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payment_proofs.invoice_id AND invoices.profile_id = auth.uid()));
CREATE POLICY "Students can insert payment proofs" ON payment_proofs
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Admin can manage payment proofs" ON payment_proofs
  FOR ALL USING (get_user_role() = 'super_admin');

-- ATTENDANCES
CREATE POLICY "Students can view own attendances" ON attendances
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM student_enrollments WHERE id = attendances.enrollment_id AND profile_id = auth.uid())
  );
CREATE POLICY "Admin can manage attendances" ON attendances
  FOR ALL USING (get_user_role() = 'super_admin');

-- COURSE MATERIALS (only for enrolled students)
CREATE POLICY "Students can view published materials for enrolled courses" ON course_materials
  FOR SELECT USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM student_enrollments se
      JOIN sessions s ON s.id = se.session_id
      WHERE s.course_id = course_materials.course_id
      AND se.profile_id = auth.uid()
      AND se.status = 'ACTIVE'
    )
  );
CREATE POLICY "Admin can manage materials" ON course_materials
  FOR ALL USING (get_user_role() = 'super_admin');

-- ACTIVITY LOGS
CREATE POLICY "Admin can view all logs" ON activity_logs
  FOR SELECT USING (get_user_role() = 'super_admin');
CREATE POLICY "Any authenticated user can insert logs" ON activity_logs
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'applicant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SEED DATA AWAL (Mata Kursus)
-- ============================================
INSERT INTO course_master (name, description, level, price_smp, price_sma, price_umum, estimated_meetings) VALUES
  ('Pengenalan Dasar Komputer', 'Dasar penggunaan komputer, mouse, keyboard, dan OS', 'pemula', 15000, 20000, 25000, '4–6 pertemuan'),
  ('Microsoft Word', 'Membuat dokumen profesional dengan Microsoft Word', 'pemula', 15000, 20000, 25000, '4–8 pertemuan'),
  ('Microsoft Excel', 'Pengolahan data dan rumus dengan Microsoft Excel', 'pemula', 15000, 20000, 25000, '6–10 pertemuan'),
  ('Microsoft PowerPoint', 'Membuat presentasi menarik dan profesional', 'pemula', 15000, 20000, 25000, '4–6 pertemuan'),
  ('Desain Grafis: CorelDraw', 'Desain vektor dan layout menggunakan CorelDraw', 'menengah', 15000, 20000, 30000, '8–12 pertemuan'),
  ('Desain Grafis: Adobe Photoshop', 'Editing foto dan desain bitmap profesional', 'menengah', 15000, 20000, 30000, '8–12 pertemuan'),
  ('Desain Grafis: Adobe Illustrator', 'Ilustrasi vektor digital menggunakan Illustrator', 'menengah', 15000, 20000, 30000, '8–12 pertemuan'),
  ('Editing Dasar CapCut', 'Editing video dasar menggunakan CapCut', 'pemula', 15000, 20000, 25000, '4–6 pertemuan'),
  ('Pembelajaran AI: Dasar', 'Pengenalan AI, ChatGPT, dan cara penggunaan dasar', 'pemula', 15000, 20000, 25000, '4–6 pertemuan'),
  ('Pembelajaran AI: Menengah', 'Prompt engineering dan otomasi kerja dengan AI', 'menengah', 15000, 20000, 30000, '6–8 pertemuan'),
  ('Pembuatan Website Menggunakan AI', 'Membuat website profesional dengan bantuan AI tools', 'menengah', 15000, 20000, 35000, '8–12 pertemuan');
