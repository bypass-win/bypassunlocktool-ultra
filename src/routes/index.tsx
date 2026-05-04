import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-3">Bypass Unlock</h1>
      <p className="text-muted-foreground mb-8">
        A simple tool to bypass iCloud Activation Lock and screen passcode on iPhone &amp; iPad
        (A12 and above, iOS 18.7.2 to iOS 26.3.1). Register your device serial number below to
        get started.
      </p>

      <div className="border border-border rounded-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Before you register</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Download and open the Bypass Unlock tool on your computer.</li>
          <li>Connect your iPhone or iPad with a USB cable.</li>
          <li>Make sure the tool shows your device as <span className="text-foreground font-medium">Supported</span>.</li>
          <li>Copy the device <span className="text-foreground font-medium">Serial Number</span> shown by the tool.</li>
          <li>Choose your registration type below and paste your serial.</li>
        </ol>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/register/$type"
          params={{ type: "icloud" }}
          className="border border-border rounded-md p-5 hover:bg-card transition"
        >
          <h3 className="font-semibold mb-1">iCloud Activation Bypass</h3>
          <p className="text-sm text-muted-foreground">Remove the iCloud Activation Lock screen.</p>
        </Link>
        <Link
          to="/register/$type"
          params={{ type: "passcode" }}
          className="border border-border rounded-md p-5 hover:bg-card transition"
        >
          <h3 className="font-semibold mb-1">Screen Passcode Unlock</h3>
          <p className="text-sm text-muted-foreground">Bypass the screen passcode on your device.</p>
        </Link>
      </div>

      <div className="border border-border rounded-md p-6">
        <h2 className="text-xl font-semibold mb-2">Supported devices</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>iPhone XR / XS / XS Max → iPhone 17 Pro Max, iPhone Air</li>
          <li>iPad 8th generation → iPad M3</li>
          <li>iOS 18.7.2 → iOS 26.3.1 (A12 chip and above)</li>
        </ul>
      </div>
    </main>
  );
}
