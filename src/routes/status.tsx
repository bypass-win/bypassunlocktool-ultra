import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({ meta: [{ title: "Registration Status — Bypass Unlock" }] }),
});

type Reg = { serial: string; status: string; created_at: string; model_name: string };
type State = "not_found" | "awaiting_payment" | "expired" | "under_review" | "completed" | "failed";

function StatusPage() {
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<{ reg: Reg | null; state: State } | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const r = await fetch(`/api/public/registration-status?serial=${encodeURIComponent(serial.trim().toUpperCase())}`);
    const data = await r.json();
    setResult({ reg: data.registration ?? null, state: (data.state ?? "not_found") as State });
    setLoading(false);
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">Check Registration Status</h1>
      <p className="text-sm text-muted-foreground mb-6">Enter the serial number you registered to see its status.</p>

      <form onSubmit={check} className="border border-border rounded-md p-6 space-y-4">
        <input
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
          placeholder="Device serial number"
          className="w-full rounded-md bg-input border border-border px-3 py-2 font-mono"
          required
          minLength={8}
        />
        <button disabled={loading} className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {result && (result.state === "not_found" || result.state === "expired" || result.state === "failed") && (
        <div className="mt-6 border border-destructive/40 bg-destructive/5 rounded-md p-5">
          <h2 className="font-semibold text-destructive">
            {result.state === "expired"
              ? "Sorry — serial not registered"
              : result.state === "failed"
              ? "Registration failed"
              : "Sorry — serial not registered"}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {result.state === "expired"
              ? "Your payment session expired without a confirmed payment, so this serial is not registered. You can start a new registration any time, or contact support if you already paid."
              : result.state === "failed"
              ? "Your serial number could not be registered. If you already paid, please contact support with your payment receipt."
              : "Your serial number is not registered in our database. If you've already paid, please contact support with your payment receipt."}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Support: <a className="text-primary underline" href="mailto:Bypassunlockpay@outlook.com">Bypassunlockpay@outlook.com</a>
          </p>
        </div>
      )}

      {result?.reg && (result.state === "awaiting_payment" || result.state === "under_review" || result.state === "completed") && (
        <div className="mt-6 border border-border rounded-md p-5">
          <p className="text-sm text-muted-foreground">Serial</p>
          <p className="font-mono">{result.reg.serial}</p>
          <p className="text-sm text-muted-foreground mt-3">Device</p>
          <p>{result.reg.model_name}</p>
          <div className="mt-4">
            {result.state === "completed" && (
              <div className="border border-success/40 bg-success/5 rounded p-4">
                <h3 className="font-semibold text-success">🎉 Congratulations!</h3>
                <p className="text-sm mt-2">
                  Your serial number is registered in our server. You can now bypass your phone using the Bypass Unlock tool.
                </p>
              </div>
            )}
            {result.state === "awaiting_payment" && (
              <div className="border border-warning/40 bg-warning/5 rounded p-4">
                <h3 className="font-semibold text-warning">⏳ Waiting for payment</h3>
                <p className="text-sm mt-2">
                  We're waiting for your payment to arrive on-chain. Please complete the transfer to the address shown on the
                  registration page before the 15-minute timer expires. This status will automatically update once the payment
                  network confirms your transaction.
                </p>
              </div>
            )}
            {result.state === "under_review" && (
              <div className="border border-warning/40 bg-warning/5 rounded p-4">
                <h3 className="font-semibold text-warning">🔍 Payment under review</h3>
                <p className="text-sm mt-2">
                  Your payment has been received by the payment gateway and is currently under review. Final confirmation
                  usually takes a few minutes. Please come back shortly — this page will show approval once it's done.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
