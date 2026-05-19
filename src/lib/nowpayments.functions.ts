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
    
    // Debug logging (will appear in Netlify function logs)
    console.log("[NowPayments] Creating crypto payment...");
    console.log("[NowPayments] API Key present:", !!apiKey);
    console.log("[NowPayments] API Key length:", apiKey?.length || 0);
    console.log("[NowPayments] Payment amount:", data.amount, "Currency:", data.payCurrency);
    
    if (!apiKey) {
      const errorMsg = "Crypto payments not configured - NOWPAYMENTS_API_KEY is missing from environment variables";
      console.error("[NowPayments]", errorMsg);
      throw new Error(errorMsg);
    }

    if (apiKey.trim().length === 0) {
      const errorMsg = "Crypto payments not configured - NOWPAYMENTS_API_KEY is empty";
      console.error("[NowPayments]", errorMsg);
      throw new Error(errorMsg);
    }

    // 1) Create a pending registration row to anchor the order_id
    // IMPORTANT: Set status to "pending" NOT "processing"
    // Only change to "processing" when webhook confirms payment
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
        status: "pending",
        notes: "Payment address generated - awaiting payment on blockchain",
      })
      .select("id")
      .single();
    
    if (insErr || !reg) {
      const errorMsg = insErr?.message || "Could not create order";
      console.error("[NowPayments] Registration insert error:", errorMsg);
      throw new Error(errorMsg);
    }

    console.log("[NowPayments] Registration created:", reg.id);

    // 2) Create NOWPayments invoice/payment
    const origin = process.env.SITE_URL || "https://bypassunlock.online";
    const ipnUrl = `${origin}/api/public/nowpayments-webhook`;
    
    console.log("[NowPayments] Making request to:", `${NP_BASE}/payment`);
    console.log("[NowPayments] IPN URL:", ipnUrl);
    
    const res = await fetch(`${NP_BASE}/payment`, {
      method: "POST",
      headers: { 
        "x-api-key": apiKey.trim(), 
        "Content-Type": "application/json" 
      },
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
    
    console.log("[NowPayments] Response status:", res.status);
    console.log("[NowPayments] Response body:", JSON.stringify(json));
    
    if (!res.ok || !json?.pay_address) {
      const errorMsg = json?.message || `Failed with status ${res.status}`;
      console.error("[NowPayments] API error:", errorMsg);
      
      // mark registration failed-ish via notes
      await supabaseAdmin.from("registrations").update({
        status: "failed",
        notes: `Crypto invoice creation failed: ${errorMsg}`,
      }).eq("id", reg.id);
      
      throw new Error(errorMsg);
    }

    // Store the payment_id from NOWPayments for tracking
    await supabaseAdmin.from("registrations").update({
      notes: `NOWPayments payment_id: ${json.payment_id} | Awaiting blockchain confirmation`,
    }).eq("id", reg.id);

    console.log("[NowPayments] Payment created successfully:", json.payment_id);

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
    return { status: row?.status ?? "pending" };
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
    
    console.log("[NowPayments] Creating card invoice...");
    console.log("[NowPayments] API Key present:", !!apiKey);
    
    if (!apiKey) throw new Error("Card payments not configured");

    const origin = process.env.SITE_URL || "https://bypassunlock.online";

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
        status: "pending",
        notes: "Card payment invoice generated - awaiting payment",
      })
      .select("id")
      .single();
    if (insErr || !reg) throw new Error(insErr?.message || "Could not create order");

    const ipnUrl = `${origin}/api/public/nowpayments-webhook`;
    const res = await fetch(`${NP_BASE}/invoice`, {
      method: "POST",
      headers: { 
        "x-api-key": apiKey.trim(), 
        "Content-Type": "application/json" 
      },
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
    
    console.log("[NowPayments Card] Response status:", res.status);
    console.log("[NowPayments Card] Response body:", JSON.stringify(json));
    
    if (!res.ok || !json?.invoice_url) {
      const errorMsg = json?.message || `Failed with status ${res.status}`;
      console.error("[NowPayments Card] API error:", errorMsg);
      await supabaseAdmin.from("registrations").update({
        status: "failed",
        notes: `Card invoice creation failed: ${errorMsg}`,
      }).eq("id", reg.id);
      throw new Error(errorMsg);
    }

    await supabaseAdmin.from("registrations").update({
      notes: `NOWPayments invoice_id: ${json.id}`,
    }).eq("id", reg.id);

    return {
      registrationId: reg.id,
      invoiceUrl: String(json.invoice_url),
    };
  });
