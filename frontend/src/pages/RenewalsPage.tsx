import { useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { CalendarClock, Mail, MessageCircle, Smartphone, Bell } from "lucide-react";
import toast from "react-hot-toast";

type Channel = "email" | "sms" | "whatsapp";

interface RenewalRow {
  id: string;
  policyNumber: string;
  product: string;
  insurer: string;
  renewalDate: Date;
  channels: Record<Channel, boolean>;
}

const base = new Date();

const MOCK_RENEWALS: RenewalRow[] = [
  {
    id: "1",
    policyNumber: "MOT-2024-8841",
    product: "Motor — Comprehensive",
    insurer: "MUA Ltd",
    renewalDate: addDays(base, 12),
    channels: { email: true, sms: true, whatsapp: false },
  },
  {
    id: "2",
    policyNumber: "HOM-2023-1202",
    product: "Home — Building & contents",
    insurer: "Swan Insurance",
    renewalDate: addDays(base, 45),
    channels: { email: true, sms: false, whatsapp: true },
  },
  {
    id: "3",
    policyNumber: "LIF-2019-0033",
    product: "Life — Term assurance",
    insurer: "Jubilee Insurance",
    renewalDate: addDays(base, 90),
    channels: { email: true, sms: true, whatsapp: true },
  },
];

function daysLabel(d: number) {
  if (d < 0) return { text: `${Math.abs(d)}d overdue`, tone: "text-danger-600 dark:text-danger-400" };
  if (d === 0) return { text: "Today", tone: "text-warning-600 dark:text-warning-400" };
  if (d <= 30) return { text: `${d}d`, tone: "text-warning-600 dark:text-warning-400" };
  return { text: `${d}d`, tone: "text-accent-600 dark:text-accent-400" };
}

export function RenewalsPage() {
  const [rows, setRows] = useState(MOCK_RENEWALS);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime()),
    [rows],
  );

  const toggleChannel = (id: string, ch: Channel) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, channels: { ...r.channels, [ch]: !r.channels[ch] } } : r)),
    );
    toast.success("Reminder preferences updated (demo).");
  };

  const sendReminder = (id: string) => {
    toast.success(`Queued renewal reminder for policy ${id} (demo).`);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Retention</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Renewal runway</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Countdown to renewal dates with reminder channel preferences. Data is illustrative until policies sync from your backend.
        </p>
      </div>

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-gradient-to-r from-primary-50/50 via-transparent to-accent-50/20 px-6 py-4 dark:from-primary-950/35 dark:to-transparent">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
            <h3 className="font-semibold text-surface-foreground">Upcoming renewals</h3>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {sorted.length} policies
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border/80 bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Policy</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Renewal</th>
                <th className="px-6 py-3">Reminders</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {sorted.map((r) => {
                const days = differenceInCalendarDays(r.renewalDate, base);
                const dl = daysLabel(days);
                return (
                  <tr key={r.id} className="hover:bg-primary-50/50 dark:hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-surface-foreground">{r.policyNumber}</p>
                      <p className="text-xs text-muted-foreground">{r.insurer}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{r.product}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-surface-foreground">{format(r.renewalDate, "MMM d, yyyy")}</p>
                      <p className={`text-xs font-semibold ${dl.tone}`}>{dl.text}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ["email", Mail],
                            ["sms", Smartphone],
                            ["whatsapp", MessageCircle],
                          ] as const
                        ).map(([key, Icon]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleChannel(r.id, key)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                              r.channels[key]
                                ? "border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-600 dark:bg-primary-950/50 dark:text-primary-200"
                                : "border-border text-muted-foreground hover:border-primary-200 dark:hover:border-primary-700"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden />
                            {key}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => sendReminder(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                      >
                        <Bell className="h-3.5 w-3.5" aria-hidden />
                        Ping now
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
