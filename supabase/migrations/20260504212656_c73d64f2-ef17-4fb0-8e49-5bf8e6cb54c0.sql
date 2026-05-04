
ALTER FUNCTION public.set_updated_at() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;

-- Tighten registrations insert: require non-empty serial/email/model
DROP POLICY "Public insert registrations" ON public.registrations;
CREATE POLICY "Anyone can submit registrations" ON public.registrations
  FOR INSERT WITH CHECK (
    length(serial) >= 8 AND length(serial) <= 64
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(model_id) > 0
  );
