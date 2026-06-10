import { useState } from "react";
import { Link } from "react-router-dom";
import { acceptCookieConsent, hasCookieConsent } from "../lib/localPrefs";

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !hasCookieConsent());

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-surface/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md dark:shadow-[0_-8px_32px_rgba(0,0,0,0.45)] sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:rounded-xl sm:border"
    >
      <p className="text-sm text-surface-foreground">
        We use essential cookies and local storage for theme, preferences, and portal demo data. See our{" "}
        <Link to="/privacy" className="font-medium text-primary-600 underline hover:text-primary-700 dark:text-primary-400">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            acceptCookieConsent();
            setVisible(false);
          }}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
