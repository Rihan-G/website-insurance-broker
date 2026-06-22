CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_name TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can insert own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Clients can view own referrals"
  ON public.referrals FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Staff can view all referrals"
  ON public.referrals FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );

CREATE POLICY "Staff can update referral status"
  ON public.referrals FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'broker'))
  );
