import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { CalendarClock, Mail, MessageCircle, Smartphone, Bell, Database } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import type { Policy } from "../types";

type Channel = "email" | "sms" | "whatsapp";

type Row = {
  id: string;
  policyNumber: string;
  product: string;
  insurer: string;
  renewalDate: Date;
  clientId: string;
  channels: Record<Channel, boolean>;
};

const MOCK_ROWS: Row[] = [
  {
    id: "mock-1",
    policyNumber: "MOT-2024-8841",
    product: "Motor — Comprehensive",
    insurer: "MUA Ltd",
    renewalDate: addDays(new Date(), 12),
    clientId: "",
    channels: { email: true, sms: true, whatsapp: false },
  },
  {
    id: "mock-2",
    policyNumber: "HOM-2023-1202",
    product: "Home — Building & contents",
    insurer: "Swan Insurance",
    renewalDate: addDays(new Date(), 45),
    clientId: "",
    channels: { email: true, sms: false, whatsapp: true },
  },
];

function daysLabel(d: number) {
  if (d < 0) return { text: `${Math.abs(d)}d overdue`, tone: "text-danger-600 dark:text-danger-400" };
  if (d === 0) return { text: "Today", tone: "text-warning-600 dark:text-warning-400" };
  if (d <= 30) return { text: `${d}d`, tone: "text-warning-600 dark:text-warning-400" };
  return { text: `${d}d`, tone: "text-accent-600 dark:text-accent-400" };
}

export function RenewalsPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      setRows(MOCK_ROWS);
      setLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = db.policies().select("id, client_id, policy_number, insurer, product_type, end_date").order("end_date", { ascending: true });
    const { data: policies, error: polErr } = profile?.role === "client" ? await q.eq("client_id", user.id) : await q;
    if (polErr || !policies?.length) {
      setRows(polErr ? MOCK_ROWS : []);
      setLive(!polErr);
      setLoading(false);
      if (polErr) toast.error("Could not load policies — showing demo data.");
      return;
    }

    const ids = (policies as Policy[]).map((p) => p.id);
    const { data: prefs } = await db.renewalPreferences().select("*").in("policy_id", ids);
    type PrefRow = { policy_id: string; remind_email: boolean; remind_sms: boolean; remind_whatsapp: boolean };
    const prefByPolicy = new Map<string, PrefRow>(
      ((prefs ?? []) as PrefRow[]).map((r) => [r.policy_id, r]),
    );

    const next: Row[] = (policies as Policy[]).map((p) => {
      const pr = prefByPolicy.get(p.id);
      return {
        id: p.id,
        policyNumber: p.policy_number,
        product: p.product_type,
        insurer: p.insurer,
        renewalDate: parseISO(p.end_date),
        clientId: p.client_id,
        channels: {
          email: pr?.remind_email ?? true,
          sms: pr?.remind_sms ?? false,
          whatsapp: pr?.remind_whatsapp ?? false,
        },
      };
    });
    setRows(next);
    setLive(true);
    setLoading(false);
  }, [user, profile?.role, session, demoAuthActive]);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.renewalDate.getTime() - b.renewalDate.getTime()), [rows]);
  const today = new Date();

  const toggleChannel = async (policyId: string, clientId: string, ch: Channel) => {
    const row = rows.find((r) => r.id === policyId);
    if (!row) return;
    const nextCh = { ...row.channels, [ch]: !row.channels[ch] };
    setRows((prev) => prev.map((r) => (r.id === policyId ? { ...r, channels: nextCh } : r)));

    if (!live || demoAuthActive || !session) {
      toast.success("Reminder preferences updated (demo).");
      return;
    }

    const { error } = await db.renewalPreferences().upsert(
      {
        policy_id: policyId,
        client_id: clientId,
        remind_email: nextCh.email,
        remind_sms: nextCh.sms,
        remind_whatsapp: nextCh.whatsapp,
      },
      { onConflict: "policy_id" },
    );
    if (error) {
      toast.error(error.message);
      void load();
    } else toast.success("Preferences saved.");
  };

  const sendReminder = async (r: Row) => {
    if (!live || demoAuthActive || !session) {
      toast.success(`Queued renewal reminder for ${r.policyNumber} (demo).`);
      return;
    }
    await db
      .renewalPreferences()
      .upsert(
        {
          policy_id: r.id,
          client_id: r.clientId,
          remind_email: r.channels.email,
          remind_sms: r.channels.sms,
          remind_whatsapp: r.channels.whatsapp,
          last_reminder_at: new Date().toISOString(),
        },
        { onConflict: "policy_id" },
      );
    const { error } = await db.portalNotifications().insert({
      user_id: r.clientId,
      kind: "system",
      title: "Renewal reminder",
      body: `Your broker sent a nudge for policy ${r.policyNumber} (${format(r.renewalDate, "MMM d, yyyy")}).`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reminder logged for the client.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Retention</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Renewal runway</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Countdown to policy end dates with reminder channel preferences. Connects to <code className="text-xs">policies</code> and{" "}
            <code className="text-xs">renewal_preferences</code> when you are signed in with Supabase (not demo mode).
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            live ? "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200" : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" aria-hidden />
          {loading ? "Loading…" : live ? "Live data" : "Demo / offline"}
        </span>
      </div>

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-gradient-to-r from-primary-50/50 via-transparent to-accent-50/20 px-6 py-4 dark:from-primary-950/35 dark:to-transparent">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
            <h3 className="font-semibold text-surface-foreground">Upcoming renewals</h3>
          </div>
          <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">{sorted.length} policies</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">Loading policies…</div>
          ) : sorted.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">No policies found. Add policies in Supabase or use demo login.</div>
          ) : (
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
                  const days = differenceInCalendarDays(r.renewalDate, today);
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
                              onClick={() => void toggleChannel(r.id, r.clientId, key)}
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
                          onClick={() => void sendReminder(r)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                        >
                          <Bell className="h-3.5 w-3.5" aria-hidden />
                          Ping client
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
