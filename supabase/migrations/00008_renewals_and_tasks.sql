-- Renewals (per client, often tied to a policy) and day-scoped tasks.
-- Shared colour tokens for badges/chips across both features.

CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  renewal_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'due', 'completed', 'lapsed', 'cancelled')),
  color_token TEXT NOT NULL DEFAULT 'primary'
    CHECK (color_token IN ('primary', 'accent', 'warning', 'danger', 'muted')),
  template_key TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewals_client_renewal_date ON public.renewals (client_id, renewal_date);
CREATE INDEX IF NOT EXISTS idx_renewals_renewal_date ON public.renewals (renewal_date);

ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "renewals_select_own_or_staff"
  ON public.renewals FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
  );

CREATE POLICY "renewals_insert_staff"
  ON public.renewals FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
    AND EXISTS (SELECT 1 FROM public.profiles c WHERE c.id = client_id AND c.role = 'client')
  );

CREATE POLICY "renewals_update_staff"
  ON public.renewals FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker')));

CREATE POLICY "renewals_delete_staff"
  ON public.renewals FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker')));

CREATE TRIGGER update_renewals_updated_at
  BEFORE UPDATE ON public.renewals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ---------------------------------------------------------------------------
-- Tasks: one calendar day per row ("task for the day" scope via task_date)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  color_token TEXT NOT NULL DEFAULT 'accent'
    CHECK (color_token IN ('primary', 'accent', 'warning', 'danger', 'muted')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_task_date ON public.tasks (assignee_id, task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_task_date ON public.tasks (task_date);
CREATE INDEX IF NOT EXISTS idx_tasks_client_task_date ON public.tasks (client_id, task_date);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select"
  ON public.tasks FOR SELECT TO authenticated
  USING (
    assignee_id = auth.uid()
    OR client_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
  );

CREATE POLICY "tasks_insert_self"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND assignee_id = auth.uid()
  );

CREATE POLICY "tasks_insert_staff"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
    AND created_by = auth.uid()
  );

CREATE POLICY "tasks_update"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    assignee_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
  );

CREATE POLICY "tasks_delete"
  ON public.tasks FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR assignee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.id = auth.uid() AND me.role IN ('admin', 'broker'))
  );

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
