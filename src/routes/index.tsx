import { createFileRoute, Link } from "@tanstack/react-router";
import heroIpad from "@/assets/hero-ipad.png";
import heroIphone from "@/assets/iphone-locked.png";
import activationLock from "@/assets/activation-lock.png";
import passcodeLock from "@/assets/passcode-lock.png";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, oklch(0.55 0.13 200), oklch(0.6 0.15 165))" }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              iCloud Unlock Software
            </h1>
            <h2 className="mt-3 text-2xl font-semibold opacity-95">Bypass Unlock Tools</h2>
            <p className="mt-5 text-base/7 opacity-95 max-w-lg">
              The Bypass Unlock team provides a straightforward solution to bypass the iCloud
              Activation Lock screen and screen passcode on iPhone and iPad — supporting iOS
              18.7.2 to iOS 26.3.1 (A12 chip and above) in just one click.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register/$type"
                params={{ type: "icloud" }}
                className="inline-flex items-center rounded-md px-5 py-2.5 font-semibold text-white hover:opacity-90"
                style={{ background: "linear-gradient(135deg, oklch(0.35 0.12 250), oklch(0.18 0.05 260))" }}
              >
                Register your device
              </Link>
              <a
                href="#tools"
                className="inline-flex items-center rounded-md border border-white/50 px-5 py-2.5 font-semibold text-white hover:bg-white/10"
              >
                See tools
              </a>
            </div>
          </div>
          <div className="flex items-end justify-center gap-3">
            <img
              src={heroIphone}
              alt="iPhone Locked to Owner screen"
              className="h-64 md:h-80 w-auto drop-shadow-2xl"
            />
            <img
              src={heroIpad}
              alt="iPad showing iCloud Activation Lock screen"
              className="h-56 md:h-72 w-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Tools intro */}
      <section id="tools" className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-brand">Unlock Tools for iPhone &amp; iPad</h2>
          <p className="mt-3 text-muted-foreground">
            The Bypass Unlock iPhone and iPad tools are the best way to solve the most common
            issues iOS users may experience. If you have an iCloud-locked or passcode-locked
            device, our software is ready to remove the lock from your device in a single click.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <article className="rounded-lg p-6" style={{ background: "linear-gradient(135deg, oklch(0.35 0.1 220), oklch(0.4 0.12 180))" }}>
            <div className="flex justify-center">
              <img
                src={activationLock}
                alt="iPhone iCloud Activation Lock"
                width={768}
                height={1024}
                loading="lazy"
                className="h-64 w-auto"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-brand">
              Bypass iCloud Activation Lock Screen Tool →
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The Bypass Unlock software will bypass the iCloud Activation Lock screen on iPhone
              and iPad running iOS 18.7.2 up to iOS 26.3.1 in 1 click.
            </p>
            <div className="mt-5 text-sm">
              <p className="font-semibold">Supported iOS Firmwares:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ from iOS 18.7.2 → up to iOS 26.3.1</li>
              </ul>
              <p className="mt-3 font-semibold">Supported iPhone Models:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ A12+: from XR, XS, XS Max → up to iPhone 17 Pro Max &amp; iPhone Air</li>
              </ul>
              <p className="mt-3 font-semibold">Supported iPad Models:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ A12+: any iPad, iPad Pro, Air &amp; Mini from 2019 onward → iPad M3</li>
              </ul>
            </div>
            <Link
              to="/register/$type"
              params={{ type: "icloud" }}
              className="mt-6 block w-full text-center rounded-md px-4 py-2.5 font-semibold text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, oklch(0.35 0.12 250), oklch(0.18 0.05 260))" }}
            >
              Register for iCloud Bypass
            </Link>
          </article>

          <article className="rounded-lg p-6" style={{ background: "linear-gradient(135deg, oklch(0.35 0.1 220), oklch(0.4 0.12 180))" }}>
            <div className="flex justify-center">
              <img
                src={passcodeLock}
                alt="iPhone Passcode Lock"
                width={768}
                height={1024}
                loading="lazy"
                className="h-64 w-auto"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-brand">
              Screen Passcode Unlock Tool →
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The Bypass Unlock software is ready to remove the screen passcode from any
              supported iPhone or iPad without losing access to the device.
            </p>
            <div className="mt-5 text-sm">
              <p className="font-semibold">Supported iOS Firmwares:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ from iOS 18.7.2 → up to iOS 26.3.1</li>
              </ul>
              <p className="mt-3 font-semibold">Supported iPhone Models:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ A12+: from XR, XS, XS Max → up to iPhone 17 Pro Max</li>
              </ul>
              <p className="mt-3 font-semibold">Supported iPad Models:</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                <li>✓ A12+: any iPad model from 2019 onward</li>
              </ul>
            </div>
            <Link
              to="/register/$type"
              params={{ type: "passcode" }}
              className="mt-6 block w-full text-center rounded-md px-4 py-2.5 font-semibold text-white hover:opacity-90"
              style={{ background: "linear-gradient(135deg, oklch(0.35 0.12 250), oklch(0.18 0.05 260))" }}
            >
              Register for Passcode Unlock
            </Link>
          </article>
        </div>
      </section>

      {/* Before you register */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-brand">Before you register</h2>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Download and open the Bypass Unlock tool on your computer.</li>
            <li>Connect your iPhone or iPad with a USB cable.</li>
            <li>Make sure the tool shows your device as <span className="text-foreground font-medium">Supported</span>.</li>
            <li>Copy the device <span className="text-foreground font-medium">Serial Number</span> shown by the tool.</li>
            <li>Choose your registration type and paste your serial.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}
