import { differenceInDays, format } from "date-fns";
import { FileWarning, Upload, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export type ExpiringDoc = {
  id: string;
  name: string;
  expiresAt: string;
};

function tone(daysLeft: number) {
  if (daysLeft <= 7) return "danger" as const;
  if (daysLeft <= 30) return "warning" as const;
  return "ok" as const;
}

export const DEMO_EXPIRING_DOCS: ExpiringDoc[] = [
  { id: "doc-1", name: "National ID (NIC)", expiresAt: new Date(Date.now() + 18 * 86_400_000).toISOString() },
  { id: "doc-2", name: "Vehicle registration", expiresAt: new Date(Date.now() + 5 * 86_400_000).toISOString() },
];

export function DocExpiryWidget({ docs }: { docs: ExpiringDoc[] }) {
  const annotated = docs
    .map((d) => ({ ...d, daysLeft: differenceInDays(new Date(d.expiresAt), new Date()) }))
    .filter((d) => d.daysLeft >= 0 && d.daysLeft <= 60)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <section className="dashboard-panel min-w-0 overflow-hidden rounded-2xl" aria-label="Document expiry">
      <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document expiry</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Documents expiring in the next 60 days</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Upload
        </Link>
      </div>

      {annotated.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-accent-500" aria-hidden />
          <p className="text-sm font-semibold text-surface-foreground">No documents expiring soon</p>
          <p className="text-xs text-muted-foreground">We will flag anything due in the next 60 days here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {annotated.map((d) => {
            const t = tone(d.daysLeft);
            const rowBg = t === "danger"
              ? "hover:bg-danger-50/50 dark:hover:bg-danger-950/20"
              : t === "warning"
                ? "hover:bg-warning-50/50 dark:hover:bg-warning-950/20"
                : "hover:bg-primary-50/30 dark:hover:bg-muted/30";
            const badge = t === "danger"
              ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700/40 dark:bg-danger-950/30 dark:text-danger-300"
              : t === "warning"
                ? "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-600/40 dark:bg-warning-950/30 dark:text-warning-300"
                : "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-700/40 dark:bg-primary-950/30 dark:text-primary-300";

            return (
              <li key={d.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${rowBg}`}>
                <FileWarning className={`h-4 w-4 shrink-0 ${t === "danger" ? "text-danger-500" : t === "warning" ? "text-warning-500" : "text-muted-foreground"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-surface-foreground truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">Expires {format(new Date(d.expiresAt), "dd MMM yyyy")}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge}`}>
                  {d.daysLeft === 0 ? "Today" : `${d.daysLeft}d`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
