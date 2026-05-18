-- Care workspace: renewals preferences, claims, secure messaging, in-app notifications, broker tasks

-- ── Renewal reminder channel preferences (per policy) ─────────────────────
CREATE TABLE IF NOT EXISTS public.renewal_preferences (
  policy_id UUID PRIMARY KEY REFERENCES public.policies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_email BOOLEAN NOT NULL DEFAULT TRUE,
  remind_sms BOOLEAN NOT NULL DEFAULT FALSE,
  remind_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
  last_reminder_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.renewal_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "renewal_preferences_select"
  ON public.renewal_preferences FOR SELECT
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

CREATE POLICY "renewal_preferences_write"
  ON public.renewal_preferences FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.policies p
      WHERE p.id = policy_id
        AND (
          p.client_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
        )
    )
    AND client_id = (SELECT client_id FROM public.policies WHERE id = policy_id)
  );

CREATE POLICY "renewal_preferences_update"
  ON public.renewal_preferences FOR UPDATE
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE TRIGGER update_renewal_preferences_updated_at
  BEFORE UPDATE ON public.renewal_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Claim intakes (FNOL) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.claim_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  policy_number TEXT,
  incident_at TIMESTAMPTZ,
  location TEXT,
  description TEXT,
  third_parties TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft', 'submitted', 'in_review', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.claim_intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "claim_intakes_select"
  ON public.claim_intakes FOR SELECT
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "claim_intakes_insert"
  ON public.claim_intakes FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      client_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
    )
  );

CREATE POLICY "claim_intakes_update_staff"
  ON public.claim_intakes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

-- ── Secure threads & messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.secure_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.secure_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.secure_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.secure_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "secure_threads_select"
  ON public.secure_threads FOR SELECT
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "secure_threads_insert"
  ON public.secure_threads FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "secure_threads_update"
  ON public.secure_threads FOR UPDATE
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "secure_messages_select"
  ON public.secure_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.secure_threads t
      WHERE t.id = thread_id
        AND (
          t.client_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
        )
    )
  );

CREATE POLICY "secure_messages_insert"
  ON public.secure_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.secure_threads t
      WHERE t.id = thread_id
        AND (
          t.client_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
        )
    )
  );

CREATE TRIGGER update_secure_threads_updated_at
  BEFORE UPDATE ON public.secure_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── In-app portal notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('document', 'payment', 'security', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.portal_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal_notifications_select"
  ON public.portal_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "portal_notifications_update"
  ON public.portal_notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "portal_notifications_insert_self"
  ON public.portal_notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "portal_notifications_insert_staff"
  ON public.portal_notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
    AND EXISTS (SELECT 1 FROM public.profiles AS u WHERE u.id = user_id)
  );

-- ── Broker / staff tasks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.broker_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.broker_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "broker_tasks_select"
  ON public.broker_tasks FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "broker_tasks_insert"
  ON public.broker_tasks FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "broker_tasks_update"
  ON public.broker_tasks FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "broker_tasks_delete"
  ON public.broker_tasks FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_renewal_preferences_client ON public.renewal_preferences(client_id);
CREATE INDEX IF NOT EXISTS idx_claim_intakes_client ON public.claim_intakes(client_id);
CREATE INDEX IF NOT EXISTS idx_secure_threads_client ON public.secure_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_secure_messages_thread ON public.secure_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_portal_notifications_user ON public.portal_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broker_tasks_assignee ON public.broker_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_broker_tasks_status ON public.broker_tasks(status);

-- Bump thread timestamp when a message arrives (for ordering)
CREATE OR REPLACE FUNCTION public.touch_secure_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.secure_threads SET updated_at = NOW() WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER secure_messages_touch_thread
  AFTER INSERT ON public.secure_messages
  FOR EACH ROW EXECUTE FUNCTION public.touch_secure_thread_on_message();
