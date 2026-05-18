-- Clients may only read document rows where they are the insured client (not merely uploader).
-- Clients may only insert rows for themselves. Staff may insert for any client profile.

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;

CREATE POLICY "Clients insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    AND uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role = 'client'
    )
  );

CREATE POLICY "Staff insert client documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker')
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles c
      WHERE c.id = client_id AND c.role = 'client'
    )
    AND uploaded_by = auth.uid()
  );
