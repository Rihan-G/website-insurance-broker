CREATE OR REPLACE FUNCTION public.generate_renewal_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'broker')
  ) THEN
    RAISE EXCEPTION 'Only staff can generate renewal notifications';
  END IF;

  INSERT INTO public.portal_notifications (user_id, kind, title, body)
  SELECT
    p.client_id,
    'system',
    CASE
      WHEN (p.end_date - CURRENT_DATE) = 7  THEN 'Policy renewing in 7 days'
      WHEN (p.end_date - CURRENT_DATE) = 14 THEN 'Policy renewing in 14 days'
      ELSE 'Policy renewal reminder — 30 days'
    END,
    'Your ' || p.product_type || ' policy (' || p.policy_number || ') expires on ' ||
    TO_CHAR(p.end_date, 'DD Mon YYYY') || '. Contact us to arrange renewal.'
  FROM public.policies p
  WHERE p.status = 'active'
    AND (p.end_date - CURRENT_DATE) IN (7, 14, 30)
    AND NOT EXISTS (
      SELECT 1 FROM public.portal_notifications pn
      WHERE pn.user_id = p.client_id
        AND pn.body LIKE '%' || p.policy_number || '%'
        AND pn.created_at::date = CURRENT_DATE
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_renewal_notifications() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_renewal_notifications() TO authenticated;
