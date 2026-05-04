import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { MODELS, type DeviceModel } from "@/lib/pricing";

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
  const [method, setMethod] = useState<"paypal" | "card">("paypal");
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [paid, setPaid] = useState(false);

  const model: DeviceModel | null = MODELS.find((m) => m.id === modelId) ?? null;
  const canContinue = serialConfirmed && serial.trim().length >= 10 && email.includes("@") && !!model;

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
            <p className="mt-2 text-xs text-muted-foreground">
              Type or paste your serial, then click Confirm. We do not auto-detect — please pick your model below.
            </p>
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
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("paypal")}
                  className={`rounded-md border p-3 text-left text-sm ${method === "paypal" ? "border-primary" : "border-border"}`}
                >
                  PayPal
                </button>
                <button
                  onClick={() => setMethod("card")}
                  className={`rounded-md border p-3 text-left text-sm ${method === "card" ? "border-primary" : "border-border"}`}
                >
                  Mastercard / Debit card
                </button>
              </div>

              {method === "paypal" && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">
                    You'll be redirected to PayPal to complete a ${model.price} payment.
                  </p>
                  <a
                    href={`https://paypal.me/${PAYPAL_HANDLE}/${model.price}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setPaid(true), 800)}
                    className="inline-block rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
                  >
                    Pay ${model.price} with PayPal
                  </a>
                </div>
              )}

              {method === "card" && (
                <form
                  onSubmit={(e) => { e.preventDefault(); setPaid(true); }}
                  className="space-y-3 text-sm"
                >
                  <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Cardholder name" className="w-full rounded-md bg-input border border-border px-3 py-2" />
                  <input required value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="Card number" inputMode="numeric" maxLength={19} className="w-full rounded-md bg-input border border-border px-3 py-2 font-mono" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" maxLength={5} className="rounded-md bg-input border border-border px-3 py-2 font-mono" />
                    <input required value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="CVC" maxLength={4} className="rounded-md bg-input border border-border px-3 py-2 font-mono" />
                  </div>
                  <button className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">
                    Pay ${model.price} &amp; Register
                  </button>
                </form>
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
              <Link to="/" className="inline-block mt-4 rounded-md border border-border px-4 py-2 text-sm hover:bg-card">
                Back to home
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
