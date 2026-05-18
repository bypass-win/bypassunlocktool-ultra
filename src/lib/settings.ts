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

const DEFAULT_YOUTUBE_VIDEOS = JSON.stringify([
  {
    id: "yt_default",
    title: "How to use Bypass Unlock",
    url: "https://youtu.be/tTPvRPta8Js?si=4d3qe4fDXHI86lkL",
    enabled: true,
  },
]);

const DEFAULT_MODELS = JSON.stringify([]);

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
  ota_blocker_url: "https://mega.nz/file/XhxEkZCa#t-c0MLkdqMmNO8z_sE6kr1bkpauv8eqzeram6DEvzWk",
  // Ads (JSON array string)
  custom_ad_scripts: DEFAULT_AD_SCRIPTS,
  // YouTube videos (JSON array)
  youtube_videos: DEFAULT_YOUTUBE_VIDEOS,
  // Custom device models (appended to built-in MODELS) — JSON array
  custom_models_json: DEFAULT_MODELS,
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

export type YoutubeVideo = {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
};

export function parseYoutubeVideos(value: string | undefined): YoutubeVideo[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr.filter((v) => v && typeof v.url === "string");
  } catch {
    return [];
  }
}

// Extract a YouTube video ID from common URL formats:
// https://youtu.be/<ID>?...
// https://www.youtube.com/watch?v=<ID>
// https://www.youtube.com/embed/<ID>
// https://www.youtube.com/shorts/<ID>
export function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname.endsWith("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts") return parts[1] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export type CustomModel = { id: string; name: string; price: number; category: "iphone" | "ipad" };

export function parseCustomModels(value: string | undefined): CustomModel[] {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((m) => m && typeof m.id === "string" && typeof m.name === "string" && typeof m.price === "number")
      .map((m) => ({
        id: String(m.id),
        name: String(m.name),
        price: Number(m.price),
        category: m.category === "ipad" ? "ipad" : "iphone",
      }));
  } catch {
    return [];
  }
}
