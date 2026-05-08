-- Let brokerage staff read client-facing data needed for dashboards and lists.

CREATE POLICY "Brokers can view client profiles"
  ON public.profiles FOR SELECT
  USING (
    role = 'client'
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role = 'broker'
    )
  );

CREATE POLICY "Staff can view documents for brokerage"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

CREATE POLICY "Staff can view policies for brokerage"
  ON public.policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );
