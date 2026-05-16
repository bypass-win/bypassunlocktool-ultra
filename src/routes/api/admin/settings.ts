import { createFileRoute } from "@tanstack/react-router";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/settings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          if (!isAdminRequest(request)) return adminUnauthorized();
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
          if (!isAdminRequest(request)) return adminUnauthorized();
          const body = await request.json();
          const { key, value } = body;

          if (!key || !value) {
            return new Response(
              JSON.stringify({ error: "Missing key or value" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const { error } = await supabaseAdmin
            .from("site_settings")
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { "Content-Type": "application/json" } }
            );
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
