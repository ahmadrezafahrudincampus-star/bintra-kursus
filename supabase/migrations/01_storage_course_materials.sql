INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Admin can upload course material files" ON storage.objects;
CREATE POLICY "Admin can upload course material files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Admin can update course material files" ON storage.objects;
CREATE POLICY "Admin can update course material files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
)
WITH CHECK (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);

DROP POLICY IF EXISTS "Admin can delete course material files" ON storage.objects;
CREATE POLICY "Admin can delete course material files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'course-materials'
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
  )
);
