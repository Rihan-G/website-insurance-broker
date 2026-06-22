import { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { CalendarClock, Mail, MessageCircle, Smartphone, Bell, Database, Plus, ExternalLink, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { DEMO_IDS } from "../lib/demoAuth";
import { pushDemoPortalNotification } from "../lib/demoClientNotifications";
import {
  DEFAULT_RENEWAL_INSURER_PACK_ID,
  RENEWAL_INSURER_PACKS,
  RENEWAL_PACK_SUGGESTED_INSURER,
  RENEWAL_TEMPLATE_PLACEHOLDERS,
  interpolateRenewalMessage,
  type RenewalInsurerPackId,
} from "../lib/renewalMessageTemplates";
import { githubCompareOrPrUrl, githubPrCompareConfigured, githubRepoHomeUrl, githubRepoPullsUrl } from "../lib/repoLinks";
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

const OTHER_CLIENT_ID = "99999999-9999-4999-8999-999999999999";

const MOCK_ROWS: Row[] = [
  {
    id: "mock-1",
    policyNumber: "MOT-2024-8841",
    product: "Motor — Comprehensive",
    insurer: "MUA Ltd",
    renewalDate: addDays(new Date(), 12),
    clientId: DEMO_IDS.CLIENT,
    channels: { email: true, sms: true, whatsapp: false },
  },
  {
    id: "mock-2",
    policyNumber: "HOM-2023-1202",
    product: "Home — Building & contents",
    insurer: "Swan Insurance",
    renewalDate: addDays(new Date(), 45),
    clientId: OTHER_CLIENT_ID,
    channels: { email: true, sms: false, whatsapp: true },
  },
];

const EXTRA_LS = "sb_demo_renewals_extra_v1";

type StoredExtra = Omit<Row, "renewalDate"> & { renewalDate: string };

function readExtraRenewals(): Row[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(EXTRA_LS);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return (v as StoredExtra[]).map((r) => ({
      ...r,
      renewalDate: parseISO(r.renewalDate),
    }));
  } catch {
    return [];
  }
}

function writeExtraRenewals(rows: Row[]) {
  if (typeof localStorage === "undefined") return;
  const serial: StoredExtra[] = rows.map((r) => ({
    ...r,
    renewalDate: r.renewalDate.toISOString(),
  }));
  localStorage.setItem(EXTRA_LS, JSON.stringify(serial));
}

function daysLabel(d: number) {
  if (d < 0) return { text: `${Math.abs(d)}d overdue`, tone: "text-danger-600 dark:text-danger-400" };
  if (d === 0) return { text: "Today", tone: "text-warning-600 dark:text-warning-400" };
  if (d <= 30) return { text: `${d}d`, tone: "text-warning-600 dark:text-warning-400" };
  return { text: `${d}d`, tone: "text-accent-600 dark:text-accent-400" };
}

const defaultRenewalPack = RENEWAL_INSURER_PACKS.find((p) => p.id === DEFAULT_RENEWAL_INSURER_PACK_ID) ?? RENEWAL_INSURER_PACKS[0]!;
const defaultRenewalTemplate = defaultRenewalPack.templates[0]!;

export function RenewalsPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [insurerPackId, setInsurerPackId] = useState<RenewalInsurerPackId>(defaultRenewalPack.id);
  const [messageSlug, setMessageSlug] = useState(defaultRenewalTemplate.slug);
  const [pingBody, setPingBody] = useState(defaultRenewalTemplate.body);
  const [addInsurerPackId, setAddInsurerPackId] = useState<RenewalInsurerPackId>("generic");
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<{
    policyNumber: string;
    product: string;
    insurer: string;
    renewalDate: string;
    clientId: string;
  }>({
    policyNumber: "",
    product: "Motor — Comprehensive",
    insurer: "MUA Ltd",
    renewalDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
    clientId: DEMO_IDS.CLIENT,
  });

  const demoRenewalClientOptions = [
    { id: DEMO_IDS.CLIENT, label: "Demo Client (matches client demo login)" },
    { id: OTHER_CLIENT_ID, label: "Another client (for staff-only tests)" },
  ];

  const isStaff = profile?.role === "admin" || profile?.role === "broker";

  const currentPack = useMemo(
    () => RENEWAL_INSURER_PACKS.find((p) => p.id === insurerPackId) ?? RENEWAL_INSURER_PACKS[0]!,
    [insurerPackId],
  );

  const applyInsurerPack = (id: RenewalInsurerPackId) => {
    const p = RENEWAL_INSURER_PACKS.find((x) => x.id === id);
    const first = p?.templates[0];
    if (!p || !first) return;
    setInsurerPackId(id);
    setMessageSlug(first.slug);
    setPingBody(first.body);
  };

  const applyMessageSlug = (slug: string) => {
    const t = currentPack.templates.find((x) => x.slug === slug);
    if (!t) return;
    setMessageSlug(slug);
    setPingBody(t.body);
  };

  const load = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      const extra = readExtraRenewals();
      const merged = [...MOCK_ROWS, ...extra].map((r) => ({ ...r }));
      if (profile?.role === "client") {
        setRows(merged.filter((r) => r.clientId === user.id));
      } else {
        setRows(merged);
      }
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
    const filled = interpolateRenewalMessage(
      pingBody,
      {
        policyNumber: r.policyNumber,
        product: r.product,
        insurer: r.insurer,
        renewalDate: r.renewalDate,
      },
      today,
    );
    const mentionsPolicy =
      filled.includes(r.policyNumber) || filled.toLowerCase().includes(r.policyNumber.toLowerCase());
    const body = mentionsPolicy
      ? filled
      : `${filled}\n\nPolicy ${r.policyNumber} · renewal ${format(r.renewalDate, "MMM d, yyyy")}.`;
    if (!live || demoAuthActive || !session) {
      if (demoAuthActive && r.clientId) {
        pushDemoPortalNotification(r.clientId, {
          kind: "system",
          title: "Renewal reminder",
          body,
        });
      }
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
      body,
    });
    if (error) toast.error(error.message);
    else toast.success("Reminder logged for the client.");
  };

  const addDemoRenewal = () => {
    if (!addForm.policyNumber.trim() || !addForm.clientId) {
      toast.error("Policy number and client are required.");
      return;
    }
    const row: Row = {
      id: `demo-ren-${Date.now()}`,
      policyNumber: addForm.policyNumber.trim(),
      product: addForm.product.trim() || "Policy",
      insurer: addForm.insurer.trim() || "Insurer",
      renewalDate: parseISO(addForm.renewalDate),
      clientId: addForm.clientId,
      channels: { email: true, sms: false, whatsapp: false },
    };
    const extra = readExtraRenewals();
    writeExtraRenewals([...extra, row]);
    toast.success("Renewal added to demo list.");
    setAddOpen(false);
    setAddForm((f) => ({ ...f, policyNumber: "" }));
    void load();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Retention</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Renewal runway</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Countdown to policy end dates with reminder channel preferences. Clients only see their own policies. Staff choose an insurer wording pack and interchangeable message tokens before pinging the client portal.
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

      <Link
        to="/dashboard/expiry"
        className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-surface-foreground hover:bg-muted/60 transition-colors duration-200"
      >
        <span>See all expiry alerts including documents &amp; payments</span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </Link>

      {isStaff && (
        <div className="dashboard-panel rounded-2xl space-y-4 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-semibold text-surface-foreground">Client ping message</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick which insurer&apos;s wording pack you are drafting for (each can later use its own layout). Tokens in the message are swapped per row when you ping. In demo mode this also drops an in-browser notification for that client.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2 sm:items-end">
              <label className="flex w-full flex-col gap-1 text-xs font-medium text-muted-foreground sm:items-end">
                <span className="self-start sm:self-end">Insurance company (format)</span>
                <select
                  aria-label="Insurance company message format"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground"
                  value={insurerPackId}
                  onChange={(e) => applyInsurerPack(e.target.value as RenewalInsurerPackId)}
                >
                  {RENEWAL_INSURER_PACKS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex w-full flex-col gap-1 text-xs font-medium text-muted-foreground sm:items-end">
                <span className="self-start sm:self-end">Message type</span>
                <select
                  aria-label="Renewal message template"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground"
                  value={messageSlug}
                  onChange={(e) => applyMessageSlug(e.target.value)}
                >
                  {currentPack.templates.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{currentPack.note}</p>
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            value={pingBody}
            onChange={(e) => setPingBody(e.target.value)}
            aria-label="Custom renewal message body"
          />
          <details className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium text-surface-foreground">Interchangeable fields (tokens)</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {RENEWAL_TEMPLATE_PLACEHOLDERS.map((ph) => (
                <li key={ph.token}>
                  <code className="rounded bg-muted px-1 py-0.5 text-[11px]">{ph.token}</code> — {ph.description}
                </li>
              ))}
            </ul>
          </details>
          <div className="flex flex-col gap-2 border-t border-border/80 pt-3 text-xs text-muted-foreground">
            <p className="max-w-prose">You can reorder or rename tokens in the editor; only the names above are substituted automatically today.</p>
            <p className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px]">
              <span className="text-muted-foreground">Source:</span>
              <a
                href={githubRepoHomeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                Repository
              </a>
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <a
                href={githubRepoPullsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                Pull requests
              </a>
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
              <a
                href={githubCompareOrPrUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                {githubPrCompareConfigured() ? "Compare / PR (from env)" : "Compare branches"}
              </a>
            </p>
          </div>
        </div>
      )}

      {isStaff && demoAuthActive && (
        <div className="dashboard-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-surface-foreground">Add renewal (demo)</h3>
            <button
              type="button"
              onClick={() => setAddOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {addOpen ? "Close" : "Add renewal"}
            </button>
          </div>
          {addOpen && (
            <div className="grid gap-3 sm:grid-cols-2 max-w-3xl">
              <label className="sm:col-span-2 text-xs font-medium text-muted-foreground">
                Insurer message format (demo label)
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addInsurerPackId}
                  onChange={(e) => {
                    const id = e.target.value as RenewalInsurerPackId;
                    setAddInsurerPackId(id);
                    const sug = RENEWAL_PACK_SUGGESTED_INSURER[id];
                    if (sug) setAddForm((f) => ({ ...f, insurer: sug }));
                  }}
                >
                  {RENEWAL_INSURER_PACKS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] font-normal text-muted-foreground">
                  Prefills the insurer field when a pack has a default carrier name; message drafts still use the selector in &quot;Client ping message&quot; above.
                </p>
              </label>
              <label className="sm:col-span-2 text-xs font-medium text-muted-foreground">
                Client
                <select
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addForm.clientId}
                  onChange={(e) => setAddForm((f) => ({ ...f, clientId: e.target.value }))}
                >
                  {demoRenewalClientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Policy number
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addForm.policyNumber}
                  onChange={(e) => setAddForm((f) => ({ ...f, policyNumber: e.target.value }))}
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Renewal date
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addForm.renewalDate}
                  onChange={(e) => setAddForm((f) => ({ ...f, renewalDate: e.target.value }))}
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Product
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addForm.product}
                  onChange={(e) => setAddForm((f) => ({ ...f, product: e.target.value }))}
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground">
                Insurer
                <input
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={addForm.insurer}
                  onChange={(e) => setAddForm((f) => ({ ...f, insurer: e.target.value }))}
                />
              </label>
              <div className="sm:col-span-2">
                <button type="button" onClick={addDemoRenewal} className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700">
                  Save to demo list
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
                  {isStaff && <th className="px-6 py-3 text-right">Action</th>}
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
                      {isStaff && (
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void sendReminder(r)}
                            disabled={!r.clientId}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-40"
                          >
                            <Bell className="h-3.5 w-3.5" aria-hidden />
                            Ping client
                          </button>
                        </td>
                      )}
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
