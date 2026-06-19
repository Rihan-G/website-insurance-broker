import { subMonths, format } from "date-fns";

type BrokerRow = {
  id: string;
  name: string;
  policiesActive: number;
  renewedThisMonth: number;
  lapsedThisMonth: number;
  revenueThisMonth: number;
  topProduct: string;
};

const DEMO_BROKERS: BrokerRow[] = [
  { id: "b1", name: "Jean Ramsamy", policiesActive: 142, renewedThisMonth: 18, lapsedThisMonth: 3, revenueThisMonth: 284000, topProduct: "Motor" },
  { id: "b2", name: "Marie-Claire Ng", policiesActive: 98, renewedThisMonth: 12, lapsedThisMonth: 1, revenueThisMonth: 196500, topProduct: "Health" },
  { id: "b3", name: "Anwar Edoo", policiesActive: 76, renewedThisMonth: 9, lapsedThisMonth: 4, revenueThisMonth: 142000, topProduct: "Business" },
];

type MonthPoint = { month: string; renewed: number; lapsed: number; revenue: number };

const DEMO_TREND: MonthPoint[] = [
  { month: format(subMonths(new Date(), 5), "MMM"), renewed: 31, lapsed: 5, revenue: 548000 },
  { month: format(subMonths(new Date(), 4), "MMM"), renewed: 28, lapsed: 6, revenue: 502000 },
  { month: format(subMonths(new Date(), 3), "MMM"), renewed: 35, lapsed: 4, revenue: 618000 },
  { month: format(subMonths(new Date(), 2), "MMM"), renewed: 40, lapsed: 3, revenue: 710000 },
  { month: format(subMonths(new Date(), 1), "MMM"), renewed: 37, lapsed: 5, revenue: 664000 },
  { month: format(new Date(), "MMM"), renewed: 39, lapsed: 8, revenue: 622500 },
];

type TopClient = { name: string; annualPremium: number; policies: number };

const TOP_CLIENTS: TopClient[] = [
  { name: "Sindicom Group Ltd", annualPremium: 480000, policies: 6 },
  { name: "Flacq United Estates", annualPremium: 320000, policies: 4 },
  { name: "New Mauritius Hotels", annualPremium: 258000, policies: 3 },
  { name: "Rogers & Co Ltd", annualPremium: 198000, policies: 5 },
  { name: "ENL Group", annualPremium: 175000, policies: 3 },
];

const maxRevenue = Math.max(...DEMO_TREND.map((m) => m.revenue));

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-primary-600 dark:text-primary-400" : "text-surface-foreground"}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function BrokerPerformancePage() {
  const totalActive = DEMO_BROKERS.reduce((s, b) => s + b.policiesActive, 0);
  const totalRenewed = DEMO_BROKERS.reduce((s, b) => s + b.renewedThisMonth, 0);
  const totalLapsed = DEMO_BROKERS.reduce((s, b) => s + b.lapsedThisMonth, 0);
  const totalRevenue = DEMO_BROKERS.reduce((s, b) => s + b.revenueThisMonth, 0);
  const retentionRate = Math.round((totalRenewed / (totalRenewed + totalLapsed)) * 100);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Management</p>
        <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Broker performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Portfolio health, renewal rates, and revenue across the team — {format(new Date(), "MMMM yyyy")}.</p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active policies" value={totalActive.toString()} sub="across all brokers" />
        <StatCard label="Renewed this month" value={totalRenewed.toString()} sub={`${retentionRate}% retention rate`} accent />
        <StatCard label="Lapsed this month" value={totalLapsed.toString()} sub="policies not renewed" />
        <StatCard label="Revenue this month" value={`MUR ${(totalRevenue / 1000).toFixed(0)}k`} sub="gross premium" accent />
      </div>

      {/* Revenue trend chart */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-bold text-surface-foreground mb-4">Revenue trend — last 6 months</p>
        <div className="flex items-end gap-3 h-40">
          {DEMO_TREND.map((m) => (
            <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground">
                {(m.revenue / 1000).toFixed(0)}k
              </p>
              <div className="w-full rounded-t-lg bg-primary-500/20 dark:bg-primary-500/10 overflow-hidden" style={{ height: "6rem" }}>
                <div
                  className="w-full rounded-t-lg bg-primary-500 transition-all"
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{m.month}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4">
          {DEMO_TREND.map((m) => (
            <div key={m.month} className="flex-1 text-center">
              <p className="text-[10px] text-accent-600 dark:text-accent-400 font-semibold">{m.renewed}↑</p>
              <p className="text-[10px] text-danger-500">{m.lapsed}↓</p>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground text-center">↑ renewed · ↓ lapsed</p>
      </div>

      {/* Broker table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Team breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {["Broker", "Active", "Renewed", "Lapsed", "Retention", "Revenue (MUR)", "Top product"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {DEMO_BROKERS.map((b) => {
                const ret = Math.round((b.renewedThisMonth / (b.renewedThisMonth + b.lapsedThisMonth)) * 100);
                return (
                  <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-surface-foreground">{b.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.policiesActive}</td>
                    <td className="px-4 py-3 text-accent-600 dark:text-accent-400 font-semibold">{b.renewedThisMonth}</td>
                    <td className="px-4 py-3 text-danger-500">{b.lapsedThisMonth}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${ret >= 80 ? "bg-accent-100 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300" : "bg-warning-100 text-warning-700 dark:bg-warning-950/30 dark:text-warning-300"}`}>
                        {ret}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-surface-foreground">{b.revenueThisMonth.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.topProduct}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top clients */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border/80 bg-muted/20 px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Top clients by annual premium</p>
        </div>
        <ul className="divide-y divide-border/60">
          {TOP_CLIENTS.map((c, i) => (
            <li key={c.name} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
              <span className="w-5 shrink-0 text-sm font-bold text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-foreground truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.policies} polic{c.policies !== 1 ? "ies" : "y"}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-surface-foreground">MUR {c.annualPremium.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
