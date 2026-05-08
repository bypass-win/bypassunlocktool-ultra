import { useEffect, useState } from "react";
import telegramLogo from "@/assets/telegram-logo.ico";

const TELEGRAM_URL = "https://t.me/BYPASS_UNLOCK_TOOL";
const KEY = "telegram_popup_shown";

export function TelegramPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    sessionStorage.setItem(KEY, "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={close}>
      <div
        className="relative max-w-sm w-full rounded-lg bg-background border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
        >
          ✕
        </button>
        <div className="text-center">
          <img src={telegramLogo} alt="Telegram" className="mx-auto mb-3 h-12 w-12 object-contain" />
          <h2 className="text-lg font-bold">Join our NEW Telegram channel</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our previous channel <span className="text-foreground font-medium">@BYPASS_UNLOCK</span> was banned due to Telegram policy. We've created a new official channel — please join <span className="text-foreground font-medium">@BYPASS_UNLOCK_TOOL</span> to keep getting tool updates, supported iOS versions, and bypass news.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="mt-5 inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 font-semibold text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.13 230), oklch(0.18 0.05 260))" }}
          >
            Join @BYPASS_UNLOCK_TOOL
          </a>
        </div>
      </div>
    </div>
  );
}
