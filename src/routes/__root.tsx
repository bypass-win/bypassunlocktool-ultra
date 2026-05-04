import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import logo from "@/assets/logo.jpg";

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
      { name: "description", content: "Bypass Unlock removes iCloud Activation Lock and screen passcode on iPhone & iPad (iOS 12 → iOS 26.3.1, A12+). Register your device serial and unlock in one click." },
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
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Bypass Unlock" className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/40 group-hover:ring-primary transition" />
          <span className="font-bold text-lg tracking-tight">Bypass <span className="gradient-text">Unlock</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground transition">Features</a>
          <a href="/#supported" className="hover:text-foreground transition">Supported</a>
          <a href="/#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="/#process" className="hover:text-foreground transition">Process</a>
        </nav>
        <Link to="/register/$type" params={{ type: "icloud" }} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Register Device
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Bypass Unlock. All rights reserved.</p>
        <p>Contact: support@bypassunlock.com · Telegram: @bypassunlock</p>
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
    </>
  );
}
