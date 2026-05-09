import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/latest.json")({
  server: {
    handlers: {
      GET: async () => {
        const { data } = await supabaseAdmin
          .from("site_settings")
          .select("key,value")
          .in("key", [
            "app_version",
            "app_update_url",
            "app_update_notes",
            "app_min_version",
          ]);

        const m: Record<string, string> = {};
        (data ?? []).forEach((r: any) => { m[r.key] = r.value; });

        const body = {
          version: m.app_version || "1.0.1",
          url: m.app_update_url || "https://mega.nz/file/YOUR-ACTUAL-LINK",
          notes: m.app_update_notes || "New version available. Download to update BypassUnlock.",
          minVersion: m.app_min_version || "1.0.0",
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store, max-age=0",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
