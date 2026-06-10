import { CheckCircle, Circle, Clock } from "lucide-react";

const statusOrder = ["submitted", "under_review", "assessor", "approved", "settled"] as const;

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  assessor: "Assessor appointed",
  approved: "Approved",
  settled: "Settled",
  draft: "Draft",
  rejected: "Rejected",
};

function normalizeStatus(status: string): string {
  const s = status.toLowerCase();
  if (s === "pending" || s === "open") return "submitted";
  if (s === "in_review" || s === "processing") return "under_review";
  return s;
}

export function ClaimsTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const current = normalizeStatus(status);
  const currentIdx = statusOrder.indexOf(current as (typeof statusOrder)[number]);
  const activeIdx = currentIdx >= 0 ? currentIdx : 0;

  return (
    <div className="space-y-0">
      <p className="mb-3 text-xs text-muted-foreground">Filed {new Date(createdAt).toLocaleDateString("en-MU")}</p>
      <ol className="relative border-l border-border pl-6">
        {statusOrder.map((step, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          const Icon = done ? CheckCircle : active ? Clock : Circle;
          return (
            <li key={step} className="mb-4 last:mb-0">
              <span
                className={`absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface ${
                  done ? "text-accent-600" : active ? "text-primary-600" : "text-muted-foreground/40"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <p className={`text-sm font-medium ${active ? "text-primary-700 dark:text-primary-300" : "text-surface-foreground"}`}>
                {statusLabels[step] ?? step}
              </p>
            </li>
          );
        })}
      </ol>
      {current === "rejected" && (
        <p className="mt-2 text-sm text-danger-600">This claim was declined — contact your broker for details.</p>
      )}
    </div>
  );
}
