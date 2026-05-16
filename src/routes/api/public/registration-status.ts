import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuerySchema = z.object({ serial: z.string().min(8).max(64) });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/registration-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const { serial } = QuerySchema.parse({ serial: url.searchParams.get("serial") ?? "" });
          const { data, error } = await supabaseAdmin
            .from("registrations")
            .select("serial,status,created_at,model_name")
            .eq("serial", serial.trim().toUpperCase())
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) return json({ error: error.message }, 500);
          return json({ registration: data ?? null });
        } catch (e: any) {
          return json({ error: e.message || "Could not check status" }, 400);
        }
      },
    },
  },
});