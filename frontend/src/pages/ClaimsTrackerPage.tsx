import { useState } from "react";
import { subDays, format } from "date-fns";
import { CheckCircle2, Clock, Circle, AlertCircle, FileText, ChevronDown, Phone } from "lucide-react";
import { CONTACT_PHONE_TEL as BRAND_PHONE } from "../lib/branding";

type StepStatus = "done" | "active" | "pending";

type Step = { label: string; date?: Date; note?: string; status: StepStatus };

type Claim = {
  id: string;
  refNumber: string;
  product: string;
  insurer: string;
  incidentDate: Date;
  description: string;
  estimatedValue: number;
  steps: Step[];
};

const DEMO_CLAIMS: Claim[] = [
  {
    id: "c1",
    refNumber: "CLM-2025-0041",
    product: "Motor — Comprehensive",
    insurer: "MUA Ltd",
    incidentDate: subDays(new Date(), 18),
    description: "Rear-end collision at the junction of Royal Road and Pope Hennessy Street, Port Louis.",
    estimatedValue: 45000,
    steps: [
      { label: "Claim submitted", date: subDays(new Date(), 18), note: "FNOL submitted online. Ref number assigned.", status: "done" },
      { label: "Documents received", date: subDays(new Date(), 15), note: "Police report, photos, and driver's licence confirmed.", status: "done" },
      { label: "Assessment underway", date: subDays(new Date(), 10), note: "Loss adjuster inspected vehicle at Garage Mauritius, Rose Hill.", status: "done" },
      { label: "Insurer decision", date: subDays(new Date(), 3), note: "MUA approved claim for MUR 41,500 (net of excess). Repair authorisation issued.", status: "done" },
      { label: "Settlement", note: "Payment processing — expected within 5 business days.", status: "active" },
      { label: "Claim closed", status: "pending" },
    ],
  },
  {
    id: "c2",
    refNumber: "CLM-2025-0018",
    product: "Home — Building",
    insurer: "Swan Insurance",
    incidentDate: subDays(new Date(), 42),
    description: "Water damage to living room and kitchen following burst pipe during cyclone alert.",
    estimatedValue: 120000,
    steps: [
      { label: "Claim submitted", date: subDays(new Date(), 42), note: "Emergency notification submitted.", status: "done" },
      { label: "Documents received", date: subDays(new Date(), 38), note: "Photos, plumber's report and cyclone warning confirmation received.", status: "done" },
      { label: "Assessment underway", note: "Loss adjuster visit scheduled for next week.", status: "active" },
      { label: "Insurer decision", status: "pending" },
      { label: "Settlement", status: "pending" },
      { label: "Claim closed", status: "pending" },
    ],
  },
];

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") return <CheckCircle2 className="h-5 w-5 text-accent-600 dark:text-accent-400" aria-hidden />;
  if (status === "active") return <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-pulse" aria-hidden />;
  return <Circle className="h-5 w-5 text-border" aria-hidden />;
}

export function ClaimsTrackerPage() {
  const [selectedId, setSelectedId] = useState(DEMO_CLAIMS[0]!.id);
  const claim = DEMO_CLAIMS.find((c) => c.id === selectedId) ?? DEMO_CLAIMS[0]!;
  const doneCount = claim.steps.filter((s) => s.status === "done").length;
  const progress = Math.round((doneCount / claim.steps.length) * 100);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">My claims</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Claims tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live status of all your open and recent claims.</p>
        </div>
        <a
          href={`tel:${BRAND_PHONE}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted/40 transition-colors"
        >
          <Phone className="h-4 w-4" aria-hidden /> Call your broker
        </a>
      </div>

      {/* Claim selector */}
      <div className="relative max-w-sm">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {DEMO_CLAIMS.map((c) => (
            <option key={c.id} value={c.id}>{c.refNumber} — {c.product}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>

      {/* Claim summary */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{claim.refNumber}</p>
            </div>
            <p className="mt-1 text-lg font-bold text-surface-foreground">{claim.product}</p>
            <p className="text-sm text-muted-foreground">{claim.insurer} · Incident {format(claim.incidentDate, "dd MMM yyyy")}</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">{claim.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Estimated value</p>
            <p className="text-xl font-bold text-surface-foreground">MUR {claim.estimatedValue.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground">{doneCount} of {claim.steps.length} steps complete</p>
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{progress}%</p>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Progress timeline</p>
        </div>
        <div className="px-5 py-4">
          <ol className="relative space-y-0">
            {claim.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <div className="mt-0.5 shrink-0"><StepIcon status={step.status} /></div>
                  {i < claim.steps.length - 1 && (
                    <div className={`mt-1 w-0.5 flex-1 min-h-[2rem] ${step.status === "done" ? "bg-accent-300 dark:bg-accent-700" : "bg-border"}`} />
                  )}
                </div>
                {/* Content */}
                <div className={`pb-6 min-w-0 ${i === claim.steps.length - 1 ? "pb-0" : ""}`}>
                  <p className={`text-sm font-semibold ${step.status === "pending" ? "text-muted-foreground" : "text-surface-foreground"}`}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{format(step.date, "dd MMM yyyy")}</p>
                  )}
                  {step.note && (
                    <p className={`mt-1 text-xs leading-relaxed ${step.status === "active" ? "text-primary-700 dark:text-primary-300 font-medium" : "text-muted-foreground"}`}>
                      {step.status === "active" && <AlertCircle className="inline h-3.5 w-3.5 mr-1 -mt-0.5" aria-hidden />}
                      {step.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
