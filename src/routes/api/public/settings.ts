import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/settings")({
  server: {
    handlers: {
      GET: async () => {
        const { data, error } = await supabaseAdmin.from("site_settings").select("key,value");
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const settings: Record<string, string> = {};
        (data ?? []).forEach((r: any) => { settings[r.key] = r.value; });
        return new Response(JSON.stringify(settings), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});