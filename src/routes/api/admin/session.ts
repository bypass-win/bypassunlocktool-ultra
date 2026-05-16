import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { clearAdminCookie, createAdminCookie, isAdminRequest, validateAdminLogin } from "@/lib/admin-auth.server";

const LoginSchema = z.object({ username: z.string(), password: z.string() });

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
  });
}

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => json({ authenticated: isAdminRequest(request) }),

      POST: async ({ request }) => {
        try {
          const { username, password } = LoginSchema.parse(await request.json());
          if (!validateAdminLogin(username, password)) return json({ error: "Invalid credentials" }, 401);
          return json({ success: true }, 200, { "Set-Cookie": createAdminCookie() });
        } catch (e: any) {
          return json({ error: e.message || "Login failed" }, 400);
        }
      },

      DELETE: async () => json({ success: true }, 200, { "Set-Cookie": clearAdminCookie() }),
    },
  },
});