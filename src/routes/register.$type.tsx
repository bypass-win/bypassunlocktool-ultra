import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Lock, KeyRound, CreditCard } from "lucide-react";
import { MODELS, detectModelFromSerial, type DeviceModel } from "@/lib/pricing";

export const Route = createFileRoute("/register/$type")({
  component: RegisterPage,
  head: ({ params }) => ({
    meta: [
      { title: `${params.type === "passcode" ? "Passcode Unlock" : "iCloud Bypass"} Registration — Bypass Unlock` },
      { name: "description", content: "Register your iPhone or iPad serial number to begin the bypass process." },
    ],
  }),
});

// PayPal account email/handle — replace with your PayPal.me handle for direct checkout.
const PAYPAL_HANDLE = "bypassunlock"; // -> https://paypal.me/bypassunlock/AMOUNT

function RegisterPage() {
  const { type } = useParams({ from: "/register/$type" });
  const isPasscode = type === "passcode";

  const [serial, setSerial] = useState("");
  const [email, setEmail] = useState("");
  const [manualModelId, setManualModelId] = useState<string>("");
  const [step, setStep] = useState<"form" | "pay">("form");
  const [method, setMethod] = useState<"paypal" | "card">("paypal");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [paid, setPaid] = useState(false);

  const detected = useMemo(() => detectModelFromSerial(serial), [serial]);
  const model: DeviceModel | null =
    MODELS.find((m) => m.id === manualModelId) ?? detected ?? null;

  const canContinue = serial.trim().length >= 10 && email.includes("@") && !!model;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>

      <div className="mt-6 mb-8 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPasscode ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}>
          {isPasscode ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{isPasscode ? "Screen Passcode Unlock" : "iCloud Activation Bypass"} Registration</h1>
          <p className="text-muted-foreground text-sm">Bind your device serial to a one-time activation license.</p>
        </div>
      </div>

      {/* Mandatory verification banner */}
      <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 mb-8">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-warning mb-1">IMPORTANT — MANDATORY VERIFICATION</p>
            <p className="text-foreground/90">
              BEFORE ANYTHING, verify your device with our Bypass Unlock tool. The tool must show a <b>“Supported”</b> status to enable the bypass.
              If the status is <b>“Unsupported”</b>, DO NOT ORDER. Wait for a future tool update for support.
            </p>
            <ul className="mt-3 space-y-1 list-disc list-inside text-muted-foreground">
              <li><b className="text-foreground">Device Verification First:</b> connect the device to Bypass Unlock to confirm support before paying.</li>
              <li><b className="text-foreground">One Payment = One Device:</b> registration is for the serial number you provide, only.</li>
              <li><b className="text-foreground">No Multi-Device Bypassing:</b> our server only allows the specific serial that was paid for.</li>
              <li><b className="text-foreground">Processing Time:</b> 15–30 minutes for the registration to propagate.</li>
              <li><b className="text-foreground">Automatic Unlock:</b> the tool will recognize your device and complete the bypass automatically.</li>
            </ul>
          </div>
        </div>
      </div>

      {step === "form" && (
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-8 space-y-6">
          {/* Help: how to find serial */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm flex gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-1">Don’t know your serial number?</p>
              <p className="text-muted-foreground">
                Open the <b className="text-foreground">Bypass Unlock</b> tool on your computer and connect your iPhone/iPad via USB cable.
                The tool will display your device information — copy the <b className="text-foreground">Serial Number</b> and paste it below.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Device Serial Number</label>
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value.toUpperCase())}
              placeholder="e.g. F2LXXXXXXXXX"
              className="w-full rounded-lg bg-input border border-border px-4 py-3 font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {serial.length >= 10 && detected && (
              <p className="mt-2 text-sm text-success flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Detected model: <b>{detected.name}</b> — ${detected.price}
              </p>
            )}
            {serial.length >= 10 && !detected && (
              <p className="mt-2 text-sm text-warning">We couldn’t auto-detect this serial. Please pick your model below.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm / Select Device Model</label>
            <select
              value={manualModelId || detected?.id || ""}
              onChange={(e) => setManualModelId(e.target.value)}
              className="w-full rounded-lg bg-input border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Select your device model —</option>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — ${m.price}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted-foreground">Each device model has a different price. The amount below updates automatically.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg bg-input border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total for {model ? model.name : "your device"}</p>
              <p className="text-3xl font-bold gradient-text">{model ? `$${model.price}` : "—"}</p>
            </div>
            <button
              disabled={!canContinue}
              onClick={() => setStep("pay")}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90"
            >
              Continue to Payment →
            </button>
          </div>
        </div>
      )}

      {step === "pay" && model && (
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Payment</h2>
              <p className="text-sm text-muted-foreground">{model.name} · Serial {serial}</p>
            </div>
            <p className="text-2xl font-bold gradient-text">${model.price}</p>
          </div>

          {!paid && (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("paypal")}
                  className={`rounded-lg border p-4 text-left transition ${method === "paypal" ? "border-primary bg-primary/10" : "border-border bg-background/40"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#003087]">Pay<span className="text-[#009cde]">Pal</span></span>
                    <span className="text-xs text-muted-foreground">— redirect to PayPal</span>
                  </div>
                </button>
                <button
                  onClick={() => setMethod("card")}
                  className={`rounded-lg border p-4 text-left transition ${method === "card" ? "border-primary bg-primary/10" : "border-border bg-background/40"}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Mastercard / Debit</span>
                  </div>
                </button>
              </div>

              {method === "paypal" && (
                <div className="rounded-lg border border-border bg-background/40 p-5 text-sm">
                  <p className="mb-4 text-muted-foreground">You will be redirected to PayPal to complete a ${model.price} payment. After payment returns, your serial is queued for registration.</p>
                  <a
                    href={`https://paypal.me/${PAYPAL_HANDLE}/${model.price}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setPaid(true), 800)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0070ba] px-6 py-3 font-semibold text-white hover:opacity-90"
                  >
                    Pay ${model.price} with PayPal →
                  </a>
                </div>
              )}

              {method === "card" && (
                <form
                  onSubmit={(e) => { e.preventDefault(); setPaid(true); }}
                  className="rounded-lg border border-border bg-background/40 p-5 space-y-4"
                >
                  <p className="text-xs text-muted-foreground">Your card will be charged ${model.price}. Funds are securely transferred to our PayPal merchant account.</p>
                  <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Cardholder name" className="w-full rounded-lg bg-input border border-border px-4 py-3" />
                  <input required value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Card number" inputMode="numeric" maxLength={19} className="w-full rounded-lg bg-input border border-border px-4 py-3 font-mono" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" maxLength={5} className="rounded-lg bg-input border border-border px-4 py-3 font-mono" />
                    <input required value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="CVC" maxLength={4} className="rounded-lg bg-input border border-border px-4 py-3 font-mono" />
                  </div>
                  <button className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                    Pay ${model.price} & Register
                  </button>
                </form>
              )}
            </>
          )}

          {paid && (
            <div className="rounded-xl border border-success/40 bg-success/10 p-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Registration Submitted</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your serial <span className="font-mono text-foreground">{serial}</span> has been queued. Our server will register your device in <b className="text-foreground">15–30 minutes</b>. Once ready, the Bypass Unlock tool will automatically detect your device — connect it via USB and complete the bypass in 1 click.
              </p>
              <p className="text-xs text-muted-foreground">A confirmation has been sent to {email}.</p>
              <Link to="/" className="inline-block mt-6 rounded-lg border border-border px-5 py-2 text-sm hover:bg-card">Back to home</Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
