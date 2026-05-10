import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULTS } from "@/lib/settings";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Bypass Unlock" }, { name: "robots", content: "noindex" }] }),
});

const ADMIN_USER = "Eyoba@42";
const ADMIN_PASS = "Eyoba@2772";
const SESSION_KEY = "bu_admin_ok";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <main className="max-w-sm mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Admin login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (u === ADMIN_USER && p === ADMIN_PASS) {
              sessionStorage.setItem(SESSION_KEY, "1");
              setAuthed(true);
            } else setErr("Invalid credentials");
          }}
          className="space-y-3 border border-border rounded-md p-6"
        >
          <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Username" className="w-full rounded-md bg-input border border-border px-3 py-2" />
          <input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="Password" className="w-full rounded-md bg-input border border-border px-3 py-2" />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button type="submit" className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Sign in</button>
        </form>
      </main>
    );
  }

  return <Dashboard onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("site_settings")
        .select("key,value");

      if (err) {
        setError(`Error: ${err.message}`);
      } else {
        const m: Record<string, string> = { ...DEFAULTS };
        (data ?? []).forEach((r: any) => { m[r.key] = r.value; });
        setSettings(m);
      }

      const { data: orderData, error: orderErr } = await supabase
        .from("registrations")
        .select("id,created_at,email,serial,model_name,unlock_type,amount,status,payment_method,notes")
        .order("created_at", { ascending: false })
        .limit(100);

      if (orderErr) setError(`Orders error: ${orderErr.message}`);
      else setRegistrations(orderData ?? []);
    } catch (e: any) {
      setError(`Error: ${e.message}`);
      setSettings({ ...DEFAULTS });
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      const { error: err } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });

      if (err) {
        setError(`Error: ${err.message}`);
        return;
      }

      setSaved(key);
      setTimeout(() => setSaved(""), 1500);
      await loadSettings();
    } catch (e: any) {
      setError(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
          <button onClick={onLogout} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
        <h1 className="text-2xl font-bold mt-4 mb-6">Admin Dashboard</h1>
        <p className="text-muted-foreground">Loading settings...</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <button onClick={onLogout} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
      </div>
      <h1 className="text-2xl font-bold mt-4 mb-6">Admin Dashboard</h1>

      {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}

      <h2 className="text-xl font-semibold mb-3">Site settings</h2>
      <div className="space-y-4 max-w-2xl">
        {Object.entries(settings).length === 0 ? (
          <div className="p-4 bg-card rounded-md text-sm text-muted-foreground">No settings available.</div>
        ) : (
          Object.entries(settings).map(([key, value]) => (
            <div key={key} className="border border-border rounded-md p-4">
              <label className="block text-sm font-medium mb-2">{key}</label>
              {key === "payments_enabled" ? (
                <select
                  value={value}
                  onChange={(e) => { setSettings({ ...settings, [key]: e.target.value }); saveSetting(key, e.target.value); }}
                  className="rounded bg-input border border-border px-3 py-2 text-sm"
                >
                  <option value="true">Open (true)</option>
                  <option value="false">Closed (false)</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={value}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                    className="flex-1 rounded bg-input border border-border px-3 py-2 text-sm font-mono"
                  />
                  <button onClick={() => saveSetting(key, settings[key])} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
                </div>
              )}
              {saved === key && <p className="text-xs text-success mt-2">Saved ✓</p>}
            </div>
          ))
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Orders</h2>
        {registrations.length === 0 ? (
          <div className="p-4 bg-card rounded-md text-sm text-muted-foreground">No orders available.</div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Email</th>
                  <th className="px-3 py-2 text-left">Serial</th>
                  <th className="px-3 py-2 text-left">Model</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{order.email}</td>
                    <td className="px-3 py-2 font-mono">{order.serial}</td>
                    <td className="px-3 py-2">{order.model_name}</td>
                    <td className="px-3 py-2">{order.unlock_type}</td>
                    <td className="px-3 py-2">${order.amount}</td>
                    <td className="px-3 py-2">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
