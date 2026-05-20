-- Evidence files linked to FNOL (claim intakes). Objects live in Storage bucket `documents`
-- under paths compatible with existing storage RLS (see 00004_documents_storage_bucket.sql).

CREATE TABLE IF NOT EXISTS public.claim_intake_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_intake_id UUID NOT NULL REFERENCES public.claim_intakes(id) ON DELETE CASCADE,
  storage_object_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_intake_attachments_intake
  ON public.claim_intake_attachments(claim_intake_id);

ALTER TABLE public.claim_intake_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claim_intake_attachments_select"
  ON public.claim_intake_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.claim_intakes c
      WHERE c.id = claim_intake_id
        AND (
          c.client_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'broker')
          )
        )
    )
  );

CREATE POLICY "claim_intake_attachments_insert"
  ON public.claim_intake_attachments FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.claim_intakes c
      WHERE c.id = claim_intake_id
        AND (
          c.client_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'broker')
          )
        )
    )
  );
