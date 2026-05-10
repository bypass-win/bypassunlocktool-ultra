import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("key,value");

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
          }

          const settings: Record<string, string> = {};
          (data ?? []).forEach((r: any) => {
            settings[r.key] = r.value;
          });

          return new Response(JSON.stringify(settings), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { key, value } = body;

          // Use raw SQL to avoid upsert conflicts
          const { error } = await supabaseAdmin
            .rpc('upsert_setting', { p_key: key, p_value: value });

          if (error) {
            // Fallback: try direct upsert if RPC doesn't exist
            const { error: upsertError } = await supabaseAdmin
              .from("site_settings")
              .upsert({ key, value, updated_at: new Date().toISOString() }, { 
                onConflict: "key" 
              });

            if (upsertError) {
              return new Response(
                JSON.stringify({ error: upsertError.message }),
                { status: 500, headers: { "Content-Type": "application/json" } }
              );
            }
          }

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
