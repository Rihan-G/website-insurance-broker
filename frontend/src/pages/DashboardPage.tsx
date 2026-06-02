import { useEffect, useState, useId } from "react";
import { format as formatDate } from "date-fns";
import { Link } from "react-router-dom";
import type { ComponentType } from "react";
import {
  Users,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  CalendarClock,
  FileWarning,
  MessagesSquare,
  BellRing,
  ListTodo,
  Sparkles,
  Inbox,
  CreditCard,
  Settings,
  Upload,
  CircleAlert,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DOCUMENT_STATUS_BADGE_CLASS, labelFromMime } from "../lib/documentsDisplay";
import { supabase } from "../lib/supabase";
import type { DashboardStats, PipelineItem } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import { describeQuoteSource, quoteLeadContact } from "../lib/quoteLeads";
import { StatusPill } from "../components/StatusPill";

interface RecentQuoteRow {
  id: string;
  product_type: string;
  estimated_premium: number | null;
  status: string;
  created_at: string;
  input_data: Record<string, unknown> | null;
  notes: string | null;
  client: { full_name: string; email: string } | null;
}

const demoStaffRecentQuotes: RecentQuoteRow[] = [
  {
    id: "demo-quote-1",
    product_type: "motor",
    estimated_premium: 64_800,
    status: "draft",
    created_at: new Date().toISOString(),
    input_data: { source: "home_quick_quote", lead_email: "prospect@example.com" },
    notes: null,
    client: null,
  },
  {
    id: "demo-quote-2",
    product_type: "home",
    estimated_premium: 38_200,
    status: "sent",
    created_at: new Date(Date.now() - 72_000_000).toISOString(),
    input_data: { source: "calculator", _displayCurrency: "MUR" },
    notes: null,
    client: { full_name: "Marie Laurent", email: "marie@example.com" },
  },
];

const demoStats: DashboardStats = {
  totalClients: 347,
  activePolices: 512,
  pendingDocuments: 23,
  monthlyRevenue: 284500,
  revenueChange: 12.5,
  documentsProcessed: 1847,
};

const demoPipeline: PipelineItem[] = [
  { id: "1", clientName: "Marie Dupont", documentType: "Motor Insurance", status: "uploaded", uploadedAt: "2025-01-15T10:30:00Z", confidence: undefined },
  { id: "2", clientName: "Jean-Pierre Ramgoolam", documentType: "Home Insurance", status: "processing", uploadedAt: "2025-01-15T09:15:00Z", confidence: 87 },
  { id: "3", clientName: "Priya Devi", documentType: "Life Insurance", status: "reviewed", uploadedAt: "2025-01-14T16:45:00Z", confidence: 94 },
  { id: "4", clientName: "Ahmed Boolell", documentType: "Health Insurance", status: "approved", uploadedAt: "2025-01-14T14:20:00Z", confidence: 98 },
  { id: "5", clientName: "Sophie Chen", documentType: "Travel Insurance", status: "rejected", uploadedAt: "2025-01-14T11:00:00Z", confidence: 42 },
];

/** Demo metrics when signed in as a client (distinct from brokerage-wide staff demo stats). */
const demoClientStats: DashboardStats = {
  totalClients: 1,
  activePolices: 2,
  pendingDocuments: 1,
  monthlyRevenue: 12400,
  revenueChange: 0,
  documentsProcessed: 14,
};

const demoClientPipeline: PipelineItem[] = [
  { id: "c1", clientName: "You", documentType: "Motor Insurance", status: "processing", uploadedAt: "2025-01-15T09:15:00Z", confidence: 87 },
  { id: "c2", clientName: "You", documentType: "Home Insurance", status: "uploaded", uploadedAt: "2025-01-14T16:45:00Z", confidence: undefined },
];

const emptyStats: DashboardStats = {
  totalClients: 0,
  activePolices: 0,
  pendingDocuments: 0,
  monthlyRevenue: 0,
  revenueChange: 0,
  documentsProcessed: 0,
};

type CareSnapshot = { unread: number; openTasks: number; claimsQueue: number };

const demoCareSnapshot: CareSnapshot = { unread: 4, openTasks: 7, claimsQueue: 2 };

function startOfUtcMonth(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  accent = false,
}: {
  title: string;
  value: string;
  change?: number;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`card-hover card-glow group relative min-w-0 overflow-hidden rounded-2xl border p-6 ${
        accent
          ? "border-primary-400/25 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white shadow-lg shadow-primary-950/15 ring-1 ring-white/10"
          : "dashboard-panel border-border/90 ring-1 ring-primary-950/[0.03] dark:ring-white/[0.05]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          accent
            ? "bg-gradient-to-br from-white/12 via-transparent to-accent-500/10"
            : "bg-gradient-to-br from-primary-50/50 via-transparent to-accent-50/20 dark:from-primary-500/10 dark:to-transparent"
        }`}
      />
      <div className="relative">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p
            className={`min-w-0 truncate text-[13px] font-semibold uppercase tracking-wide ${accent ? "text-primary-100/95" : "text-muted-foreground"}`}
          >
            {title}
          </p>
          <div
            className={`shrink-0 rounded-xl p-2.5 shadow-sm ${
              accent ? "bg-white/15 ring-1 ring-white/25 backdrop-blur-sm" : `${iconBg} ring-1 ring-black/[0.04] dark:ring-white/10`
            }`}
          >
            <Icon className={`h-5 w-5 ${accent ? "text-white" : ""}`} />
          </div>
        </div>
        <p className={`mt-3 text-3xl font-extrabold tracking-tight tabular-nums animate-number-pop ${accent ? "text-white" : "text-surface-foreground"}`}>{value}</p>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            {change > 0 ? (
              <>
                <ArrowUpRight className={`h-4 w-4 ${accent ? "text-accent-200" : "text-accent-500"}`} />
                <span className={`font-bold ${accent ? "text-accent-200" : "text-accent-600"}`}>+{change}%</span>
              </>
            ) : change < 0 ? (
              <>
                <ArrowDownRight className="h-4 w-4 text-danger-400" />
                <span className="font-bold text-danger-400">{change}%</span>
              </>
            ) : (
              <span className={`font-medium ${accent ? "text-primary-200" : "text-muted-foreground"}`}>—</span>
            )}
            <span className={`${accent ? "text-primary-200" : "text-muted-foreground"}`}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatGridSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="dashboard-panel rounded-2xl border border-border/90 p-6 ring-1 ring-primary-950/[0.03] dark:ring-white/[0.05]"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="skeleton h-3 w-28 rounded" />
            <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
          </div>
          <div className="skeleton mt-4 h-9 w-24 rounded-md" />
          <div className="skeleton mt-3 h-3 w-32 rounded" />
        </div>
      ))}
    </>
  );
}

export function DashboardPage() {
  const revenueGradientId = `dashboard-rev-bar-${useId().replace(/:/g, "")}`;
  const { format } = useCurrency();
  const { user, profile, session, demoAuthActive } = useAuth();
  const staffDashboard = profile?.role === "admin" || profile?.role === "broker";
  const [stats, setStats] = useState<DashboardStats | null>(() =>
    demoAuthActive ? (staffDashboard ? demoStats : demoClientStats) : null,
  );
  const [pipeline, setPipeline] = useState<PipelineItem[]>(() =>
    demoAuthActive ? (staffDashboard ? demoPipeline : demoClientPipeline) : [],
  );
  const [loading, setLoading] = useState(!demoAuthActive && Boolean(session && user));
  const [careSnapshot, setCareSnapshot] = useState<CareSnapshot | null>(demoAuthActive ? demoCareSnapshot : null);
  const [recentQuotes, setRecentQuotes] = useState<RecentQuoteRow[]>(() =>
    demoAuthActive && (profile?.role === "admin" || profile?.role === "broker") ? demoStaffRecentQuotes : [],
  );
  const [showOnboardingTip, setShowOnboardingTip] = useState(() => {
    try {
      return localStorage.getItem("sb_dashboard_tip_dismissed") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (demoAuthActive) {
      const staff = profile?.role === "admin" || profile?.role === "broker";
      setStats(staff ? demoStats : demoClientStats);
      setPipeline(staff ? demoPipeline : demoClientPipeline);
      setRecentQuotes(staff ? demoStaffRecentQuotes : []);
      setLoading(false);
      return;
    }

    if (!session || !user?.id || !profile) {
      setStats(null);
      setPipeline([]);
      setRecentQuotes([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const uid = user.id;
    const prof = profile;

    async function loadStaff() {
      const monthStart = startOfUtcMonth();

      const [
        clientsRes,
        activePolRes,
        pendingDocRes,
        processedRes,
        paymentsRes,
        pipeRes,
        quotesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("policies").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .in("status", ["uploaded", "processing"]),
        supabase.from("documents").select("*", { count: "exact", head: true }).in("status", ["reviewed", "approved"]),
        supabase.from("payments").select("amount").eq("status", "paid").gte("created_at", monthStart),
        supabase
          .from("documents")
          .select(
            `
            id,
            status,
            created_at,
            ocr_confidence,
            file_name,
            mime_type,
            client:profiles!documents_client_id_fkey ( full_name )
          `,
          )
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("quotes")
          .select(
            `
            id,
            product_type,
            estimated_premium,
            status,
            created_at,
            input_data,
            notes,
            client:profiles!quotes_client_id_fkey ( full_name, email )
          `,
          )
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (cancelled) return;

      type PayAmount = { amount: number | string };
      const staffPaidRows = (paymentsRes.data ?? []) as PayAmount[];
      const monthlyRaw = staffPaidRows.reduce((s, row) => s + Number(row.amount), 0);

      setStats({
        totalClients: clientsRes.count ?? 0,
        activePolices: activePolRes.count ?? 0,
        pendingDocuments: pendingDocRes.count ?? 0,
        monthlyRevenue: monthlyRaw,
        revenueChange: 0,
        documentsProcessed: processedRes.count ?? 0,
      });

      type PipeRow = {
        id: string;
        status: PipelineItem["status"];
        created_at: string;
        ocr_confidence: number | null;
        file_name: string;
        mime_type: string | null;
        client: { full_name: string } | null;
      };
      const rows = (pipeRes.data ?? []) as PipeRow[];
      setPipeline(
        rows.map((r) => ({
          id: r.id,
          clientName: r.client?.full_name ?? "Client",
          documentType: labelFromMime(r.mime_type ?? undefined),
          status: r.status,
          uploadedAt: r.created_at,
          confidence: r.ocr_confidence ?? undefined,
        })),
      );

      setRecentQuotes(((quotesRes.data ?? []) as RecentQuoteRow[]) ?? []);
    }

    async function loadClient() {
      const [activePol, pendingDocs, pays, processedRes, pipeRes] = await Promise.all([
        supabase.from("policies").select("*", { count: "exact", head: true }).eq("client_id", uid).eq("status", "active"),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("client_id", uid)
          .in("status", ["uploaded", "processing"]),
        supabase.from("payments").select("amount").eq("client_id", uid).eq("status", "paid").gte("created_at", startOfUtcMonth()),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("client_id", uid)
          .in("status", ["reviewed", "approved"]),
        supabase
          .from("documents")
          .select("id, status, created_at, ocr_confidence, file_name, mime_type")
          .eq("client_id", uid)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (cancelled) return;

      type PayAmount = { amount: number | string };
      const paidRows = (pays.data ?? []) as PayAmount[];
      const monthlyRaw = paidRows.reduce((s, row) => s + Number(row.amount), 0);

      type ClientPipeRow = {
        id: string;
        mime_type: string | null;
        status: PipelineItem["status"];
        created_at: string;
        ocr_confidence: number | null;
      };
      const clientPipe = (pipeRes.data ?? []) as ClientPipeRow[];

      setStats({
        totalClients: 1,
        activePolices: activePol.count ?? 0,
        pendingDocuments: pendingDocs.count ?? 0,
        monthlyRevenue: monthlyRaw,
        revenueChange: 0,
        documentsProcessed: processedRes.count ?? 0,
      });

      setPipeline(
        clientPipe.map((r) => ({
          id: r.id,
          clientName: prof.full_name ?? "You",
          documentType: labelFromMime(r.mime_type ?? undefined),
          status: r.status,
          uploadedAt: r.created_at,
          confidence: r.ocr_confidence ?? undefined,
        })),
      );
      setRecentQuotes([]);
    }

    setLoading(true);
    void (profile.role === "admin" || profile.role === "broker" ? loadStaff() : loadClient()).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile, session, demoAuthActive]);

  useEffect(() => {
    if (demoAuthActive) {
      setCareSnapshot(demoCareSnapshot);
      return;
    }
    if (!session?.user?.id || !profile) {
      setCareSnapshot(null);
      return;
    }
    let cancelled = false;
    const uid = session.user.id;
    const { role } = profile;

    async function loadCare() {
      const unreadReq = supabase
        .from("portal_notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("read", false);

      if (role === "admin" || role === "broker") {
        const [ur, tr, cr] = await Promise.all([
          unreadReq,
          supabase.from("broker_tasks").select("id", { count: "exact", head: true }).in("status", ["open", "in_progress"]),
          supabase.from("claim_intakes").select("id", { count: "exact", head: true }).in("status", ["submitted", "in_review"]),
        ]);
        if (cancelled) return;
        setCareSnapshot({
          unread: ur.count ?? 0,
          openTasks: tr.count ?? 0,
          claimsQueue: cr.count ?? 0,
        });
      } else {
        const ur = await unreadReq;
        if (cancelled) return;
        setCareSnapshot({ unread: ur.count ?? 0, openTasks: 0, claimsQueue: 0 });
      }
    }

    void loadCare().catch(() => {
      if (!cancelled) setCareSnapshot({ unread: 0, openTasks: 0, claimsQueue: 0 });
    });

    return () => {
      cancelled = true;
    };
  }, [demoAuthActive, session, profile]);

  const revenueHeights = [65, 72, 58, 80, 85, 78, 92, 88, 95, 90, 98, 100];
  const snapshotLabel = formatDate(new Date(), "dd MMM yyyy, HH:mm");

  if (!demoAuthActive && session && user && !profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
          <p className="text-sm">Loading your profile…</p>
        </div>
      </div>
    );
  }

  const viewStats =
    stats ?? (demoAuthActive ? (staffDashboard ? demoStats : demoClientStats) : emptyStats);
  const viewPipeline = demoAuthActive ? (staffDashboard ? demoPipeline : demoClientPipeline) : pipeline;
  const showStatSkeleton = loading && !demoAuthActive && Boolean(session && user && profile);
  const careLoading = careSnapshot === null && !demoAuthActive && Boolean(session && user && profile);
  const isClientCare = profile?.role === "client";

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/80 dark:text-primary-400/90">Overview</p>
          <h2 className="text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Dashboard</h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {demoAuthActive
              ? "Demo data — sign in with Supabase to see live metrics."
              : loading
                ? "Syncing with your Supabase project…"
                : "Overview of your insurance brokerage"}
          </p>
          <p className="text-xs text-muted-foreground">Snapshot: {snapshotLabel}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-200/90 bg-gradient-to-r from-accent-50 to-accent-100/80 px-3.5 py-1.5 text-xs font-semibold text-accent-800 shadow-sm dark:border-accent-600/35 dark:from-accent-950/60 dark:to-accent-950/30 dark:text-accent-200">
          <StatusPill
            tone={demoAuthActive ? "neutral" : "success"}
            icon={<ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            label={demoAuthActive ? "Demo session" : "Live data"}
          />
        </span>
      </div>
      {showOnboardingTip && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/80 p-4 text-sm text-primary-900 dark:border-primary-700/40 dark:bg-primary-950/30 dark:text-primary-100">
          <p className="font-semibold">Tip: Start with quick actions, then watch care counters.</p>
          <p className="mt-1 text-xs text-primary-700 dark:text-primary-200/90">
            Upload documents or open quote leads first, then monitor notifications and tasks to keep client work on track.
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold underline"
            onClick={() => {
              setShowOnboardingTip(false);
              try {
                localStorage.setItem("sb_dashboard_tip_dismissed", "1");
              } catch {
                /* ignore */
              }
            }}
          >
            Dismiss tip
          </button>
        </div>
      )}

      <div className="dashboard-panel min-w-0 rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workflow shortcuts</p>
        <div
          className={`mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${staffDashboard ? "2xl:grid-cols-6" : "2xl:grid-cols-5"}`}
        >
          {(
            staffDashboard
              ? ([
                  { to: "/dashboard/renewals", label: "Renewals", hint: "Runway & reminders", Icon: CalendarClock },
                  { to: "/dashboard/claims", label: "Claims", hint: "FNOL wizard", Icon: FileWarning },
                  { to: "/dashboard/quote-leads", label: "Quote leads", hint: "Site & calculator", Icon: UserPlus },
                  { to: "/dashboard/secure-messages", label: "Secure chat", hint: "Policy threads", Icon: MessagesSquare },
                  { to: "/dashboard/notifications", label: "Alerts", hint: "Activity feed", Icon: BellRing },
                  { to: "/dashboard/tasks", label: "Tasks", hint: "SLAs & follow-ups", Icon: ListTodo },
                ] as const)
              : ([
                  { to: "/dashboard/renewals", label: "Renewals", hint: "Runway & reminders", Icon: CalendarClock },
                  { to: "/dashboard/claims", label: "Claims", hint: "FNOL wizard", Icon: FileWarning },
                  { to: "/dashboard/secure-messages", label: "Secure chat", hint: "Policy threads", Icon: MessagesSquare },
                  { to: "/dashboard/notifications", label: "Alerts", hint: "Activity feed", Icon: BellRing },
                  { to: "/dashboard/tasks", label: "Tasks", hint: "SLAs & follow-ups", Icon: ListTodo },
                ] as const)
          ).map(({ to, label, hint, Icon }) => (
            <Link
              key={to}
              to={to}
              className="card-hover group flex min-w-0 gap-3 rounded-xl border border-border/90 bg-surface p-4 shadow-sm dark:border-border"
            >
              <div className="rounded-lg bg-primary-50 p-2 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-foreground group-hover:text-primary-700 dark:group-hover:text-primary-300">{label}</p>
                <p className="text-xs text-muted-foreground">{hint}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { to: "/dashboard/documents", label: "Documents", Icon: FileText },
            { to: "/dashboard/inbox", label: "Inbox", Icon: Inbox },
            { to: "/dashboard/payments", label: "Payments", Icon: CreditCard },
            { to: "/dashboard/upload", label: "Upload", Icon: Upload },
            { to: "/dashboard/settings", label: "Settings", Icon: Settings },
          ] as const
        ).map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className="card-hover inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm transition-colors hover:border-primary-300 hover:text-surface-foreground dark:border-border dark:hover:border-primary-600"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {label}
          </Link>
        ))}
      </div>

      <section className="dashboard-panel min-w-0 rounded-2xl p-5" aria-label="Care snapshot">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">At a glance</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Care workspace counters — jump in when something needs you</p>
          </div>
          <Sparkles className="hidden h-5 w-5 shrink-0 text-accent-500 sm:block" aria-hidden />
        </div>
        {careLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border/80 bg-surface/50 p-4 dark:border-border">
                <div className="skeleton mb-3 h-3 w-28 rounded" />
                <div className="skeleton h-8 w-14 rounded-md" />
              </div>
            ))}
          </div>
        ) : isClientCare ? (
          <div className="mt-4 max-w-md">
            <Link
              to="/dashboard/notifications"
              className="card-hover flex items-center justify-between gap-4 rounded-xl border border-border/90 bg-surface p-4 shadow-sm dark:border-border"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-lg bg-primary-50 p-2 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
                  <BellRing className="h-5 w-5 shrink-0" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-surface-foreground">Unread notifications</p>
                  <p className="text-xs text-muted-foreground">Portal alerts and reminders</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold tabular-nums text-surface-foreground">{careSnapshot?.unread ?? 0}</span>
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              to="/dashboard/notifications"
              className="card-hover flex flex-col justify-between gap-3 rounded-xl border border-border/90 bg-surface p-4 shadow-sm dark:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Unread</span>
                <BellRing className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden />
              </div>
              <p className="text-3xl font-extrabold tabular-nums text-surface-foreground">{careSnapshot?.unread ?? 0}</p>
              <p className="text-xs text-muted-foreground">Notifications</p>
            </Link>
            <Link
              to="/dashboard/tasks"
              className="card-hover flex flex-col justify-between gap-3 rounded-xl border border-border/90 bg-surface p-4 shadow-sm dark:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Open tasks</span>
                <ListTodo className="h-4 w-4 text-accent-600 dark:text-accent-400" aria-hidden />
              </div>
              <p className="text-3xl font-extrabold tabular-nums text-surface-foreground">{careSnapshot?.openTasks ?? 0}</p>
              <p className="text-xs text-muted-foreground">Broker backlog</p>
            </Link>
            <Link
              to="/dashboard/claims"
              className="card-hover flex flex-col justify-between gap-3 rounded-xl border border-border/90 bg-surface p-4 shadow-sm dark:border-border"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Claims queue</span>
                <CircleAlert className="h-4 w-4 text-warning-600 dark:text-warning-400" aria-hidden />
              </div>
              <p className="text-3xl font-extrabold tabular-nums text-surface-foreground">{careSnapshot?.claimsQueue ?? 0}</p>
              <p className="text-xs text-muted-foreground">Submitted and in review</p>
            </Link>
          </div>
        )}
      </section>

      {staffDashboard && (
        <section className="dashboard-panel min-w-0 rounded-2xl p-5" aria-label="Quote leads preview">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quote pipeline</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Latest calculator saves and website quick-quote leads</p>
            </div>
            <Link
              to="/dashboard/quote-leads"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline dark:text-primary-400 whitespace-nowrap"
            >
              Manage leads <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Premium</th>
                  <th className="px-3 py-2">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No quotes yet. Leads appear from the home page widget or dashboard calculator.
                    </td>
                  </tr>
                ) : (
                  recentQuotes.map((r) => (
                    <tr key={r.id} className="bg-surface">
                      <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                        {formatDate(new Date(r.created_at), "dd MMM yyyy")}
                      </td>
                      <td className="px-3 py-2.5 capitalize text-surface-foreground">{describeQuoteSource(r.input_data)}</td>
                      <td className="px-3 py-2.5 capitalize text-surface-foreground">{r.product_type}</td>
                      <td className="px-3 py-2.5 tabular-nums text-surface-foreground">
                        {r.estimated_premium != null ? `MUR ${Number(r.estimated_premium).toLocaleString()}` : "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-surface-foreground">
                        {r.client?.full_name ?? quoteLeadContact(r.input_data, r.notes)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {showStatSkeleton ? (
          <StatGridSkeleton />
        ) : profile?.role === "client" ? (
          <>
            <StatCard
              title="Active Policies"
              value={viewStats.activePolices.toLocaleString()}
              icon={FileText}
              iconBg="bg-accent-50 text-accent-600"
            />
            <StatCard
              title="Pending Documents"
              value={viewStats.pendingDocuments.toLocaleString()}
              icon={Clock}
              iconBg="bg-warning-50 text-warning-600"
            />
            <StatCard
              title="Paid This Month"
              value={format(viewStats.monthlyRevenue)}
              icon={DollarSign}
              iconBg="bg-primary-50 text-primary-600"
              accent
            />
            <StatCard
              title="Processed Documents"
              value={viewStats.documentsProcessed.toLocaleString()}
              icon={ClipboardCheck}
              iconBg="bg-primary-100 text-primary-600"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Clients"
              value={viewStats.totalClients.toLocaleString()}
              change={demoAuthActive ? 8.2 : undefined}
              icon={Users}
              iconBg="bg-primary-100 text-primary-600"
            />
            <StatCard
              title="Active Policies"
              value={viewStats.activePolices.toLocaleString()}
              change={demoAuthActive ? demoStats.revenueChange : undefined}
              icon={FileText}
              iconBg="bg-accent-50 text-accent-600"
            />
            <StatCard
              title="Pending Documents"
              value={viewStats.pendingDocuments.toLocaleString()}
              icon={Clock}
              iconBg="bg-warning-50 text-warning-600"
            />
            <StatCard
              title="Monthly Revenue"
              value={format(viewStats.monthlyRevenue)}
              change={demoAuthActive ? demoStats.revenueChange : undefined}
              icon={DollarSign}
              iconBg="bg-primary-50 text-primary-600"
              accent
            />
          </>
        )}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-3">
        <div className="dashboard-panel min-w-0 overflow-hidden rounded-2xl xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border/80 bg-gradient-to-r from-primary-50/50 via-transparent to-accent-50/25 px-6 py-4 dark:from-primary-950/35 dark:via-transparent dark:to-accent-950/20">
            <div>
              <h3 className="font-semibold text-surface-foreground">Document Pipeline</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest uploads and OCR status</p>
            </div>
            <span className="rounded-full border border-primary-200/90 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800 shadow-sm dark:border-primary-600/40 dark:bg-primary-950/55 dark:text-primary-200">
              {viewPipeline.length} items
            </span>
          </div>
          <div className="divide-y divide-border/80">
            {viewPipeline.length === 0 && !loading && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-300">
                  <Upload className="h-7 w-7" aria-hidden />
                </div>
                <p className="mt-4 text-sm font-semibold text-surface-foreground">No documents in the pipeline yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Upload a policy or endorsement to kick off OCR and review.</p>
                <Link
                  to="/dashboard/upload"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  Go to upload
                </Link>
              </div>
            )}
            {viewPipeline.map((item) => (
              <div
                key={item.id}
                className="flex cursor-default items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-primary-50/60 dark:hover:bg-muted/40 min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-foreground truncate">{item.clientName}</p>
                  <p className="text-sm text-muted-foreground">{item.documentType}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/90">{formatRelativeTime(item.uploadedAt)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DOCUMENT_STATUS_BADGE_CLASS[item.status]}`}>
                  {item.status}
                </span>
                {item.confidence !== undefined && (
                  <div className="hidden sm:flex items-center gap-2">
                    <progress
                      className={`thin-progress thin-progress--sm ${
                        item.confidence >= 80 ? "thin-progress--success" : item.confidence >= 60 ? "thin-progress--warning" : "thin-progress--danger"
                      }`}
                      max={100}
                      value={item.confidence}
                      aria-label={`OCR confidence ${item.confidence} percent`}
                    />
                    <span className="text-xs font-medium text-muted-foreground w-8">{item.confidence}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-panel min-w-0 overflow-hidden rounded-2xl">
          <div className="border-b border-border/80 bg-gradient-to-r from-primary-50/40 via-transparent to-primary-50/30 px-6 py-4 dark:from-primary-950/30 dark:to-primary-950/15">
            <h3 className="font-semibold text-surface-foreground">Revenue Trend</h3>
          </div>
          <div className="p-6">
            <svg viewBox="0 0 120 100" preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label="Revenue trend chart">
              <defs>
                <linearGradient id={revenueGradientId} x1="0" y1="1" x2="0" y2="0" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="var(--color-primary-700)" />
                  <stop offset="100%" stopColor="var(--color-accent-500)" />
                </linearGradient>
              </defs>
              {revenueHeights.map((h, i) => (
                <rect
                  key={i}
                  x={i * 10 + 1.5}
                  y={100 - h}
                  width={7}
                  height={h}
                  rx={2}
                  fill={`url(#${revenueGradientId})`}
                  className="cursor-pointer opacity-95 transition-[opacity,filter] duration-200 hover:opacity-100 hover:brightness-110"
                />
              ))}
            </svg>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground font-medium">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-accent-200/90 bg-gradient-to-br from-accent-50 to-accent-100/50 p-3.5 shadow-sm dark:border-accent-600/35 dark:from-accent-950/50 dark:to-accent-950/25">
              <TrendingUp className="h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                  {demoAuthActive ? "+12.5% Growth" : "Illustrative trend"}
                </p>
                <p className="text-xs text-muted-foreground">{demoAuthActive ? "Compared to last year" : "Live totals shown in Monthly Revenue"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
