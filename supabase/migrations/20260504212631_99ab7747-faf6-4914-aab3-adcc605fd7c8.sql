
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Registrations
CREATE TYPE public.registration_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial TEXT NOT NULL,
  email TEXT NOT NULL,
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  unlock_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status public.registration_status NOT NULL DEFAULT 'processing',
  payment_method TEXT,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_registrations_serial ON public.registrations(serial);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can look up by serial (public status check). Anyone can submit a registration.
CREATE POLICY "Public read registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Public insert registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins update registrations" ON public.registrations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete registrations" ON public.registrations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Site settings (singleton-ish key/value)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (key, value) VALUES
  ('download_url_windows', 'https://mega.nz/file/IypkXQwQ#3tZTniXjKPN6BrB5DlT1sUxbdone-q_LYY8tA6rNna8'),
  ('payments_enabled', 'true'),
  ('telegram_url', 'https://t.me/BYPASS_UNLOCK'),
  ('contact_email', 'BypassUnlocktool@outlook.com'),
  ('website_url', 'BypassUnlock.online'),
  ('tool_version', '1.0.0');

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_registrations_updated BEFORE UPDATE ON public.registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + auto-promote admin email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  IF lower(NEW.email) = lower('BypassUnlocktool@outlook.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
