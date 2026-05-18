import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuerySchema = z.object({ serial: z.string().min(8).max(64) });

// How long a crypto payment session is allowed to stay "awaiting" before
// we consider it expired (matches the 15-minute UI timer on the register page).
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// State derivation rules (driven solely by the row's status + notes + age,
// where notes are written by createCryptoPayment and the NOWPayments webhook):
//   - status=completed                              -> "completed"
//   - status=failed                                 -> "failed"
//   - status=processing AND webhook already fired   -> "under_review"
//     (notes contain "NOWPayments status:" — gateway reported a real payment)
//   - status=processing AND within payment window   -> "awaiting_payment"
//   - status=processing AND past payment window     -> "expired"
//     (no webhook ever fired = user never paid before the address expired;
//     we mark the row failed so it doesn't keep showing as awaiting forever)
function deriveState(row: { status: string; notes: string | null; created_at: string }):
  | "completed"
  | "failed"
  | "under_review"
  | "awaiting_payment"
  | "expired" {
  if (row.status === "completed") return "completed";
  if (row.status === "failed") return "failed";

  const webhookFired = !!row.notes && row.notes.includes("NOWPayments status:");
  if (webhookFired) return "under_review";

  const ageMs = Date.now() - new Date(row.created_at).getTime();
  if (ageMs > PAYMENT_WINDOW_MS) return "expired";
  return "awaiting_payment";
}

export const Route = createFileRoute("/api/public/registration-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const { serial } = QuerySchema.parse({ serial: url.searchParams.get("serial") ?? "" });
          const normalized = serial.trim().toUpperCase();

          // Look at the most recent registration row for this serial.
          const { data, error } = await supabaseAdmin
            .from("registrations")
            .select("id,serial,status,created_at,model_name,notes")
            .eq("serial", normalized)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) return json({ error: error.message }, 500);
          if (!data) return json({ registration: null, state: "not_found" });

          const state = deriveState(data as any);

          // Side-effect: if we determined the session expired, persist that so
          // future checks (and the admin dashboard) reflect reality.
          if (state === "expired") {
            await supabaseAdmin
              .from("registrations")
              .update({
                status: "failed",
                notes: (data.notes ? data.notes + " | " : "") + "Auto-expired: no payment received within 15 min",
              })
              .eq("id", data.id);
          }

          return json({
            registration: {
              serial: data.serial,
              status: data.status,
              created_at: data.created_at,
              model_name: data.model_name,
            },
            state,
          });
        } catch (e: any) {
          return json({ error: e.message || "Could not check status" }, 400);
        }
      },
    },
  },
});
