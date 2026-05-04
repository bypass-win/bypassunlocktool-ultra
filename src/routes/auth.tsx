import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — Bypass Unlock" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: any) {
      setError(e.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">{mode === "login" ? "Sign in" : "Create account"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 border border-border rounded-md p-6">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md bg-input border border-border px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-md bg-input border border-border px-3 py-2"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-md border border-border px-4 py-2 font-medium hover:bg-card"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "login" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
