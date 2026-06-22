import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Users, FileText, CreditCard, Download } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { exportToCsv } from "../../lib/exportService";
import { CHART_COLORS } from "../../lib/chartColors";
import toast from "react-hot-toast";

const ANALYTICS_PREFS_LS = "sb_analytics_prefs_v1";

const monthlyRevenue = [
  { month: "Jan", revenue: 185000, clients: 28, policies: 42 },
  { month: "Feb", revenue: 210000, clients: 32, policies: 49 },
  { month: "Mar", revenue: 195000, clients: 30, policies: 45 },
  { month: "Apr", revenue: 245000, clients: 38, policies: 58 },
  { month: "May", revenue: 280000, clients: 42, policies: 64 },
  { month: "Jun", revenue: 262000, clients: 40, policies: 61 },
  { month: "Jul", revenue: 305000, clients: 47, policies: 72 },
  { month: "Aug", revenue: 290000, clients: 45, policies: 69 },
  { month: "Sep", revenue: 315000, clients: 50, policies: 76 },
  { month: "Oct", revenue: 340000, clients: 54, policies: 82 },
  { month: "Nov", revenue: 325000, clients: 52, policies: 79 },
  { month: "Dec", revenue: 360000, clients: 58, policies: 88 },
];

const productMix = [
  { name: "Motor", value: 38 },
  { name: "Home", value: 22 },
  { name: "Life", value: 18 },
  { name: "Health", value: 12 },
  { name: "Travel", value: 6 },
  { name: "Business", value: 4 },
];

const topBrokers = [
  { name: "Marie Dupont", policies: 87, commission: 42500 },
  { name: "Jean-Pierre R.", policies: 74, commission: 36200 },
  { name: "Priya Devi", policies: 63, commission: 30800 },
  { name: "Ahmed Boolell", policies: 55, commission: 26900 },
  { name: "Sophie Chen", policies: 48, commission: 23400 },
];

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-surface-foreground">{value}</p>
      <p className={`mt-2 text-sm font-medium ${change >= 0 ? "text-accent-600" : "text-danger-600"}`}>
        {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs last month
      </p>
    </div>
  );
}

export function PerformanceAnalyticsTab() {
  const [period, setPeriod] = useState<"3m" | "6m" | "12m">("12m");
  const [liveStats, setLiveStats] = useState({ clients: 0, docs: 0, payments: 0 });
  const [operatorName, setOperatorName] = useState("");
  const [accent, setAccent] = useState<"blue" | "emerald" | "violet">("blue");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ANALYTICS_PREFS_LS);
      if (!raw) return;
      const v = JSON.parse(raw) as { operatorName?: string; accent?: "blue" | "emerald" | "violet" };
      if (typeof v.operatorName === "string") setOperatorName(v.operatorName);
      if (v.accent === "blue" || v.accent === "emerald" || v.accent === "violet") setAccent(v.accent);
    } catch {
      /* ignore */
    }
  }, []);

  const persistPrefs = (next: { operatorName: string; accent: "blue" | "emerald" | "violet" }) => {
    setOperatorName(next.operatorName);
    setAccent(next.accent);
    try {
      localStorage.setItem(ANALYTICS_PREFS_LS, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: clients }, { count: docs }, { count: payments }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("documents").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "paid"),
      ]);
      setLiveStats({ clients: clients ?? 0, docs: docs ?? 0, payments: payments ?? 0 });
    };
    fetchStats();
  }, []);

  const sliceMonths = period === "3m" ? 3 : period === "6m" ? 6 : 12;
  const chartData = monthlyRevenue.slice(-sliceMonths);
  const accentStroke =
    accent === "emerald" ? CHART_COLORS[1] : accent === "violet" ? CHART_COLORS[4] : CHART_COLORS[0];

  const handleExport = () => {
    exportToCsv(monthlyRevenue, "analytics_revenue");
    toast.success("Analytics exported.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-surface-foreground">Revenue &amp; client growth</h3>
          <p className="text-sm text-muted-foreground">
            {operatorName.trim() ? `Personalised for ${operatorName.trim()}` : "Revenue, growth, and product mix insights"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["3m", "6m", "12m"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors duration-200 ${
                  period === p ? "bg-primary-600 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={handleExport} aria-label="Export analytics data" className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">Personalise — display name</label>
          <input
            className="mt-1 w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="e.g. your desk or branch name"
            value={operatorName}
            onChange={(e) => persistPrefs({ operatorName: e.target.value, accent })}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Chart accent</label>
          <select
            className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={accent}
            onChange={(e) => persistPrefs({ operatorName, accent: e.target.value as typeof accent })}
          >
            <option value="blue">Ocean blue</option>
            <option value="emerald">Emerald</option>
            <option value="violet">Violet</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Clients" value={liveStats.clients > 0 ? liveStats.clients.toString() : "347"} change={8.2} icon={Users} color="bg-primary-100 text-primary-600" />
        <KPICard title="Policies Issued" value="512" change={12.5} icon={FileText} color="bg-accent-50 text-accent-600" />
        <KPICard title="Payments Collected" value={liveStats.payments > 0 ? `${liveStats.payments}` : "284"} change={5.3} icon={CreditCard} color="bg-primary-50 text-primary-700" />
        <KPICard title="Annual Revenue" value="MUR 3.1M" change={18.7} icon={TrendingUp} color="bg-warning-50 text-warning-600" />
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-surface-foreground mb-6">Revenue &amp; Client Growth</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentStroke} stopOpacity={0.15} />
                <stop offset="95%" stopColor={accentStroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v, n) => [n === "revenue" ? `MUR ${Number(v).toLocaleString()}` : v, n === "revenue" ? "Revenue" : "Clients"]} />
            <Legend />
            <Area type="monotone" dataKey="revenue" name="Revenue (MUR)" stroke={accentStroke} fill="url(#revGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product mix */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="font-semibold text-surface-foreground mb-6">Product Mix</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={productMix} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {productMix.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, "Share"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top brokers */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="font-semibold text-surface-foreground mb-4">Top Brokers by Commission</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topBrokers} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v) => [`MUR ${Number(v).toLocaleString()}`, "Commission"]} />
              <Bar dataKey="commission" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly policies table */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-surface-foreground">Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left">
                <th className="px-6 py-3 font-semibold text-surface-foreground">Month</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Revenue (MUR)</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">New Clients</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Policies</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Avg per Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {chartData.map((row) => (
                <tr key={row.month} className="hover:bg-primary-50/50 transition-colors duration-150">
                  <td className="px-6 py-3 font-medium text-surface-foreground">{row.month}</td>
                  <td className="px-6 py-3 text-surface-foreground">{row.revenue.toLocaleString()}</td>
                  <td className="px-6 py-3 text-surface-foreground">{row.clients}</td>
                  <td className="px-6 py-3 text-surface-foreground">{row.policies}</td>
                  <td className="px-6 py-3 text-muted-foreground">{Math.round(row.revenue / row.policies).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
