-- Document upload purpose (what is being uploaded) + index for per-user rate checks
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS document_purpose TEXT NOT NULL DEFAULT 'other'
  CHECK (document_purpose IN ('claim', 'renewal', 'id_proof', 'policy', 'other'));

COMMENT ON COLUMN public.documents.document_purpose IS 'User-selected category: claim, renewal, id_proof, policy, other';

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by_created_at
  ON public.documents (uploaded_by, created_at DESC);
