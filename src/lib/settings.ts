import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Settings = Record<string, string>;

export const DEFAULTS: Settings = {
  download_url_windows: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  app_update_url: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  app_version: "1.0.1",
  app_min_version: "1.0.0",
  app_update_notes: "New version available. Download to update BypassUnlock.",
  payments_enabled: "true",
  telegram_url: "https://t.me/BYPASS_UNLOCK_TOOL",
  contact_email: "BypassUnlocktool@outlook.com",
  website_url: "BypassUnlock.online",
  tool_version: "1.0.0",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      if (data) {
        const m: Settings = { ...DEFAULTS };
        data.forEach((r: any) => { m[r.key] = r.value; });
        setSettings(m);
      }
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
