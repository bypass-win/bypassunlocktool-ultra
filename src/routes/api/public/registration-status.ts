import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuerySchema = z.object({ serial: z.string().min(8).max(64) });

// Payment window matches the 15-minute crypto invoice TTL on the register page
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Strict Payment Timeline Logic (as per requirement)
 * 
 * The status display must ONLY reflect what has actually been verified:
 * 
 * 1. User starts payment → status "processing" 
 *    - NO "payment under review" shown yet (payment not verified)
 *    
 * 2. User checks serial BEFORE payment completes:
 *    - Shows "awaiting_payment" (waiting for blockchain confirmation)
 *    
 * 3. NOWPayments webhook fires (payment detected on blockchain):
 *    - Shows "under_review" (gateway received payment, verifying amount/details)
 *    - This is the ONLY time "under_review" appears (webhook confirms payment exists)
 *    
 * 4. If 15 minutes elapse with NO webhook:
 *    - Auto-expire and mark status "failed"
 *    - Shows "expired" to user
 *    
 * 5. If webhook confirms payment matches AND completes:
 *    - Shows "completed" (ready for bypass tool)
 *    
 * CRITICAL: Do NOT show "under_review" before webhook fires.
 * Only trust NOWPayments webhook as proof of payment.
 */
function deriveState(row: { status: string; notes: string | null; created_at: string }):
  | "completed"
  | "failed"
  | "under_review"
  | "awaiting_payment"
  | "expired" {
  
  // Rule 1: If admin or webhook already marked it completed → show completed
  if (row.status === "completed") return "completed";
  
  // Rule 2: If admin or system marked it failed → show failed
  if (row.status === "failed") return "failed";
  
  // Rule 3: Check if NOWPayments webhook has fired
  // Webhook writes "NOWPayments status:" to notes when payment is received
  const webhookFired = !!row.notes && row.notes.includes("NOWPayments status:");
  
  if (webhookFired) {
    // Webhook confirms payment was received by gateway
    // Show "under_review" (payment is being verified/processed)
    return "under_review";
  }
  
  // Rule 4: Calculate time elapsed since registration
  const ageMs = Date.now() - new Date(row.created_at).getTime();
  
  // Rule 5: If payment window expired AND no webhook (user never paid)
  if (ageMs > PAYMENT_WINDOW_MS) {
    // Session expired without payment
    return "expired";
  }
  
  // Rule 6: Still within payment window, waiting for payment
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

          // Look at the most recent registration row for this serial
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

          // Side-effect: If we determined the session expired, persist that
          // so future checks (and admin dashboard) reflect the expired state
          if (state === "expired") {
            await supabaseAdmin
              .from("registrations")
              .update({
                status: "failed",
                notes: (data.notes ? data.notes + " | " : "") + "Auto-expired: no payment received within 15-minute window",
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
