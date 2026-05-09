// src/routes/admin.tsx - UPDATED VERSION
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Bypass Unlock" }, { name: "robots", content: "noindex" }] }),
});

const ADMIN_USER = "Eyoba@42";
const ADMIN_PASS = "Eyoba@2772";
const SESSION_KEY = "bu_admin_ok";

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
  const [tab, setTab] = useState<"orders" | "settings">("settings");
  const [regs, setRegs] = useState<Reg[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegs = async () => {
    try {
      const { data, error: err } = await supabase.from("registrations").select("*").order("created_at", { ascending: false });
      if (err) {
        console.error("Error loading registrations:", err);
        setError(`Failed to load registrations: ${err.message}`);
        return;
      }
      if (data) setRegs(data as Reg[]);
    } catch (e) {
      console.error("Exception loading registrations:", e);
      setError(`Exception loading registrations: ${String(e)}`);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error: err } = await supabase.from("site_settings").select("key,value");
      if (err) {
        console.error("Error loading settings:", err);
        setError(`Failed to load settings: ${err.message}`);
        setLoading(false);
        return;
      }
      if (data && data.length > 0) {
        const m: Record<string, string> = {};
        data.forEach((r: any) => { m[r.key] = r.value; });
        setSettings(m);
        console.log("Settings loaded:", m);
      } else {
        console.warn("No settings found in database");
        setError("No settings found. Please check your database.");
      }
      setLoading(false);
    } catch (e) {
      console.error("Exception loading settings:", e);
      setError(`Exception loading settings: ${String(e)}`);
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadSettings(); 
    loadRegs(); 
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error: err } = await supabase.from("registrations").update({ status: status as "pending" | "processing" | "completed" | "failed" }).eq("id", id);
      if (err) {
        console.error("Error updating status:", err);
        setError(`Failed to update status: ${err.message}`);
        return;
      }
      loadRegs();
    } catch (e) {
      console.error("Exception updating status:", e);
      setError(`Exception updating status: ${String(e)}`);
    }
  };

  const deleteReg = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    try {
      const { error: err } = await supabase.from("registrations").delete().eq("id", id);
      if (err) {
        console.error("Error deleting registration:", err);
        setError(`Failed to delete registration: ${err.message}`);
        return;
      }
      loadRegs();
    } catch (e) {
      console.error("Exception deleting registration:", e);
      setError(`Exception deleting registration: ${String(e)}`);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      const { error: err } = await supabase.from("site_settings").upsert({ key, value });
      if (err) {
        console.error("Error saving setting:", err);
        setError(`Failed to save setting: ${err.message}`);
        return;
      }
      setSaved(key);
      setTimeout(() => setSaved(""), 1500);
      loadSettings();
    } catch (e) {
      console.error("Exception saving setting:", e);
      setError(`Exception saving setting: ${String(e)}`);
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
        <p className="text-muted-foreground">Loading...</p>
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
              {regs.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">No registrations yet

