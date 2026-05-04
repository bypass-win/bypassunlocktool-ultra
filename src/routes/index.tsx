import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Smartphone, Zap, Lock, CheckCircle2, Cpu, Clock, KeyRound } from "lucide-react";
import heroDevice from "@/assets/hero-device.png";
import logo from "@/assets/logo.jpg";
import { MODELS } from "@/lib/pricing";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Zap className="w-3 h-3" /> iOS 12 → iOS 26.3.1 supported
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] mb-6">
              Bypass <span className="gradient-text text-glow">iCloud Activation</span> & Screen Passcode in 1 Click
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              The Bypass Unlock software removes iCloud Activation Lock and screen passcodes on iPhone & iPad — fully automated, server-verified, registered to your serial number.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register/$type" params={{ type: "icloud" }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition">
                <Lock className="w-4 h-4" /> Register for iCloud Bypass
              </Link>
              <Link to="/register/$type" params={{ type: "passcode" }}
                className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-6 py-3 font-semibold text-accent hover:bg-accent/20 transition">
                <KeyRound className="w-4 h-4" /> Register for Passcode Unlock
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> Server-verified</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 15–30 min activation</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> A12+ devices</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-40" style={{ background: "var(--gradient-primary)" }} />
            <img src={heroDevice} alt="Bypass Unlock tool unlocking iPhone via USB" className="relative rounded-2xl ring-1 ring-border/50" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Built for <span className="gradient-text">professional unlocking</span></h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">A fully automated bypass solution trusted by repair technicians and resellers worldwide.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Lock, title: "iCloud Activation Bypass", desc: "Removes the Activation Lock screen on supported iPhone & iPad models running iOS 12 → 26." },
            { icon: KeyRound, title: "Screen Passcode Unlock", desc: "Bypass the lock screen passcode on disabled or forgotten devices — registered per serial." },
            { icon: Cpu, title: "A12+ Compatible", desc: "Full support for A12 Bionic and above — XR / XS up to iPhone 17 Pro Max and iPad M3." },
            { icon: Shield, title: "Serial-Locked License", desc: "Each registration is bound to one serial number. Server enforces one device per payment." },
            { icon: Clock, title: "Fast Processing", desc: "Server registers your device in 15–30 minutes — the tool then unlocks automatically." },
            { icon: Smartphone, title: "Works on iPad too", desc: "Supports iPad 8 through iPad M3 with the same one-click bypass workflow." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card/50 p-6 hover:border-primary/50 transition">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUPPORTED */}
      <section id="supported" className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-2xl border border-border bg-card/40 p-10 backdrop-blur">
          <h2 className="text-3xl font-bold mb-2">Supported Firmwares & Devices</h2>
          <p className="text-muted-foreground mb-8">Verify your device is compatible before registering.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-primary mb-3">iOS Firmwares</h3>
              <p className="text-sm text-muted-foreground">iOS 12.0 → iOS 26.3.1</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-3">iPhone Models</h3>
              <p className="text-sm text-muted-foreground">A7+ : iPhone 5S → iPhone X<br/>A12+ : XR, XS, XS Max → iPhone 17 Pro Max</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-3">iPad Models</h3>
              <p className="text-sm text-muted-foreground">iPad 8 → iPad M3</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3">Per-Device <span className="gradient-text">Pricing</span></h2>
          <p className="text-muted-foreground">One payment = one device serial. Pricing varies by model.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODELS.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3 hover:border-primary/40 transition">
              <span className="text-sm">{m.name}</span>
              <span className="font-bold text-primary">${m.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-12 text-center">How it <span className="gradient-text">works</span></h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { n: "01", t: "Verify Support", d: "Connect your device to the Bypass Unlock tool. Confirm status shows Supported." },
            { n: "02", t: "Register Serial", d: "Copy your serial number from the tool, paste it here and pick your unlock type." },
            { n: "03", t: "Pay Securely", d: "Pay via PayPal or card. Pricing is auto-calculated from your device model." },
            { n: "04", t: "Auto-Unlock", d: "Wait 15–30 minutes — the tool detects your device and unlocks automatically." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-border bg-card/40 p-6">
              <div className="text-3xl font-bold gradient-text mb-3">{s.n}</div>
              <h3 className="font-semibold text-lg mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-2xl p-10 md:p-14 text-center glow-border bg-card/60 backdrop-blur">
          <img src={logo} alt="" className="w-20 h-20 mx-auto rounded-xl mb-6 ring-2 ring-primary/40" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to unlock your device?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Choose your registration type below. Your serial is verified automatically and pricing is shown instantly.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register/$type" params={{ type: "icloud" }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
              <Lock className="w-4 h-4" /> iCloud Bypass Registration
            </Link>
            <Link to="/register/$type" params={{ type: "passcode" }} className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-6 py-3 font-semibold text-accent hover:bg-accent/20">
              <KeyRound className="w-4 h-4" /> Passcode Unlock Registration
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
