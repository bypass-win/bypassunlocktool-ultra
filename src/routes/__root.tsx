import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import logo from "@/assets/logo.jpg";
import { TelegramPopup } from "@/components/TelegramPopup";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/lib/settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bypass Unlock — iCloud Activation & Passcode Bypass Tool" },
      { name: "description", content: "Bypass Unlock removes iCloud Activation Lock and screen passcode on iPhone & iPad (iOS 18.7.2 → iOS 26.3.1, A12+). Register your serial and unlock in one click." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { settings } = useSettings();
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Bypass Unlock" className="h-8 w-8 rounded object-cover" />
          <span className="font-semibold hidden sm:inline">Bypass Unlock</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <a
            href={settings.download_url_windows}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-3 py-1.5 font-medium text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.13 200), oklch(0.18 0.05 260))" }}
          >
            ⬇ Download
          </a>
          <Link to="/status" className="rounded-md border border-border px-3 py-1.5 hover:bg-card hidden sm:inline-block">Status</Link>
          <Link to="/register/$type" params={{ type: "icloud" }} className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground">Register</Link>
          {isAdmin && <Link to="/admin" className="rounded-md border border-primary px-3 py-1.5 text-primary hidden sm:inline-block">Admin</Link>}
          {user ? (
            <button onClick={() => signOut()} className="text-muted-foreground hover:text-foreground hidden sm:inline">Sign out</button>
          ) : (
            <Link to="/auth" className="text-muted-foreground hover:text-foreground hidden sm:inline">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-5xl mx-auto px-6 py-8 text-sm text-muted-foreground grid sm:grid-cols-3 gap-4">
        <div>
          <p className="font-semibold text-foreground">Bypass Unlock</p>
          <p className="mt-1 text-xs">© {new Date().getFullYear()} {settings.website_url}</p>
        </div>
        <div>
          <p className="font-semibold text-foreground">Contact</p>
          <a href={`mailto:${settings.contact_email}`} className="block hover:text-foreground text-xs mt-1">{settings.contact_email}</a>
          <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="block hover:text-foreground text-xs">Telegram: @BYPASS_UNLOCK</a>
        </div>
        <div>
          <p className="font-semibold text-foreground">Links</p>
          <Link to="/status" className="block hover:text-foreground text-xs mt-1">Check registration status</Link>
          <Link to="/auth" className="block hover:text-foreground text-xs">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <TelegramPopup />
    </>
  );
}
