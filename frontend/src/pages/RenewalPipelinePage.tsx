import { addDays, differenceInCalendarDays, format } from "date-fns";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type PolicyRow = {
  id: string;
  clientName: string;
  product: string;
  policyNumber: string;
  insurer: string;
  endDate: Date;
  channel: "email" | "whatsapp" | "sms";
};

const DEMO: PolicyRow[] = [
  { id: "r1", clientName: "Marie Dupont", product: "Motor — Comprehensive", policyNumber: "MOT-2024-8841", insurer: "MUA Ltd", endDate: new Date(), channel: "whatsapp" },
  { id: "r2", clientName: "Ahmed Boolell", product: "Home — Building", policyNumber: "HOM-2023-1120", insurer: "Swan Insurance", endDate: addDays(new Date(), 4), channel: "email" },
  { id: "r3", clientName: "Priya Devi", product: "Health — Group", policyNumber: "HLT-2024-0432", insurer: "Jubilee Insurance", endDate: addDays(new Date(), 9), channel: "email" },
  { id: "r4", clientName: "Jean-Pierre R.", product: "Business — Liability", policyNumber: "BUS-2024-3310", insurer: "Mauritius Union", endDate: addDays(new Date(), 18), channel: "whatsapp" },
  { id: "r5", clientName: "Sophie Chen", product: "Life — Term", policyNumber: "LIF-2022-0891", insurer: "Sicom", endDate: addDays(new Date(), 22), channel: "sms" },
  { id: "r6", clientName: "Ravi Lutchmanen", product: "Motor — Third Party", policyNumber: "MOT-2023-7710", insurer: "Eagle Insurance", endDate: addDays(new Date(), 29), channel: "whatsapp" },
  { id: "r7", clientName: "Nadia Ramgoolam", product: "Travel — Annual", policyNumber: "TRV-2024-0055", insurer: "Allianz", endDate: addDays(new Date(), -3), channel: "email" },
];

type Column = { id: string; label: string; icon: React.ComponentType<{ className?: string }>; filter: (d: number) => boolean; color: string; headerBg: string };

const COLUMNS: Column[] = [
  { id: "overdue", label: "Overdue", icon: AlertTriangle, filter: (d) => d < 0, color: "text-danger-600 dark:text-danger-400", headerBg: "bg-danger-50 border-danger-200/80 dark:bg-danger-950/30 dark:border-danger-700/40" },
  { id: "today", label: "Today", icon: CalendarClock, filter: (d) => d === 0, color: "text-danger-500 dark:text-danger-400", headerBg: "bg-danger-50 border-danger-200/80 dark:bg-danger-950/30 dark:border-danger-700/40" },
  { id: "week", label: "This Week", icon: Clock, filter: (d) => d >= 1 && d <= 7, color: "text-warning-600 dark:text-warning-400", headerBg: "bg-warning-50 border-warning-200/80 dark:bg-warning-950/30 dark:border-warning-600/40" },
  { id: "month", label: "This Month", icon: CheckCircle2, filter: (d) => d >= 8 && d <= 30, color: "text-primary-600 dark:text-primary-400", headerBg: "bg-primary-50 border-primary-200/80 dark:bg-primary-950/30 dark:border-primary-700/40" },
];

const CHANNEL_LABELS: Record<PolicyRow["channel"], string> = { email: "Email", whatsapp: "WA", sms: "SMS" };
const CHANNEL_COLORS: Record<PolicyRow["channel"], string> = {
  whatsapp: "bg-[#25D366]/10 text-[#128C7E] border-[#25D366]/30",
  email: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-700/40",
  sms: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950/30 dark:text-warning-300 dark:border-warning-600/40",
};

export function RenewalPipelinePage() {
  const rows = DEMO.map((r) => ({ ...r, daysLeft: differenceInCalendarDays(r.endDate, new Date()) }));

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Broker tools</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Renewal pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">Policies due for renewal, sorted by urgency. Send reminders or manage via the renewals page.</p>
        </div>
        <Link
          to="/dashboard/renewals"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700"
        >
          Manage renewals <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = rows.filter((r) => col.filter(r.daysLeft));
          return (
            <div key={col.id} className="min-w-0 rounded-2xl border border-border bg-surface overflow-hidden">
              <div className={`flex items-center gap-2 border-b px-4 py-3 ${col.headerBg}`}>
                <col.icon className={`h-4 w-4 shrink-0 ${col.color}`} aria-hidden />
                <p className={`text-xs font-bold uppercase tracking-wide ${col.color}`}>{col.label}</p>
                <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-surface-foreground dark:bg-black/20">
                  {items.length}
                </span>
              </div>
              <ul className="divide-y divide-border/60 overflow-y-auto" style={{ maxHeight: "28rem" }}>
                {items.length === 0 ? (
                  <li className="px-4 py-8 text-center text-xs text-muted-foreground">None</li>
                ) : (
                  items.map((r) => (
                    <li key={r.id} className="px-4 py-3.5 hover:bg-muted/30 transition-colors">
                      <p className="text-sm font-semibold text-surface-foreground truncate">{r.clientName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">{r.product}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{r.policyNumber} · {r.insurer}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d overdue` : r.daysLeft === 0 ? "Due today" : format(r.endDate, "dd MMM")}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${CHANNEL_COLORS[r.channel]}`}>
                          {CHANNEL_LABELS[r.channel]}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
