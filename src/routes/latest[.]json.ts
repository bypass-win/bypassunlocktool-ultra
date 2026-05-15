import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://vrpjhlxmyvklscnlfvip.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycGpobHhteXZrbHNjbmxmdmlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzYxMTYsImV4cCI6MjA5MzgxMjExNn0.UQ_yMB_iaLmNKNYN1aAesIt5VlWgY_cgRae9n0WfDmU";

const corsHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/latest.json")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),
      GET: async () => {
        const defaults = {
          version: "1.0.1",
          url: "https://mega.nz/folder/a1hVwDxL#xsXIa7miRPDHdEIdxuyQ1w",
          notes: "New version available. Download to update BypassUnlock.",
          minVersion: "1.0.0",
        };

        try {
          const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data } = await client
            .from("site_settings")
            .select("key,value")
            .in("key", [
              "app_version",
              "app_update_url",
              "app_min_version",
              "app_update_notes",
              "download_url_windows",
              "mac_app_version",
              "mac_app_update_url",
              "mac_app_min_version",
              "mac_app_update_notes",
              "download_url_mac",
            ]);

          const m: Record<string, string> = {};
          (data ?? []).forEach((r: any) => { m[r.key] = r.value; });

          const body = {
            version: m.app_version || defaults.version,
            url: m.app_update_url || m.download_url_windows || defaults.url,
            notes: m.app_update_notes || defaults.notes,
            minVersion: m.app_min_version || defaults.minVersion,
            darwin: {
              version: m.mac_app_version || defaults.version,
              url: m.mac_app_update_url || m.download_url_mac || defaults.url,
              notes: m.mac_app_update_notes || "macOS update available.",
              minVersion: m.mac_app_min_version || defaults.minVersion,
            },
          };

          return new Response(JSON.stringify(body, null, 2), {
            status: 200,
            headers: corsHeaders,
          });
        } catch (e: any) {
          return new Response(
            JSON.stringify({ ...defaults, error: e?.message || "fallback" }, null, 2),
            { status: 200, headers: corsHeaders },
          );
        }
      },
    },
  },
});
