import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MODELS, useMergedModels, type DeviceModel } from "@/lib/pricing";
import { supabase } from "@/integrations/supabase/client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { createPayPalOrder, capturePayPalOrder, getPayPalClientId } from "@/server/paypal.functions";
import {
  createCryptoPayment,
  getCryptoCurrencies,
  getCryptoPaymentStatus,
  createCardInvoice,
} from "@/lib/nowpayments.functions";

export const Route = createFileRoute("/register/$type")({
  component: RegisterPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.type === "passcode" ? "Passcode Unlock" : "iCloud Bypass"} Registration — Bypass Unlock` },
      { name: "description", content: "Register your iPhone or iPad serial number to begin the bypass process." },
    ],
  }),
});

const PAYPAL_HANDLE = "bypassunlock";

function RegisterPage() {
  const { type } = useParams({ from: "/register/$type" });
  const isPasscode = type === "passcode";

  const [serial, setSerial] = useState("");
  const [serialConfirmed, setSerialConfirmed] = useState(false);
  const [email, setEmail] = useState("");
  const [modelId, setModelId] = useState("");
  const [step, setStep] = useState<"form" | "pay">("form");
  const [method, setMethod] = useState<"crypto" | "card" | "paypal">("crypto");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [paid, setPaid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paypalClientId, setPaypalClientId] = useState<string>("");

  // Crypto state
  const [cryptoList, setCryptoList] = useState<{ code: string; label: string }[]>([]);
  const [payCurrency, setPayCurrency] = useState("usdttrc20");
  const [cryptoInvoice, setCryptoInvoice] = useState<null | {
    registrationId: string;
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    network: string;
  }>(null);
  const TTL_SECONDS = 900; // 15 minutes
  const STORAGE_KEY = `crypto_invoice_${type}`;
  const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
  const pollRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const startPolling = (registrationId: string) => {
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(async () => {
      try {
        const s = await getCryptoPaymentStatus({ data: { registrationId } });
        if (s.status === "completed") {
          setPaid(true);
          localStorage.removeItem(STORAGE_KEY);
          if (pollRef.current) window.clearInterval(pollRef.current);
          if (tickRef.current) window.clearInterval(tickRef.current);
        }
      } catch {}
    }, 8000);
  };

  const startTicking = (expiresAt: number) => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    const update = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        if (pollRef.current) window.clearInterval(pollRef.current);
        localStorage.removeItem(STORAGE_KEY);
        setCryptoInvoice(null);
      }
    };
    update();
    tickRef.current = window.setInterval(update, 1000);
  };

  useEffect(() => {
    getPayPalClientId().then((r) => setPaypalClientId(r.clientId));
    getCryptoCurrencies().then((r) => setCryptoList(r.currencies));
    // Restore persisted crypto invoice (survives page refresh)
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.expiresAt && saved.expiresAt > Date.now()) {
          setCryptoInvoice(saved.invoice);
          if (saved.serial) setSerial(saved.serial);
          if (saved.email) setEmail(saved.email);
          if (saved.modelId) setModelId(saved.modelId);
          if (saved.payCurrency) setPayCurrency(saved.payCurrency);
          setSerialConfirmed(true);
          setMethod("crypto");
          setStep("pay");
          startTicking(saved.expiresAt);
          startPolling(saved.invoice.registrationId);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const baseModel: DeviceModel | null = MODELS.find((m) => m.id === modelId) ?? null;
  const model: DeviceModel | null = baseModel
    ? (isPasscode ? { ...baseModel, price: 40 } : baseModel)
    : null;
  const canContinue = serialConfirmed && serial.trim().length >= 10 && email.includes("@") && !!model;

  const submitRegistration = async (paymentMethod: string) => {
    if (!model) return;
    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("registrations").insert({
      serial: serial.trim().toUpperCase(),
      email: email.trim(),
      model_id: model.id,
      model_name: model.name,
      unlock_type: isPasscode ? "passcode" : "icloud",
      amount: model.price,
      payment_method: paymentMethod,
      status: "processing",
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setPaid(true);
  };

  const startCryptoPayment = async () => {
    if (!model) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await createCryptoPayment({
        data: {
          amount: model.price,
          payCurrency,
          serial: serial.trim(),
          email: email.trim(),
          modelId: model.id,
          modelName: model.name,
          unlockType: isPasscode ? "passcode" : "icloud",
        },
      });
      const invoice = {
        registrationId: r.registrationId,
        payAddress: r.payAddress,
        payAmount: r.payAmount,
        payCurrency: r.payCurrency,
        network: r.network,
      };
      setCryptoInvoice(invoice);
      const expiresAt = Date.now() + TTL_SECONDS * 1000;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            invoice,
            expiresAt,
            serial: serial.trim(),
            email: email.trim(),
            modelId: model.id,
            payCurrency,
          })
        );
      } catch {}
      startTicking(expiresAt);
      startPolling(r.registrationId);
    } catch (e: any) {
      setError(e.message || "Could not start crypto payment");
    } finally {
      setSubmitting(false);
    }
  };

  const startCardPayment = async () => {
    if (!model) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await createCardInvoice({
        data: {
          amount: model.price,
          serial: serial.trim(),
          email: email.trim(),
          modelId: model.id,
          modelName: model.name,
          unlockType: isPasscode ? "passcode" : "icloud",
        },
      });
      window.location.href = r.invoiceUrl;
    } catch (e: any) {
      setError(e.message || "Could not start card payment");
      setSubmitting(false);
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">
        {isPasscode ? "Screen Passcode Unlock" : "iCloud Activation Bypass"} — Registration
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Bind your device serial number to a one-time activation license.
      </p>

      <div className="border border-warning/40 rounded-md p-4 mb-6 text-sm">
        <p className="font-semibold text-warning mb-1">Important — please read first</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Verify your device with the Bypass Unlock tool first. The tool must show <span className="text-foreground">Supported</span>.</li>
          <li>If it shows <span className="text-foreground">Unsupported</span>, do not order — wait for the next tool update.</li>
          <li>One payment registers one serial number. No multi-device bypassing.</li>
          <li>Processing takes about 15–30 minutes after payment.</li>
        </ul>
      </div>

      {step === "form" && (
        <div className="border border-border rounded-md p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Device serial number</label>
            <input
              value={serial}
              onChange={(e) => { setSerial(e.target.value.toUpperCase()); setSerialConfirmed(false); }}
              placeholder="Paste serial from the Bypass Unlock tool"
              className="w-full rounded-md bg-input border border-border px-3 py-2 font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setSerialConfirmed(serial.trim().length >= 10)}
              disabled={serial.trim().length < 10}
              className="mt-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-card disabled:opacity-40"
            >
              {serialConfirmed ? "Serial confirmed ✓" : "Confirm serial"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select your device model</label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— Choose your device —</option>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md bg-input border border-border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <button
            disabled={!canContinue}
            onClick={() => setStep("pay")}
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-40"
          >
            Continue to payment
          </button>
        </div>
      )}

      {step === "pay" && model && (
        <div className="border border-border rounded-md p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm text-muted-foreground">
              {model.name} · Serial <span className="font-mono">{serial}</span>
            </p>
            <p className="text-2xl font-bold mt-2">${model.price}</p>
          </div>

          {!paid && (
            <>
              <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-sm mb-2">
                <p className="font-semibold text-warning mb-1">All card & PayPal methods are under maintenance</p>
                <p className="text-muted-foreground">
                  <span className="text-foreground">Maintenance does NOT mean registration is stopped.</span> After you complete payment manually through one of our admins, your serial will be registered the same way. You can come back here and use the <Link to="/status" className="underline">Check status</Link> page to verify your order.
                </p>
                <p className="text-muted-foreground mt-2">
                  For urgent serial registration, contact support directly:
                </p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>Telegram: <a className="text-primary underline" href="https://t.me/BYPASS_UNLOCK_OFFICIAL" target="_blank" rel="noopener noreferrer">@BYPASS_UNLOCK_OFFICIAL</a></li>
                  <li>Telegram: <a className="text-primary underline" href="https://t.me/Bypass_Unlocks" target="_blank" rel="noopener noreferrer">@Bypass_Unlocks</a></li>
                  <li>Email: <a className="text-primary underline" href="mailto:Bypassunlockpay@outlook.com">Bypassunlockpay@outlook.com</a></li>
                  <li>Email: <a className="text-primary underline" href="mailto:Bypassunlockteam@gmail.com">Bypassunlockteam@gmail.com</a></li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  Or use <span className="text-foreground font-medium">Crypto (USDT)</span> below for instant automatic activation.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setMethod("crypto")}
                  className={`rounded-md border p-3 text-left text-sm ${method === "crypto" ? "border-primary" : "border-border"}`}
                >
                  Crypto (USDT, BTC…)
                </button>
                <button
                  onClick={() => setMethod("card")}
                  className={`rounded-md border p-3 text-left text-sm ${method === "card" ? "border-primary" : "border-border"}`}
                >
                  Mastercard / Debit card (maintenance)
                </button>
                <button
                  onClick={() => setMethod("paypal")}
                  className={`rounded-md border p-3 text-left text-sm opacity-60 ${method === "paypal" ? "border-primary" : "border-border"}`}
                >
                  PayPal (maintenance)
                </button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {method === "crypto" && (
                <div className="text-sm space-y-3">
                  {!cryptoInvoice ? (
                    <>
                      <p className="text-muted-foreground">
                        Pay ${model.price} in crypto. Funds are detected on-chain and your order activates automatically.
                      </p>
                      <label className="block font-medium">Choose currency / network</label>
                      <select
                        value={payCurrency}
                        onChange={(e) => setPayCurrency(e.target.value)}
                        className="w-full rounded-md bg-input border border-border px-3 py-2"
                      >
                        {cryptoList.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={startCryptoPayment}
                        disabled={submitting}
                        className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
                      >
                        {submitting ? "Generating address…" : `Generate payment address`}
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-md border border-warning/40 bg-warning/5 p-3 text-xs space-y-1">
                        <p className="font-semibold text-warning">⚠ Important — please read before paying</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>This payment address expires in <span className="text-foreground font-semibold">15 minutes</span>. Complete the full payment before the timer runs out.</li>
                          <li>You must send the <span className="text-foreground">exact amount</span> shown below in one transaction.</li>
                          <li>After paying from your wallet, return to this page — your registration will be activated <span className="text-foreground">automatically</span> once the payment is confirmed on-chain.</li>
                          <li>You can safely refresh this page; the address and timer will stay the same for the full 15 minutes.</li>
                          <li>For any issue with your payment, contact: <a className="text-primary underline" href="mailto:Bypassunlockpay@outlook.com">Bypassunlockpay@outlook.com</a></li>
                        </ul>
                      </div>
                      <div className="rounded-md border border-border p-3">
                        <p className="text-xs text-muted-foreground">Send exactly</p>
                        <p className="text-xl font-bold font-mono">
                          {cryptoInvoice.payAmount} {cryptoInvoice.payCurrency.toUpperCase()}
                        </p>
                        {cryptoInvoice.network && (
                          <p className="text-xs text-muted-foreground mt-1">Network: {cryptoInvoice.network.toUpperCase()}</p>
                        )}
                      </div>
                      <div className="rounded-md border border-border p-3">
                        <p className="text-xs text-muted-foreground mb-1">To this address</p>
                        <p className="font-mono text-xs break-all">{cryptoInvoice.payAddress}</p>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(cryptoInvoice.payAddress)}
                          className="mt-2 rounded-md border border-border px-3 py-1 text-xs hover:bg-card"
                        >
                          Copy address
                        </button>
                      </div>
                      <div className="flex items-center justify-center">
                        <img
                          alt="Payment QR code"
                          className="rounded-md border border-border"
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cryptoInvoice.payAddress)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Address expires in</p>
                        <p className={`text-lg font-mono ${secondsLeft < 60 ? "text-destructive" : ""}`}>{mm}:{ss}</p>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Waiting for on-chain confirmation… this page will update automatically when payment is detected.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {method === "paypal" && (
                <div className="text-sm">
                  <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-center">
                    <p className="font-semibold text-warning mb-1">PayPal is under maintenance</p>
                    <p className="text-muted-foreground">
                      Our PayPal payment method is temporarily unavailable. Contact support to register your serial manually, or use Crypto (USDT) for instant activation.
                    </p>
                    <div className="flex flex-col gap-1 mt-3 text-xs">
                      <a className="text-primary underline" href="https://t.me/BYPASS_UNLOCK_OFFICIAL" target="_blank" rel="noopener noreferrer">Telegram: @BYPASS_UNLOCK_OFFICIAL</a>
                      <a className="text-primary underline" href="https://t.me/Bypass_Unlocks" target="_blank" rel="noopener noreferrer">Telegram: @Bypass_Unlocks</a>
                      <a className="text-primary underline" href="mailto:Bypassunlockpay@outlook.com">Bypassunlockpay@outlook.com</a>
                      <a className="text-primary underline" href="mailto:Bypassunlockteam@gmail.com">Bypassunlockteam@gmail.com</a>
                    </div>
                    <button
                      onClick={() => setMethod("crypto")}
                      className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Switch to Crypto payment
                    </button>
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="text-sm">
                  <div className="rounded-md border border-warning/40 bg-warning/5 p-4 text-center">
                    <p className="font-semibold text-warning mb-1">Card payments are under maintenance</p>
                    <p className="text-muted-foreground">
                      Mastercard / Visa / Debit card payments are temporarily unavailable.
                      Contact our support on Telegram or Email for urgent manual registration, or use Crypto (USDT) for instant activation.
                    </p>
                    <div className="flex flex-col gap-1 mt-3 text-xs">
                      <a className="text-primary underline" href="https://t.me/BYPASS_UNLOCK_OFFICIAL" target="_blank" rel="noopener noreferrer">Telegram: @BYPASS_UNLOCK_OFFICIAL</a>
                      <a className="text-primary underline" href="https://t.me/Bypass_Unlocks" target="_blank" rel="noopener noreferrer">Telegram: @Bypass_Unlocks</a>
                      <a className="text-primary underline" href="mailto:Bypassunlockpay@outlook.com">Bypassunlockpay@outlook.com</a>
                      <a className="text-primary underline" href="mailto:Bypassunlockteam@gmail.com">Bypassunlockteam@gmail.com</a>
                    </div>
                    <button
                      onClick={() => setMethod("crypto")}
                      className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Switch to Crypto payment
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {paid && (
            <div className="border border-success/40 rounded-md p-5 text-sm">
              <h3 className="font-semibold mb-2">Registration submitted</h3>
              <p className="text-muted-foreground mb-3">
                Your serial <span className="font-mono text-foreground">{serial}</span> has been queued.
                The server will register your device in 15–30 minutes. After that, the Bypass Unlock tool
                will detect your device automatically — connect via USB and complete the bypass in 1 click.
              </p>
              <p className="text-xs text-muted-foreground">A confirmation will be sent to {email}.</p>
              <div className="flex gap-2 mt-4">
                <Link to="/status" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Check status</Link>
                <Link to="/" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-card">Home</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
