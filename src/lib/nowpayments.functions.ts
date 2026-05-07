import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const NP_BASE = "https://api.nowpayments.io/v1";

export const getCryptoCurrencies = createServerFn({ method: "GET" }).handler(async () => {
  // Curated list of widely-used USDT networks + majors. NOWPayments tickers.
  return {
    currencies: [
      { code: "usdttrc20", label: "USDT — TRC20 (Tron)" },
      { code: "usdtbsc", label: "USDT — BEP20 (BNB Chain)" },
      { code: "usdterc20", label: "USDT — ERC20 (Ethereum)" },
      { code: "usdtmatic", label: "USDT — Polygon" },
    ],
  };
});

export const createCryptoPayment = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive().max(10000),
      payCurrency: z.string().min(2).max(20),
      serial: z.string().min(8).max(64),
      email: z.string().email().max(255),
      modelId: z.string().min(1).max(64),
      modelName: z.string().min(1).max(128),
      unlockType: z.enum(["passcode", "icloud"]),
    })
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) throw new Error("Crypto payments not configured");

    // 1) Create a pending registration row to anchor the order_id
    const { data: reg, error: insErr } = await supabaseAdmin
      .from("registrations")
      .insert({
        serial: data.serial.trim().toUpperCase(),
        email: data.email.trim(),
        model_id: data.modelId,
        model_name: data.modelName,
        unlock_type: data.unlockType,
        amount: data.amount,
        payment_method: `crypto:${data.payCurrency}`,
        status: "processing",
        notes: "Awaiting crypto payment",
      })
      .select("id")
      .single();
    if (insErr || !reg) throw new Error(insErr?.message || "Could not create order");

    // 2) Create NOWPayments invoice/payment
    const ipnUrl = `${process.env.SUPABASE_URL ? "" : ""}https://project--43b2e91a-3031-4c5c-ae3a-6280196eb079.lovable.app/api/public/nowpayments-webhook`;
    const res = await fetch(`${NP_BASE}/payment`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: data.amount,
        price_currency: "usd",
        pay_currency: data.payCurrency,
        order_id: reg.id,
        order_description: `${data.modelName} unlock — ${data.serial}`,
        ipn_callback_url: ipnUrl,
      }),
    });
    const json: any = await res.json();
    if (!res.ok || !json?.pay_address) {
      console.error("NOWPayments create failed:", res.status, json);
      // mark registration failed-ish via notes
      await supabaseAdmin.from("registrations").update({
        notes: `Crypto invoice creation failed: ${json?.message || res.status}`,
      }).eq("id", reg.id);
      throw new Error(json?.message || "Failed to create crypto payment");
    }

    await supabaseAdmin.from("registrations").update({
      notes: `NOWPayments payment_id: ${json.payment_id}`,
    }).eq("id", reg.id);

    return {
      registrationId: reg.id,
      paymentId: String(json.payment_id),
      payAddress: String(json.pay_address),
      payAmount: Number(json.pay_amount),
      payCurrency: String(json.pay_currency),
      network: String(json.network ?? ""),
      expiresAt: json.expiration_estimate_date ?? null,
    };
  });

export const getCryptoPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator(z.object({ registrationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("registrations")
      .select("status,notes")
      .eq("id", data.registrationId)
      .maybeSingle();
    return { status: row?.status ?? "processing" };
  });

export const createCardInvoice = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number().positive().max(10000),
      serial: z.string().min(8).max(64),
      email: z.string().email().max(255),
      modelId: z.string().min(1).max(64),
      modelName: z.string().min(1).max(128),
      unlockType: z.enum(["passcode", "icloud"]),
    })
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey) throw new Error("Card payments not configured");

    const origin = "https://project--43b2e91a-3031-4c5c-ae3a-6280196eb079.lovable.app";

    const { data: reg, error: insErr } = await supabaseAdmin
      .from("registrations")
      .insert({
        serial: data.serial.trim().toUpperCase(),
        email: data.email.trim(),
        model_id: data.modelId,
        model_name: data.modelName,
        unlock_type: data.unlockType,
        amount: data.amount,
        payment_method: "card:nowpayments",
        status: "processing",
        notes: "Awaiting card payment via NOWPayments",
      })
      .select("id")
      .single();
    if (insErr || !reg) throw new Error(insErr?.message || "Could not create order");

    const ipnUrl = `${origin}/api/public/nowpayments-webhook`;
    const res = await fetch(`${NP_BASE}/invoice`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: data.amount,
        price_currency: "usd",
        order_id: reg.id,
        order_description: `${data.modelName} unlock — ${data.serial}`,
        ipn_callback_url: ipnUrl,
        success_url: `${origin}/status`,
        cancel_url: `${origin}/`,
        is_fee_paid_by_user: true,
      }),
    });
    const json: any = await res.json();
    if (!res.ok || !json?.invoice_url) {
      console.error("NOWPayments invoice failed:", res.status, json);
      await supabaseAdmin.from("registrations").update({
        notes: `Card invoice creation failed: ${json?.message || res.status}`,
      }).eq("id", reg.id);
      throw new Error(json?.message || "Failed to create card payment");
    }

    await supabaseAdmin.from("registrations").update({
      notes: `NOWPayments invoice_id: ${json.id}`,
    }).eq("id", reg.id);

    return {
      registrationId: reg.id,
      invoiceUrl: String(json.invoice_url),
    };
  });