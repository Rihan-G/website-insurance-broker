import {
  Users,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
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
  uploaded: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  reviewed: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          {change > 0 ? (
            <>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+{change}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{change}%</span>
            </>
          )}
          <span className="text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Overview of your insurance brokerage</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={mockStats.totalClients.toLocaleString()}
          change={8.2}
          icon={Users}
        />
        <StatCard
          title="Active Policies"
          value={mockStats.activePolices.toLocaleString()}
          change={mockStats.revenueChange}
          icon={FileText}
        />
        <StatCard
          title="Pending Documents"
          value={mockStats.pendingDocuments.toLocaleString()}
          icon={Clock}
        />
        <StatCard
          title="Monthly Revenue"
          value={`MUR ${(mockStats.monthlyRevenue / 1000).toFixed(0)}K`}
          change={mockStats.revenueChange}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="font-semibold text-gray-900">Document Pipeline</h3>
            <span className="text-sm text-gray-500">{mockPipeline.length} items</span>
          </div>
          <div className="divide-y">
            {mockPipeline.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.clientName}</p>
                  <p className="text-sm text-gray-500">{item.documentType}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[item.status]}`}
                >
                  {item.status}
                </span>
                {item.confidence !== undefined && (
                  <div className="hidden sm:flex items-center gap-1.5">
                    <div className="h-2 w-16 rounded-full bg-gray-100">
                      <div
                        className={`h-2 rounded-full ${
                          item.confidence >= 80 ? "bg-green-500" : item.confidence >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.confidence}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
          </div>
          <div className="p-6">
            <div className="flex items-end gap-2 h-40">
              {[65, 72, 58, 80, 85, 78, 92, 88, 95, 90, 98, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary-500 hover:bg-primary-600 transition-colors"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-50 p-3">
              <TrendingUp className="h-5 w-5 text-accent-600" />
              <div>
                <p className="text-sm font-medium text-accent-700">+12.5% Growth</p>
                <p className="text-xs text-gray-500">Compared to last year</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
