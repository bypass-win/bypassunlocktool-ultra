import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEFAULTS, parseAdScripts, type AdScript } from "@/lib/settings";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Bypass Unlock" }, { name: "robots", content: "noindex" }] }),
});

const SESSION_KEY = "bu_admin_ok";

const STATUSES = ["pending", "processing", "completed", "failed"];

const SECTIONS: Record<string, string[]> = {
  "Windows app": ["app_version", "app_min_version", "app_update_url", "download_url_windows", "app_update_notes"],
  "macOS app": ["mac_app_version", "mac_app_min_version", "mac_app_update_url", "download_url_mac", "mac_app_update_notes"],
  "Site": ["payments_enabled", "telegram_url", "contact_email", "website_url", "tool_version"],
};

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((j) => { if (j.authenticated) { sessionStorage.setItem(SESSION_KEY, "1"); setAuthed(true); } })
      .catch(() => {});
  }, []);

  if (!authed) {
    return (
      <main className="max-w-sm mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
        <h1 className="text-2xl font-bold mt-4 mb-6">Admin login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetch("/api/admin/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: u, password: p }),
            })
              .then(async (r) => {
                const j = await r.json();
                if (!r.ok) throw new Error(j.error || "Invalid credentials");
                sessionStorage.setItem(SESSION_KEY, "1");
                setAuthed(true);
              })
              .catch((error) => setErr(error.message));
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

  return <Dashboard onLogout={() => { fetch("/api/admin/session", { method: "DELETE" }); sessionStorage.removeItem(SESSION_KEY); setAuthed(false); }} />;
}

async function apiSave(key: string, value: string) {
  const r = await fetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Save failed");
}

async function apiRegistrations(method: "GET" | "POST" | "PATCH" | "DELETE", body?: unknown) {
  const r = await fetch("/api/admin/registrations", {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Registration request failed");
  return j;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const r = await fetch("/api/admin/settings");
      const data = await r.json();
      if (!r.ok) {
        setError(`Settings: ${data.error}`);
        setSettings({ ...DEFAULTS });
      } else {
        setSettings({ ...DEFAULTS, ...data });
      }

      const orderData = await apiRegistrations("GET");
      setRegistrations(orderData.registrations ?? []);
    } catch (e: any) {
      setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await apiSave(key, value);
      setSaved(key);
      setTimeout(() => setSaved(""), 1500);
      setSettings((s) => ({ ...s, [key]: value }));
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Loading…</p>
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

      {Object.entries(SECTIONS).map(([section, keys]) => (
        <section key={section} className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{section}</h2>
          <div className="space-y-3 max-w-3xl">
            {keys.map((key) => (
              <SettingRow
                key={key}
                k={key}
                value={settings[key] ?? ""}
                onChange={(v: string) => setSettings({ ...settings, [key]: v })}
                onSave={() => saveSetting(key, settings[key] ?? "")}
                saved={saved === key}
              />
            ))}
          </div>
        </section>
      ))}

      <AdsManager
        value={settings.custom_ad_scripts ?? "[]"}
        onSaved={(v) => { setSettings({ ...settings, custom_ad_scripts: v }); }}
        onError={setError}
      />

      <ManualRegistration onAdded={loadAll} onError={setError} />

      <OrdersTable rows={registrations} onChanged={loadAll} onError={setError} />
    </main>
  );
}

function SettingRow({ k, value, onChange, onSave, saved }: any) {
  if (k === "payments_enabled") {
    return (
      <div className="border border-border rounded-md p-3 flex items-center justify-between gap-3">
        <label className="text-sm font-medium">{k}</label>
        <select
          value={value}
          onChange={(e) => { onChange(e.target.value); setTimeout(onSave, 0); }}
          className="rounded bg-input border border-border px-3 py-2 text-sm"
        >
          <option value="true">Open (true)</option>
          <option value="false">Closed (false)</option>
        </select>
      </div>
    );
  }
  const isLong = k.endsWith("_notes");
  return (
    <div className="border border-border rounded-md p-3">
      <label className="block text-sm font-medium mb-2">{k}</label>
      <div className="flex gap-2">
        {isLong ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="flex-1 rounded bg-input border border-border px-3 py-2 text-sm font-mono"
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded bg-input border border-border px-3 py-2 text-sm font-mono"
          />
        )}
        <button onClick={onSave} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
      </div>
      {saved && <p className="text-xs text-success mt-2">Saved ✓</p>}
    </div>
  );
}

function AdsManager({ value, onSaved, onError }: { value: string; onSaved: (v: string) => void; onError: (e: string) => void }) {
  const [ads, setAds] = useState<AdScript[]>(() => parseAdScripts(value));

  useEffect(() => { setAds(parseAdScripts(value)); }, [value]);

  const persist = async (next: AdScript[]) => {
    const v = JSON.stringify(next);
    try {
      await apiSave("custom_ad_scripts", v);
      setAds(next);
      onSaved(v);
    } catch (e: any) {
      onError(e.message);
    }
  };

  const update = (i: number, patch: Partial<AdScript>) => {
    const next = ads.map((a, idx) => (idx === i ? { ...a, ...patch } : a));
    setAds(next);
  };

  const add = () => {
    const next = [...ads, { id: `ad_${Date.now()}`, name: "New ad", enabled: true, placement: "head" as const, html: "" }];
    setAds(next);
  };

  const remove = (i: number) => {
    const next = ads.filter((_, idx) => idx !== i);
    persist(next);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Ad scripts</h2>
        <button onClick={add} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">+ Add ad</button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Paste any ad network script (HilltopAds, Adsterra, Google AdSense, etc.). Toggle enabled to show/hide. Changes apply site-wide.</p>
      <div className="space-y-3 max-w-3xl">
        {ads.length === 0 && <p className="text-sm text-muted-foreground">No ads configured.</p>}
        {ads.map((ad, i) => (
          <div key={ad.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={ad.name}
                onChange={(e) => update(i, { name: e.target.value })}
                placeholder="Name"
                className="flex-1 min-w-[160px] rounded bg-input border border-border px-3 py-1.5 text-sm"
              />
              <select
                value={ad.placement}
                onChange={(e) => update(i, { placement: e.target.value as "head" | "body" })}
                className="rounded bg-input border border-border px-2 py-1.5 text-sm"
              >
                <option value="head">head</option>
                <option value="body">body</option>
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input type="checkbox" checked={ad.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
                Enabled
              </label>
            </div>
            <textarea
              value={ad.html}
              onChange={(e) => update(i, { html: e.target.value })}
              rows={4}
              placeholder="<script>...</script>"
              className="w-full rounded bg-input border border-border px-3 py-2 text-xs font-mono"
            />
            <div className="flex gap-2">
              <button onClick={() => persist(ads)} className="rounded bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">Save</button>
              <button onClick={() => remove(i)} className="rounded bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManualRegistration({ onAdded, onError }: { onAdded: () => void; onError: (e: string) => void }) {
  const [form, setForm] = useState({
    email: "",
    serial: "",
    model_id: "manual",
    model_name: "",
    unlock_type: "icloud",
    amount: "0",
    status: "completed",
    payment_method: "manual",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.serial.length < 8) { onError("Serial must be at least 8 characters"); return; }
    setBusy(true);
    try {
      await apiRegistrations("POST", {
        email: form.email,
        serial: form.serial,
        model_id: form.model_id || "manual",
        model_name: form.model_name || form.model_id || "manual",
        unlock_type: form.unlock_type,
        amount: Number(form.amount) || 0,
        status: form.status as any,
        payment_method: form.payment_method,
        notes: form.notes || null,
      });
      setOk(true);
      setTimeout(() => setOk(false), 1500);
      setForm({ ...form, email: "", serial: "", notes: "" });
      onAdded();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Add registration manually</h2>
      <form onSubmit={submit} className="border border-border rounded-md p-4 max-w-3xl grid sm:grid-cols-2 gap-3">
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm" />
        <input required placeholder="Serial (min 8 chars)" value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm font-mono" />
        <input placeholder="Model ID" value={form.model_id} onChange={(e) => setForm({ ...form, model_id: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm" />
        <input placeholder="Model name" value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm" />
        <select value={form.unlock_type} onChange={(e) => setForm({ ...form, unlock_type: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm">
          <option value="icloud">iCloud</option>
          <option value="passcode">Passcode</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input placeholder="Payment method" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="rounded bg-input border border-border px-3 py-2 text-sm" />
        <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="sm:col-span-2 rounded bg-input border border-border px-3 py-2 text-sm" />
        <button disabled={busy} type="submit" className="sm:col-span-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {busy ? "Adding…" : ok ? "Added ✓" : "Add registration"}
        </button>
      </form>
    </section>
  );
}

function OrdersTable({ rows, onChanged, onError }: { rows: any[]; onChanged: () => void; onError: (e: string) => void }) {
  const setStatus = async (id: string, status: string) => {
    try {
      await apiRegistrations("PATCH", { id, status });
      onChanged();
    } catch (e: any) {
      onError(e.message);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    try {
      await apiRegistrations("DELETE", { id });
      onChanged();
    } catch (e: any) {
      onError(e.message);
    }
  };

  return (
    <section className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Orders</h2>
      {rows.length === 0 ? (
        <div className="p-4 bg-card rounded-md text-sm text-muted-foreground">No orders yet.</div>
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
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{o.email}</td>
                  <td className="px-3 py-2 font-mono">{o.serial}</td>
                  <td className="px-3 py-2">{o.model_name}</td>
                  <td className="px-3 py-2">{o.unlock_type}</td>
                  <td className="px-3 py-2">${o.amount}</td>
                  <td className="px-3 py-2">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      className="rounded bg-input border border-border px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => remove(o.id)} className="text-xs text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
