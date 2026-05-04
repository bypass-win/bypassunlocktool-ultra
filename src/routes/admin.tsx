import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Bypass Unlock" }] }),
});

type Reg = {
  id: string;
  serial: string;
  email: string;
  model_name: string;
  unlock_type: string;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
};

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "settings">("orders");
  const [regs, setRegs] = useState<Reg[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/auth" });
  }, [user, isAdmin, loading, navigate]);

  const loadRegs = async () => {
    const { data } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
    if (data) setRegs(data as Reg[]);
  };
  const loadSettings = async () => {
    const { data } = await supabase.from("site_settings").select("key,value");
    if (data) {
      const m: Record<string, string> = {};
      data.forEach((r: any) => { m[r.key] = r.value; });
      setSettings(m);
    }
  };

  useEffect(() => { if (isAdmin) { loadRegs(); loadSettings(); } }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("registrations").update({ status }).eq("id", id);
    loadRegs();
  };
  const deleteReg = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    await supabase.from("registrations").delete().eq("id", id);
    loadRegs();
  };
  const saveSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value });
    setSaved(key);
    setTimeout(() => setSaved(""), 1500);
  };

  if (loading) return <main className="max-w-5xl mx-auto p-6">Loading…</main>;
  if (!isAdmin) return null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 border-b border-border">
        <button onClick={() => setTab("orders")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "orders" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>Orders & Payments</button>
        <button onClick={() => setTab("settings")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "settings" ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>Site Settings</button>
      </div>

      {tab === "orders" && (
        <div className="overflow-x-auto border border-border rounded-md">
          <table className="w-full text-sm">
            <thead className="bg-card">
              <tr className="text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Serial</th>
                <th className="p-3">Email</th>
                <th className="p-3">Device</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regs.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">No registrations yet</td></tr>}
              {regs.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="p-3 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-3 font-mono text-xs">{r.serial}</td>
                  <td className="p-3 text-xs">{r.email}</td>
                  <td className="p-3 text-xs">{r.model_name}</td>
                  <td className="p-3 text-xs">{r.unlock_type}</td>
                  <td className="p-3">${r.amount}</td>
                  <td className="p-3 text-xs">{r.payment_method ?? "—"}</td>
                  <td className="p-3">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded bg-input border border-border px-2 py-1 text-xs">
                      <option value="pending">pending</option>
                      <option value="processing">processing</option>
                      <option value="completed">completed</option>
                      <option value="failed">failed</option>
                    </select>
                  </td>
                  <td className="p-3"><button onClick={() => deleteReg(r.id)} className="text-xs text-destructive hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl">
          {Object.entries(settings).map(([key, value]) => (
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
          ))}
        </div>
      )}
    </main>
  );
}
