import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ArrowRight, ShieldAlert, ShieldCheck, Car, Home, Heart, HeartHandshake, Plane, Briefcase, Calculator } from "lucide-react";

type ProductKey = "motor" | "home" | "life" | "health" | "travel" | "business";

const PRODUCTS: Array<{ key: ProductKey; label: string; icon: React.ComponentType<{ className?: string }>; desc: string; slug: string }> = [
  { key: "motor", label: "Motor Insurance", icon: Car, desc: "Covers your vehicle against accidents, theft, and third-party claims.", slug: "motor" },
  { key: "home", label: "Home Insurance", icon: Home, desc: "Protects your property and contents against fire, flood, and burglary.", slug: "home" },
  { key: "life", label: "Life Insurance", icon: Heart, desc: "Provides a lump sum or income to your family if you pass away.", slug: "life" },
  { key: "health", label: "Health Insurance", icon: HeartHandshake, desc: "Covers medical bills, hospitalisation, and specialist consultations.", slug: "health" },
  { key: "travel", label: "Travel Insurance", icon: Plane, desc: "Protects against trip cancellation, lost luggage, and overseas medical costs.", slug: "travel" },
  { key: "business", label: "Business Insurance", icon: Briefcase, desc: "Covers commercial premises, stock, liability, and business interruption.", slug: "business" },
];

export function CoverGapPage() {
  const [checked, setChecked] = useState<Set<ProductKey>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (key: ProductKey) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const gaps = PRODUCTS.filter((p) => !checked.has(p.key));
  const covered = PRODUCTS.filter((p) => checked.has(p.key));

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-12 w-12 text-accent-500" aria-hidden />
          <h2 className="mt-4 text-xl font-bold text-surface-foreground">Cover gap analysis complete</h2>
          {gaps.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">You have cover across all six product categories. Your advisor can review limits and exclusions at your next renewal.</p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              You may have {gaps.length} gap{gaps.length !== 1 ? "s" : ""} in your cover. Your advisor can walk through the options with no obligation.
            </p>
          )}
          <div className="mt-6 space-y-2">
            {gaps.map((g) => (
              <Link
                key={g.key}
                to={`/products/${g.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-danger-200/80 bg-danger-50/60 px-4 py-3 text-left text-sm font-semibold text-danger-800 hover:bg-danger-50 dark:border-danger-700/40 dark:bg-danger-950/30 dark:text-danger-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-danger-500" aria-hidden />
                  {g.label} — not covered
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            ))}
            {covered.map((c) => (
              <div key={c.key} className="flex items-center gap-3 rounded-xl border border-accent-200/80 bg-accent-50/60 px-4 py-3 text-sm font-semibold text-accent-800 dark:border-accent-600/30 dark:bg-accent-950/30 dark:text-accent-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-500" aria-hidden />
                {c.label} — covered
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+2301234567"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              Speak to an advisor
            </a>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setChecked(new Set()); }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Tools</p>
        <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Cover gap analyser</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tick the types of insurance you currently have. We will show which areas may be unprotected and where your advisor can help.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="space-y-3"
      >
        {PRODUCTS.map((p) => {
          const active = checked.has(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => toggle(p.key)}
              aria-pressed={active}
              className={`flex w-full items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                active
                  ? "border-accent-300 bg-accent-50 dark:border-accent-600/50 dark:bg-accent-950/30"
                  : "border-border bg-surface hover:border-primary-300 hover:bg-primary-50/40 dark:hover:border-primary-600 dark:hover:bg-primary-950/20"
              }`}
            >
              <div className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${active ? "bg-accent-100 dark:bg-accent-900/50" : "bg-muted dark:bg-muted/60"}`}>
                <p.icon className={`h-5 w-5 ${active ? "text-accent-600 dark:text-accent-400" : "text-muted-foreground"}`} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${active ? "text-accent-800 dark:text-accent-200" : "text-surface-foreground"}`}>{p.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
              {active
                ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" aria-hidden />
                : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground/50" aria-hidden />}
            </button>
          );
        })}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-muted-foreground">{checked.size} of {PRODUCTS.length} selected</p>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            <Calculator className="h-4 w-4 shrink-0" aria-hidden />
            Show my gaps
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}
