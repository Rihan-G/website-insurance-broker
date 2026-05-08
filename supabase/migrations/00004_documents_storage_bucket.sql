-- Phase 2 — Private Storage bucket aligned with frontend `uploadService` (bucket id: documents).
-- Object paths: documents/<client_uuid>/<filename>

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "documents_client_select_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_staff_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_client_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_staff_insert_client_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_client_delete_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_staff_delete" ON storage.objects;

CREATE POLICY "documents_client_select_own_folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'documents'
  AND split_part(name, '/', 2) = auth.uid()::text
);

CREATE POLICY "documents_staff_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'broker')
  )
);

CREATE POLICY "documents_client_insert_own_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'documents'
  AND split_part(name, '/', 2) = auth.uid()::text
);

CREATE POLICY "documents_staff_insert_client_folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles me
    WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles client
    WHERE client.id::text = split_part(name, '/', 2)
    AND client.role = 'client'
  )
);

CREATE POLICY "documents_client_delete_own_folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'documents'
  AND split_part(name, '/', 2) = auth.uid()::text
);

CREATE POLICY "documents_staff_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'broker')
  )
);
