-- Open up admin-managed tables since admin auth is now handled via simple credential gate in the UI
DROP POLICY IF EXISTS "Admins update registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins delete registrations" ON public.registrations;
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;

CREATE POLICY "Public update registrations" ON public.registrations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete registrations" ON public.registrations FOR DELETE USING (true);
CREATE POLICY "Public manage settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);