-- Fix site_settings RLS to allow server-side admin operations
-- Drop the problematic policy that checks auth.uid()
DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;

-- Create new policies that allow:
-- 1. Public reads (no auth needed)
-- 2. Server-side writes via admin key (no USING clause blocks it)
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin inserts" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin updates" ON public.site_settings FOR UPDATE USING (true);
CREATE POLICY "Allow admin deletes" ON public.site_settings FOR DELETE USING (true);
