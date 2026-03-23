-- ============================================
-- Migration 01: Announcements Table
-- Fase 5 - Operations & Student Experience
-- ============================================

CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_is_active ON announcements(is_active);
CREATE INDEX idx_announcements_target_session ON announcements(target_session_id);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Semua user login bisa lihat pengumuman aktif
-- (NULL target_session_id = untuk semua; non-null = hanya sesi tersebut, difilter di aplikasi)
CREATE POLICY "Authenticated users can view active announcements" ON announcements
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Admin bisa manage semua
CREATE POLICY "Admin can manage announcements" ON announcements
  FOR ALL USING (get_user_role() = 'super_admin');
