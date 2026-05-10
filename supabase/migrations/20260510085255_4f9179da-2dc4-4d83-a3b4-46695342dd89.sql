
DROP POLICY IF EXISTS "Public manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;

CREATE POLICY "settings_select_all" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "settings_insert_all" ON public.site_settings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "settings_update_all" ON public.site_settings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "settings_delete_all" ON public.site_settings
  FOR DELETE TO anon, authenticated USING (true);
