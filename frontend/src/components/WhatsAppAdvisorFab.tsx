import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { CONTACT_PHONE_WHATSAPP } from "../lib/branding";
import { useAuth } from "../context/AuthContext";

export function WhatsAppAdvisorFab() {
  const [expanded, setExpanded] = useState(false);
  const { profile } = useAuth();

  const policyRef = profile?.full_name ? `Client: ${profile.full_name}` : "Policy enquiry";
  const message = encodeURIComponent(
    `Hi, I'd like to speak with an advisor. ${policyRef}`,
  );
  const href = `https://wa.me/${CONTACT_PHONE_WHATSAPP}?text=${message}`;

  return (
    <div
      className="pointer-events-auto fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2"
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      {expanded && (
        <div className="mb-1 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl animate-fade-in">
          <p className="text-sm font-semibold text-surface-foreground">Talk to an advisor</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Opens WhatsApp with your name pre-filled. Typical response under 1 business day.
          </p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
            onClick={() => setExpanded(false)}
          >
            <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
            Open WhatsApp
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Close WhatsApp advisor panel" : "Chat with an advisor on WhatsApp"}
        aria-expanded={expanded}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:brightness-95 active:scale-95"
      >
        {expanded ? (
          <X className="h-5 w-5" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden />
        )}
      </button>
    </div>
  );
}
