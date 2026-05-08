import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings as GearIcon } from "lucide-react";
import { useSettings } from "@/lib/settings";
import otaStep1 from "@/assets/ota-step1.png";
import otaStep2 from "@/assets/ota-step2.png";

export const Route = createFileRoute("/ota-blocker")({
  component: OtaBlockerPage,
  head: () => ({
    meta: [
      { title: "OTA Update Blocker Profile for iPhone & iPad — Bypass Unlock" },
      { name: "description", content: "Download and install the OTA Update Blocker profile to prevent automatic iOS & iPadOS updates and keep your current firmware." },
    ],
  }),
});

function OtaBlockerPage() {
  const { settings } = useSettings();
  const downloadUrl = settings.ota_blocker_url || "https://mega.nz/file/XhxEkZCa#t-c0MLkdqMmNO8z_sE6kr1bkpauv8eqzeram6DEvzWk";

  return (
    <main className="bg-white text-black min-h-screen">
      <section className="max-w-4xl mx-auto px-6 py-14 text-center">
        <div className="mx-auto flex items-center justify-center h-28 w-28">
          <GearIcon className="h-24 w-24 text-blue-500 ota-gear-spin drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-bold leading-tight">
          Download OTA Update Blocker Profile for iPhone and iPad
        </h1>
        <p className="mt-5 text-lg text-gray-700 max-w-2xl mx-auto">
          A simple way to block iOS & iPadOS updates from automatically installing on your
          iPhone or iPad, allowing you to keep your current firmware.
        </p>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg"
        >
          ⬇ DOWNLOAD OTA BLOCKER
        </a>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Install OTA Update Blocker Profile</h2>
        <ol className="space-y-4 text-base text-gray-800 list-decimal list-inside">
          <li>Open this page in <strong>Safari</strong> and tap the button above to download the OTA Update Blocker profile.</li>
          <li>Tap <strong>"Allow"</strong> if prompted.</li>
          <li>Go to <strong>Settings</strong>, and tap <strong>Profile Downloaded</strong> at the top.</li>
          <li>If you don't see the Profile Downloaded menu, go to <strong>General → Profile & Device Management</strong> (or <strong>VPN & Device Management</strong>).</li>
          <li>Tap <strong>Install</strong> in the upper right corner.</li>
          <li>Enter your <strong>passcode</strong> if prompted.</li>
          <li>Tap <strong>Next</strong>, then tap <strong>Install</strong> in the upper right corner.</li>
          <li>Tap <strong>Install</strong> again to confirm.</li>
        </ol>

        <div className="mt-8 space-y-8">
          <figure>
            <img src={otaStep1} alt="Profile Downloaded and Install Profile screens" className="w-full rounded-lg border border-gray-200" />
            <figcaption className="text-sm text-gray-600 mt-2 text-center">Tap Profile Downloaded → Install</figcaption>
          </figure>
          <figure>
            <img src={otaStep2} alt="Consent, Warning, and Install Profile confirmation" className="w-full rounded-lg border border-gray-200" />
            <figcaption className="text-sm text-gray-600 mt-2 text-center">Next → Install → Install to confirm</figcaption>
          </figure>
        </div>

        <p className="mt-8 text-sm text-gray-600">Compatible with iOS 26+ and later.</p>
        <p className="mt-2 text-base text-gray-800">
          After installing the profile, go to <strong>Settings → General → Software Update</strong>.
          If you see <em>"Unable to Check for Update,"</em> it means updates have been successfully blocked.
        </p>

        <div className="mt-10 text-center">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg"
          >
            ⬇ DOWNLOAD OTA BLOCKER
          </a>
          <div className="mt-6">
            <Link to="/" className="text-blue-600 hover:underline text-sm">← Back to home</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
