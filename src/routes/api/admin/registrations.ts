import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { adminUnauthorized, isAdminRequest } from "@/lib/admin-auth.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const RegistrationSchema = z.object({
  email: z.string().email().max(255),
  serial: z.string().min(8).max(64),
  model_id: z.string().min(1).max(64).default("manual"),
  model_name: z.string().min(1).max(128).default("manual"),
  unlock_type: z.enum(["icloud", "passcode"]),
  amount: z.number().min(0).max(10000),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  payment_method: z.string().min(1).max(64).default("manual"),
  notes: z.string().max(1000).optional().nullable(),
});

const StatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
});

const DeleteSchema = z.object({ id: z.string().uuid() });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/admin/registrations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          if (!isAdminRequest(request)) return adminUnauthorized();
          const { data, error } = await supabaseAdmin
            .from("registrations")
            .select("id,created_at,email,serial,model_name,unlock_type,amount,status,payment_method,notes")
            .order("created_at", { ascending: false })
            .limit(500);

          if (error) return json({ error: error.message }, 500);
          return json({ registrations: data ?? [] });
        } catch (e: any) {
          return json({ error: e.message || "Could not load registrations" }, 500);
        }
      },

      POST: async ({ request }) => {
        try {
          if (!isAdminRequest(request)) return adminUnauthorized();
          const data = RegistrationSchema.parse(await request.json());
          const { error } = await supabaseAdmin.from("registrations").insert({
            email: data.email.trim(),
            serial: data.serial.trim().toUpperCase(),
            model_id: data.model_id || "manual",
            model_name: data.model_name || data.model_id || "manual",
            unlock_type: data.unlock_type,
            amount: data.amount,
            status: data.status,
            payment_method: data.payment_method,
            notes: data.notes || null,
          });

          if (error) return json({ error: error.message }, 500);
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Could not add registration" }, 400);
        }
      },

      PATCH: async ({ request }) => {
        try {
          if (!isAdminRequest(request)) return adminUnauthorized();
          const data = StatusSchema.parse(await request.json());
          const { error } = await supabaseAdmin
            .from("registrations")
            .update({ status: data.status })
            .eq("id", data.id);

          if (error) return json({ error: error.message }, 500);
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Could not update registration" }, 400);
        }
      },

      DELETE: async ({ request }) => {
        try {
          if (!isAdminRequest(request)) return adminUnauthorized();
          const data = DeleteSchema.parse(await request.json());
          const { error } = await supabaseAdmin.from("registrations").delete().eq("id", data.id);

          if (error) return json({ error: error.message }, 500);
          return json({ success: true });
        } catch (e: any) {
          return json({ error: e.message || "Could not delete registration" }, 400);
        }
      },
    },
  },
});