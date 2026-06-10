import { Calculator, Phone } from "lucide-react";
import { CONTACT_PHONE_TEL } from "../../lib/branding";

/** Mobile-only bottom bar: primary quote CTA + tap-to-call (large targets, safe-area). */
export function HomeStickyCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      role="region"
      aria-label="Sticky contact actions"
    >
      <div className="border-t border-border/80 bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-border dark:bg-surface/95 dark:shadow-[0_-12px_40px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex max-w-lg gap-3">
          <a
            href="#quote"
            className="btn-marketing inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white active:scale-[0.98] cursor-pointer transition-transform"
          >
            <Calculator className="h-4 w-4 shrink-0" aria-hidden />
            Free quote
          </a>
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary-600 bg-primary-50 px-4 text-sm font-bold text-primary-900 active:scale-[0.98] cursor-pointer transition-transform dark:border-primary-500 dark:bg-primary-950/60 dark:text-primary-50"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            Call us
          </a>
        </div>
      </div>
    </div>
  );
}
