-- ============================================================
-- PHASE 2 – Admin tools, RBAC, 2FA metadata, audit enhancements
-- ============================================================

-- 2FA metadata stored in profiles (totp secret, enabled flag)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS totp_secret TEXT,
  ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00;

-- Manual review comments on documents
CREATE TABLE IF NOT EXISTS public.document_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected', 'needs_revision')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and brokers can manage reviews"
  ON public.document_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

-- ============================================================
-- PHASE 3 – Client access, inbox, payments, receipts
-- ============================================================

-- Inbox messages (Supabase Realtime enabled)
CREATE TABLE IF NOT EXISTS public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  message_type TEXT NOT NULL DEFAULT 'message'
    CHECK (message_type IN ('message', 'notification', 'payment_request', 'document_request')),
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages"
  ON public.inbox_messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.inbox_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark as read"
  ON public.inbox_messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- Enable realtime on inbox_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_messages;

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  policy_id UUID REFERENCES public.policies(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MUR',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  gateway TEXT NOT NULL DEFAULT 'mcb_juice'
    CHECK (gateway IN ('mcb_juice', 'mips', 'sbm', 'paypal', 'dpo')),
  gateway_reference TEXT,
  payment_link TEXT,
  link_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own payments"
  ON public.payments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins/brokers can manage payments"
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- PDF receipts/documents
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  payment_id UUID REFERENCES public.payments(id),
  policy_id UUID REFERENCES public.policies(id),
  doc_type TEXT NOT NULL CHECK (doc_type IN ('receipt', 'policy_certificate', 'renewal_notice', 'statement')),
  file_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID NOT NULL REFERENCES public.profiles(id)
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated documents"
  ON public.generated_documents FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins/brokers can manage generated documents"
  ON public.generated_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

-- ============================================================
-- PHASE 4 – Quotes, analytics, commissions
-- ============================================================

-- Quote requests from clients or prospects
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id),
  product_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  estimated_premium NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'converted')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own quotes"
  ON public.quotes FOR SELECT
  USING (client_id = auth.uid() OR client_id IS NULL);

CREATE POLICY "Anyone can create quotes"
  ON public.quotes FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins/brokers can manage quotes"
  ON public.quotes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Broker commission records
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES public.profiles(id),
  policy_id UUID NOT NULL REFERENCES public.policies(id),
  payment_id UUID REFERENCES public.payments(id),
  rate NUMERIC(5,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view own commissions"
  ON public.commissions FOR SELECT
  USING (broker_id = auth.uid());

CREATE POLICY "Admins can manage commissions"
  ON public.commissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- PHASE 5 – Document expiry, notifications, voice uploads
-- ============================================================

-- Document / policy expiry tracking
CREATE TABLE IF NOT EXISTS public.expiry_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  policy_id UUID REFERENCES public.policies(id),
  document_id UUID REFERENCES public.documents(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('policy_expiry', 'document_expiry', 'renewal_due', 'payment_due')),
  expires_at DATE NOT NULL,
  days_before_alert INTEGER NOT NULL DEFAULT 30,
  notified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'snoozed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.expiry_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own alerts"
  ON public.expiry_alerts FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Admins/brokers can manage alerts"
  ON public.expiry_alerts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

-- Mid-term adjustment requests
CREATE TABLE IF NOT EXISTS public.mid_term_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES public.policies(id),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  adjustment_type TEXT NOT NULL,
  description TEXT NOT NULL,
  premium_change NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mid_term_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own adjustments"
  ON public.mid_term_adjustments FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create adjustments"
  ON public.mid_term_adjustments FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins/brokers can manage adjustments"
  ON public.mid_term_adjustments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'broker')
    )
  );

-- Voice notes (Creole voice upload + transcription)
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  transcript TEXT,
  language TEXT NOT NULL DEFAULT 'mfe',
  processing_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'done', 'failed')),
  linked_document_id UUID REFERENCES public.documents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage own voice notes"
  ON public.voice_notes FOR ALL
  USING (client_id = auth.uid());

-- Notification log
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'failed', 'delivered')),
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
  ON public.notification_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON public.documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_policies_client_id ON public.policies(client_id);
CREATE INDEX IF NOT EXISTS idx_policies_status ON public.policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_end_date ON public.policies(end_date);
CREATE INDEX IF NOT EXISTS idx_inbox_recipient ON public.inbox_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_inbox_sender ON public.inbox_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_expires ON public.expiry_alerts(expires_at);
