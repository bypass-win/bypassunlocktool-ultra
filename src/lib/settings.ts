import { useEffect, useState } from "react";

export type Settings = Record<string, string>;

const DEFAULT_AD_SCRIPTS = JSON.stringify([
  {
    id: "hilltopads",
    name: "HilltopAds",
    enabled: true,
    placement: "head",
    html: `<script>(function(tdem){var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=tdem||{};s.src="//fluffy-management.com/c.Dj9n6MbF2E5alxSEWUQA9UNzzWASz/NCj_EQw_NrS/0l3CM/DPM-2oMuTiA/5S";s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({})</script>`,
  },
]);

export const DEFAULTS: Settings = {
  // Windows
  download_url_windows: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  app_update_url: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  app_version: "1.0.1",
  app_min_version: "1.0.0",
  app_update_notes: "New version available. Download to update BypassUnlock.",
  // macOS
  download_url_mac: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  mac_app_update_url: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
  mac_app_version: "1.0.1",
  mac_app_min_version: "1.0.0",
  mac_app_update_notes: "macOS v1.0.1 — fixed device scan crash.",
  // Site
  payments_enabled: "true",
  telegram_url: "https://t.me/BYPASS_UNLOCK_TOOL",
  contact_email: "BypassUnlocktool@outlook.com",
  website_url: "BypassUnlock.online",
  tool_version: "1.0.0",
  // Ads (JSON array string)
  custom_ad_scripts: DEFAULT_AD_SCRIPTS,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}

export type AdScript = {
  id: string;
  name: string;
  enabled: boolean;
  placement: "head" | "body";
  html: string;
};

export function parseAdScripts(value: string | undefined): AdScript[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr.filter((a) => a && typeof a.html === "string");
  } catch {
    return [];
  }
}
