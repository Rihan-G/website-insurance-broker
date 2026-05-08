import {
  Users,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import type { DashboardStats, PipelineItem } from "../types";

const mockStats: DashboardStats = {
  totalClients: 347,
  activePolices: 512,
  pendingDocuments: 23,
  monthlyRevenue: 284500,
  revenueChange: 12.5,
  documentsProcessed: 1847,
};

const mockPipeline: PipelineItem[] = [
  { id: "1", clientName: "Marie Dupont", documentType: "Motor Insurance", status: "uploaded", uploadedAt: "2025-01-15T10:30:00Z", confidence: undefined },
  { id: "2", clientName: "Jean-Pierre Ramgoolam", documentType: "Home Insurance", status: "processing", uploadedAt: "2025-01-15T09:15:00Z", confidence: 87 },
  { id: "3", clientName: "Priya Devi", documentType: "Life Insurance", status: "reviewed", uploadedAt: "2025-01-14T16:45:00Z", confidence: 94 },
  { id: "4", clientName: "Ahmed Boolell", documentType: "Health Insurance", status: "approved", uploadedAt: "2025-01-14T14:20:00Z", confidence: 98 },
  { id: "5", clientName: "Sophie Chen", documentType: "Travel Insurance", status: "rejected", uploadedAt: "2025-01-14T11:00:00Z", confidence: 42 },
];

const statusColors: Record<string, string> = {
  uploaded: "bg-primary-100 text-primary-700",
  processing: "bg-warning-50 text-warning-600",
  reviewed: "bg-purple-100 text-purple-700",
  approved: "bg-accent-50 text-accent-600",
  rejected: "bg-danger-50 text-danger-600",
};

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
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  accent?: boolean;
}) {
  return (
    <div className={`card-hover card-glow rounded-2xl border p-6 relative overflow-hidden group ${accent ? "border-primary-200 bg-gradient-to-br from-primary-600 to-primary-700 text-white" : "border-border bg-surface"}`}>
      {/* Subtle shimmer on hover */}
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
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-danger-400" />
                <span className="font-bold text-danger-400">{change}%</span>
              </>
            )}
            <span className={`${accent ? "text-primary-200" : "text-muted-foreground"}`}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const revenueHeights = [65, 72, 58, 80, 85, 78, 92, 88, 95, 90, 98, 100];
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your insurance brokerage</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent-50 border border-accent-200 px-3 py-1.5 text-xs font-medium text-accent-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          All systems operational
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={mockStats.totalClients.toLocaleString()}
          change={8.2}
          icon={Users}
          iconBg="bg-primary-100 text-primary-600"
        />
        <StatCard
          title="Active Policies"
          value={mockStats.activePolices.toLocaleString()}
          change={mockStats.revenueChange}
          icon={FileText}
          iconBg="bg-accent-50 text-accent-600"
        />
        <StatCard
          title="Pending Documents"
          value={mockStats.pendingDocuments.toLocaleString()}
          icon={Clock}
          iconBg="bg-warning-50 text-warning-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={`MUR ${(mockStats.monthlyRevenue / 1000).toFixed(0)}K`}
          change={mockStats.revenueChange}
          icon={DollarSign}
          iconBg="bg-primary-50 text-primary-600"
          accent
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Document Pipeline */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Document Pipeline</h3>
            <span className="rounded-full bg-primary-50 border border-primary-200 px-2.5 py-0.5 text-xs font-medium text-primary-700">
              {mockPipeline.length} items
            </span>
          </div>
          <div className="divide-y divide-border">
            {mockPipeline.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-primary-50/50 transition-colors duration-150 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-foreground truncate">{item.clientName}</p>
                  <p className="text-sm text-muted-foreground">{item.documentType}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[item.status]}`}
                >
                  {item.status}
                </span>
                {item.confidence !== undefined && (
                  <div className="hidden sm:flex items-center gap-2">
                  <progress
                    className={`thin-progress thin-progress--sm ${
                      item.confidence >= 80
                        ? "thin-progress--success"
                        : item.confidence >= 60
                          ? "thin-progress--warning"
                          : "thin-progress--danger"
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

        {/* Revenue Trend */}
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Revenue Trend</h3>
          </div>
            <div className="p-6">
              <svg
                viewBox="0 0 120 100"
                preserveAspectRatio="none"
                className="h-40 w-full"
                role="img"
                aria-label="Revenue trend chart"
              >
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
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-accent-50 border border-accent-200 p-3">
              <TrendingUp className="h-5 w-5 text-accent-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-accent-700">+12.5% Growth</p>
                <p className="text-xs text-muted-foreground">Compared to last year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
