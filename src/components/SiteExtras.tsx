import { useEffect, useState } from "react";
import { useSettings, parseAdScripts } from "@/lib/settings";

export function MacDownloadButton() {
  const [isMac, setIsMac] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const platform = (navigator as any).platform || "";
    const mac = /Mac/i.test(platform) || /Mac OS X|Macintosh/i.test(ua);
    // Exclude iPhone/iPad
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsMac(mac && !ios);
  }, []);

  if (!isMac) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <a
        href={settings.download_url_mac || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-md px-5 py-2.5 font-semibold text-white hover:opacity-90"
        style={{ background: "linear-gradient(135deg, oklch(0.35 0.12 250), oklch(0.18 0.05 260))" }}
      >
        ⬇️ Download for Mac
      </a>
      <p className="mt-2 text-xs text-muted-foreground">
        macOS version {settings.mac_app_version} — for Macs running macOS 11+
      </p>
    </div>
  );
}

export function CustomAdScripts() {
  const { settings, loading } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading) return;
    const ads = parseAdScripts(settings.custom_ad_scripts).filter((a) => a.enabled);
    const inserted: HTMLElement[] = [];

    ads.forEach((ad) => {
      const container = document.createElement("div");
      container.dataset.adId = ad.id;
      container.style.display = "none";
      container.innerHTML = ad.html;

      // Re-create script tags so the browser executes them
      const scripts = Array.from(container.querySelectorAll("script"));
      scripts.forEach((old) => {
        const fresh = document.createElement("script");
        for (const attr of Array.from(old.attributes)) {
          fresh.setAttribute(attr.name, attr.value);
        }
        if (old.textContent) fresh.textContent = old.textContent;
        old.replaceWith(fresh);
      });

      const target = ad.placement === "head" ? document.head : document.body;
      target.appendChild(container);
      inserted.push(container);
    });

    return () => inserted.forEach((el) => el.remove());
  }, [mounted, loading, settings.custom_ad_scripts]);

  return null;
}
