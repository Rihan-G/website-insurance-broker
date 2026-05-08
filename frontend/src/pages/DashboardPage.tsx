import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  Users,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DOCUMENT_STATUS_BADGE_CLASS, labelFromMime } from "../lib/documentsDisplay";
import { supabase } from "../lib/supabase";
import type { DashboardStats, PipelineItem } from "../types";

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

const emptyStats: DashboardStats = {
  totalClients: 0,
  activePolices: 0,
  pendingDocuments: 0,
  monthlyRevenue: 0,
  revenueChange: 0,
  documentsProcessed: 0,
};

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
    <div className={`card-hover card-glow rounded-2xl border p-6 relative overflow-hidden group ${accent ? "border-primary-200 bg-gradient-to-br from-primary-600 to-primary-700 text-white" : "border-border bg-surface"}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-semibold ${accent ? "text-primary-100" : "text-muted-foreground"}`}>{title}</p>
          <div className={`rounded-xl p-2.5 shadow-sm ${accent ? "bg-white/15 border border-white/20" : iconBg}`}>
            <Icon className={`h-5 w-5 ${accent ? "text-white" : ""}`} />
          </div>
        </div>
        <p className={`mt-3 text-3xl font-extrabold animate-number-pop ${accent ? "text-white" : "text-surface-foreground"}`}>{value}</p>
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

export function DashboardPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(demoAuthActive ? demoStats : null);
  const [pipeline, setPipeline] = useState<PipelineItem[]>(demoAuthActive ? demoPipeline : []);
  const [loading, setLoading] = useState(!demoAuthActive && Boolean(session && user));

  useEffect(() => {
    if (demoAuthActive) {
      setStats(demoStats);
      setPipeline(demoPipeline);
      setLoading(false);
      return;
    }

    if (!session || !user?.id || !profile) {
      setStats(null);
      setPipeline([]);
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
    }

    setLoading(true);
    void (profile.role === "admin" || profile.role === "broker" ? loadStaff() : loadClient()).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile, session, demoAuthActive]);

  const revenueHeights = [65, 72, 58, 80, 85, 78, 92, 88, 95, 90, 98, 100];

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

  const viewStats = stats ?? (demoAuthActive ? demoStats : emptyStats);
  const viewPipeline = demoAuthActive ? demoPipeline : pipeline;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            {demoAuthActive
              ? "Demo data — sign in with Supabase to see live metrics."
              : loading
                ? "Syncing with your Supabase project…"
                : "Overview of your insurance brokerage"}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200 px-3 py-1.5 text-xs font-medium text-accent-700 dark:border-accent-600/40 dark:bg-accent-950/50 dark:text-accent-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          {demoAuthActive ? "Demo session" : "Live data"}
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {profile?.role === "client" && !demoAuthActive ? (
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
              value={`MUR ${viewStats.monthlyRevenue >= 1000 ? `${(viewStats.monthlyRevenue / 1000).toFixed(1)}K` : viewStats.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
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
              value={`MUR ${viewStats.monthlyRevenue >= 1000 ? `${(viewStats.monthlyRevenue / 1000).toFixed(1)}K` : viewStats.monthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              change={demoAuthActive ? demoStats.revenueChange : undefined}
              icon={DollarSign}
              iconBg="bg-primary-50 text-primary-600"
              accent
            />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Document Pipeline</h3>
            <span className="rounded-full bg-primary-50 border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:border-primary-600/40 dark:bg-primary-950/50 dark:text-primary-300">
              {viewPipeline.length} items
            </span>
          </div>
          <div className="divide-y divide-border">
            {viewPipeline.length === 0 && !loading && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">No documents yet.</div>
            )}
            {viewPipeline.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-primary-50/50 dark:hover:bg-muted/50 transition-colors duration-150 cursor-default">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-foreground truncate">{item.clientName}</p>
                  <p className="text-sm text-muted-foreground">{item.documentType}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DOCUMENT_STATUS_BADGE_CLASS[item.status]}`}>
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

        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Revenue Trend</h3>
          </div>
          <div className="p-6">
            <svg viewBox="0 0 120 100" preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label="Revenue trend chart">
              {revenueHeights.map((h, i) => (
                <rect
                  key={i}
                  x={i * 10 + 1.5}
                  y={100 - h}
                  width={7}
                  height={h}
                  rx={1.5}
                  fill="var(--color-primary-500)"
                  className="cursor-pointer hover:opacity-90 transition-opacity duration-200"
                />
              ))}
            </svg>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground font-medium">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-accent-50 border border-accent-200 p-3 dark:border-accent-600/40 dark:bg-accent-950/40">
              <TrendingUp className="h-5 w-5 text-accent-600 shrink-0" />
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
