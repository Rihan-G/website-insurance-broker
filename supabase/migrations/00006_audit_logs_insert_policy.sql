-- Allow authenticated users to append audit rows as themselves (for broker/client actions).
-- Admins retain SELECT-only visibility from the initial schema; inserts are attributed to auth.uid().

CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());
