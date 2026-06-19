import { differenceInDays } from "date-fns";
import { AlertTriangle, CalendarClock, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export type RenewalBannerPolicy = {
  id: string;
  product: string;
  policyNumber: string;
  endDate: string;
};

function urgency(daysLeft: number) {
  if (daysLeft <= 7) return "danger" as const;
  if (daysLeft <= 14) return "warning" as const;
  return "info" as const;
}

export function RenewalBanner({ policies }: { policies: RenewalBannerPolicy[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = policies
    .map((p) => ({ ...p, daysLeft: differenceInDays(new Date(p.endDate), new Date()) }))
    .filter((p) => p.daysLeft >= 0 && p.daysLeft <= 30 && !dismissed.has(p.id))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  if (visible.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {visible.map((p) => {
        const tone = urgency(p.daysLeft);
        const isDanger = tone === "danger";
        const isWarning = tone === "warning";

        const base = isDanger
          ? "border-danger-200 bg-danger-50 dark:border-danger-700/40 dark:bg-danger-950/30"
          : isWarning
            ? "border-warning-200 bg-warning-50 dark:border-warning-600/40 dark:bg-warning-950/30"
            : "border-primary-200 bg-primary-50 dark:border-primary-700/40 dark:bg-primary-950/30";

        const textMain = isDanger
          ? "text-danger-800 dark:text-danger-200"
          : isWarning
            ? "text-warning-800 dark:text-warning-200"
            : "text-primary-800 dark:text-primary-200";

        const textMuted = isDanger
          ? "text-danger-600 dark:text-danger-400"
          : isWarning
            ? "text-warning-600 dark:text-warning-400"
            : "text-primary-600 dark:text-primary-400";

        const Icon = isDanger || isWarning ? AlertTriangle : CalendarClock;

        const label =
          p.daysLeft === 0
            ? "Renews today"
            : p.daysLeft === 1
              ? "Renews tomorrow"
              : `Renews in ${p.daysLeft} days`;

        return (
          <div
            key={p.id}
            role="alert"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${base}`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${textMuted}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold ${textMain}`}>
                {p.product} ({p.policyNumber}) — {label}
              </p>
            </div>
            <Link
              to="/dashboard/renewals"
              className={`shrink-0 inline-flex items-center gap-1 text-xs font-bold underline-offset-2 hover:underline ${textMuted}`}
            >
              Renew <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
            <button
              type="button"
              aria-label="Dismiss renewal alert"
              onClick={() => setDismissed((s) => new Set(s).add(p.id))}
              className={`shrink-0 rounded-lg p-1 transition-colors ${textMuted} hover:bg-black/5 dark:hover:bg-white/10`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const DEMO_RENEWAL_POLICIES: RenewalBannerPolicy[] = [
  {
    id: "demo-mot-8841",
    product: "Motor — Comprehensive",
    policyNumber: "MOT-2024-8841",
    endDate: new Date(Date.now() + 12 * 86_400_000).toISOString(),
  },
];
