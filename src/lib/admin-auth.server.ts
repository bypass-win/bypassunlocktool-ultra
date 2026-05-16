import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "bu_admin_session";
const ADMIN_USER = process.env.ADMIN_USER ?? "Eyoba@42";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "Eyoba@2772";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "bypassunlock-admin-session";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function parseCookies(header: string | null) {
  return Object.fromEntries((header ?? "").split(";").map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, value.join("=")];
  }).filter(([key]) => key));
}

export function isAdminRequest(request: Request) {
  const token = parseCookies(request.headers.get("cookie"))[COOKIE_NAME];
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.admin === true && Number(session.exp) > Date.now();
  } catch {
    return false;
  }
}

export function adminUnauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function validateAdminLogin(username: string, password: string) {
  return username === ADMIN_USER && password === ADMIN_PASS;
}

export function createAdminCookie() {
  const payload = Buffer.from(JSON.stringify({ admin: true, exp: Date.now() + 1000 * 60 * 60 * 24 }), "utf8").toString("base64url");
  return `${COOKIE_NAME}=${payload}.${sign(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`;
}

export function clearAdminCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}