-- Voice notes use paths voice/<user_id>/<file> in the private "documents" bucket (see VoiceUploadPage).
-- Allow clients the same folder isolation pattern as documents/<uid>/...

DROP POLICY IF EXISTS "documents_client_voice_select" ON storage.objects;
DROP POLICY IF EXISTS "documents_client_voice_insert" ON storage.objects;
DROP POLICY IF EXISTS "documents_client_voice_delete" ON storage.objects;

CREATE POLICY "documents_client_voice_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'voice'
  AND split_part(name, '/', 2) = auth.uid()::text
);

CREATE POLICY "documents_client_voice_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'voice'
  AND split_part(name, '/', 2) = auth.uid()::text
);

CREATE POLICY "documents_client_voice_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND split_part(name, '/', 1) = 'voice'
  AND split_part(name, '/', 2) = auth.uid()::text
);
