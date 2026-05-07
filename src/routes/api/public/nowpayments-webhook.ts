import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Stable JSON.stringify with sorted keys (NOWPayments HMAC requirement)
function sortedStringify(obj: any): string {
  if (Array.isArray(obj)) return "[" + obj.map(sortedStringify).join(",") + "]";
  if (obj && typeof obj === "object") {
    const keys = Object.keys(obj).sort();
    return "{" + keys.map((k) => JSON.stringify(k) + ":" + sortedStringify(obj[k])).join(",") + "}";
  }
  return JSON.stringify(obj);
}

export const Route = createFileRoute("/api/public/nowpayments-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.NOWPAYMENTS_IPN_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });

        const signature = request.headers.get("x-nowpayments-sig");
        const body = await request.text();
        if (!signature) return new Response("Missing signature", { status: 401 });

        let parsed: any;
        try { parsed = JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }

        const expected = createHmac("sha512", secret).update(sortedStringify(parsed)).digest("hex");
        const a = Buffer.from(signature, "utf8");
        const b = Buffer.from(expected, "utf8");
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const orderId = parsed.order_id as string | undefined;
        const paymentStatus = String(parsed.payment_status || "").toLowerCase();
        if (!orderId) return new Response("ok");

        let newStatus: "completed" | "processing" | "cancelled" | null = null;
        if (["finished", "confirmed"].includes(paymentStatus)) newStatus = "completed";
        else if (["failed", "expired", "refunded"].includes(paymentStatus)) newStatus = "cancelled";
        else if (["partially_paid", "confirming", "sending", "waiting"].includes(paymentStatus)) newStatus = "processing";

        if (newStatus) {
          await supabaseAdmin.from("registrations").update({
            status: newStatus,
            notes: `NOWPayments status: ${paymentStatus} | payment_id: ${parsed.payment_id ?? ""}`,
          }).eq("id", orderId);
        }

        return new Response("ok");
      },
    },
  },
});