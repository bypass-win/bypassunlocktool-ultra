import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PAYPAL_BASE =
  (process.env.PAYPAL_ENV ?? "sandbox") === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const id = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export const getPayPalClientId = createServerFn({ method: "GET" }).handler(async () => {
  return { clientId: process.env.PAYPAL_CLIENT_ID ?? "" };
});

export const createPayPalOrder = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive(),
      serial: z.string().min(8),
      modelName: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: `${data.modelName} unlock — ${data.serial}`,
            amount: { currency_code: "USD", value: data.amount.toFixed(2) },
          },
        ],
      }),
    });
    const json = (await res.json()) as { id?: string; message?: string; details?: any };
    if (!res.ok || !json.id) {
      console.error("PayPal createOrder failed:", res.status, JSON.stringify(json));
      throw new Error(json.message ? `${json.message}: ${JSON.stringify(json.details ?? {})}` : "Failed to create order");
    }
    return { orderId: json.id };
  });

export const capturePayPalOrder = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      orderId: z.string(),
      serial: z.string(),
      email: z.string().email(),
      modelId: z.string(),
      modelName: z.string(),
      unlockType: z.string(),
      amount: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const token = await getAccessToken();
    const res = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${data.orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const json = (await res.json()) as { status?: string; message?: string };
    if (!res.ok || json.status !== "COMPLETED") {
      throw new Error(json.message || "Payment not completed");
    }

    const { error } = await supabaseAdmin.from("registrations").insert({
      serial: data.serial.trim().toUpperCase(),
      email: data.email.trim(),
      model_id: data.modelId,
      model_name: data.modelName,
      unlock_type: data.unlockType,
      amount: data.amount,
      payment_method: "paypal",
      status: "completed",
      notes: `PayPal Order: ${data.orderId}`,
    });
    if (error) throw new Error(error.message);

    return { success: true };
  });
