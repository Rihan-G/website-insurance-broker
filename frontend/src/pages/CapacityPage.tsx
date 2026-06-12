import { useState, useEffect } from "react";
import { BarChart2, Users, FileText, TrendingUp, Award, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { CHART_COLORS, PIE_COLORS } from "../lib/chartColors";

interface BrokerStat {
  id: string;
  full_name: string;
  email: string;
  policy_count: number;
  client_count: number;
  commission_total: number;
}

interface MonthlyData {
  month: string;
  policies: number;
  quotes: number;
  payments: number;
}

export function CapacityPage() {
  const [brokers, setBrokers] = useState<BrokerStat[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [productMix, setProductMix] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ clients: 0, policies: 0, quotes: 0, commissions: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Broker stats
      const { data: brokerProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "broker");

      const brokerStats: BrokerStat[] = [];
      for (const b of (brokerProfiles ?? [])) {
        const [{ count: pCount }, { count: cCount }, { data: comms }] = await Promise.all([
          supabase.from("policies").select("id", { count: "exact", head: true }).eq("broker_id", (b as { id: string }).id),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("assigned_broker", (b as { id: string }).id),
          db.commissions().select("amount").eq("broker_id", (b as { id: string }).id),
        ]);
        const commTotal = ((comms as { amount: number }[] | null) ?? []).reduce((s, c) => s + c.amount, 0);
        brokerStats.push({ ...(b as { id: string; full_name: string; email: string }), policy_count: pCount ?? 0, client_count: cCount ?? 0, commission_total: commTotal });
      }
      setBrokers(brokerStats);

      // Monthly data (last 6 months)
      const months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        const start = startOfMonth(d).toISOString();
        const end = endOfMonth(d).toISOString();
        const [{ count: pols }, { count: qts }, { count: pays }] = await Promise.all([
          supabase.from("policies").select("id", { count: "exact", head: true }).gte("created_at", start).lte("created_at", end),
          db.quotes().select("id", { count: "exact", head: true }).gte("created_at", start).lte("created_at", end),
          db.payments().select("id", { count: "exact", head: true }).eq("status", "paid").gte("created_at", start).lte("created_at", end),
        ]);
        months.push({ month: format(d, "MMM"), policies: pols ?? 0, quotes: qts ?? 0, payments: pays ?? 0 });
      }
      setMonthlyData(months);

      // Product mix
      const { data: pols } = await supabase.from("policies").select("product_type");
      const mix: Record<string, number> = {};
      for (const p of (pols ?? []) as { product_type: string }[]) mix[p.product_type] = (mix[p.product_type] ?? 0) + 1;
      setProductMix(Object.entries(mix).map(([name, value]) => ({ name, value })));

      // Totals
      const [{ count: clients }, { count: policies }, { count: quotes }, { data: commAgg }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("policies").select("id", { count: "exact", head: true }),
        db.quotes().select("id", { count: "exact", head: true }),
        db.commissions().select("amount"),
      ]);
      const totalComm = ((commAgg as { amount: number }[] | null) ?? []).reduce((s, c) => s + c.amount, 0);
      setTotals({ clients: clients ?? 0, policies: policies ?? 0, quotes: quotes ?? 0, commissions: totalComm });

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Capacity Management</h2>
        <p className="text-muted-foreground">Portfolio overview, broker workload, and business performance</p>
      </div>

      <div className="rounded-xl border border-primary-200 bg-primary-50/90 p-4 text-sm dark:border-primary-800/50 dark:bg-primary-950/35 dark:text-primary-100">
        <p className="font-semibold text-surface-foreground">Capacity &amp; workload review</p>
        <p className="mt-1 text-muted-foreground dark:text-primary-100/85">
          Use broker workload bars as a discussion starter with leadership — redistribute policies when any broker is consistently above the pack.
        </p>
      </div>

      {/* Portfolio totals */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Clients", value: totals.clients, icon: Users, color: "text-primary-600 bg-primary-50" },
          { label: "Active Policies", value: totals.policies, icon: FileText, color: "text-accent-600 bg-accent-50" },
          { label: "Total Quotes", value: totals.quotes, icon: TrendingUp, color: "text-primary-700 bg-primary-50" },
          { label: "Total Commissions", value: `MUR ${totals.commissions.toLocaleString()}`, icon: Award, color: "text-warning-600 bg-warning-50" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-surface-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-surface-foreground mb-4">6-Month Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "12px" }} />
              <Bar dataKey="policies" name="Policies" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="quotes" name="Quotes" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="payments" name="Payments" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product mix */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="font-semibold text-surface-foreground mb-4">Product Mix</h3>
          {productMix.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={productMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}>
                  {productMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {productMix.map((p, i) => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`h-2 w-2 rounded-full shrink-0 pie-dot-${i % 6}`} />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto font-medium text-surface-foreground">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broker workload */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-surface-foreground">Broker Workload</h3>
        </div>
        {brokers.length === 0 ? (
          <div className="py-12 text-center">
            <BarChart2 className="mx-auto h-10 w-10 text-muted-foreground opacity-40 mb-2" />
            <p className="text-sm text-muted-foreground">No brokers found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(() => {
              const list = [...brokers].sort((a, b) => b.policy_count - a.policy_count);
              const maxPolicies = Math.max(...list.map((x) => x.policy_count), 1);
              return list.map((b) => {
                const workloadPct = Math.min(100, (b.policy_count / maxPolicies) * 100);
                return (
              <div key={b.id} className="flex items-center gap-4 px-6 py-4">
                <div className="h-9 w-9 rounded-full bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">{b.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-foreground">{b.full_name}</p>
                  <p className="text-xs text-muted-foreground">{b.email}</p>
                  <div className="mt-1 flex items-center gap-4">
                    <progress
                      className="thin-progress w-full"
                      max={100}
                      value={workloadPct}
                      aria-label={`${b.full_name} relative workload ${Math.round(workloadPct)}%`}
                    />
                  </div>

                </div>
                <div className="grid grid-cols-3 gap-6 text-center shrink-0">
                  <div>
                    <p className="text-lg font-bold text-surface-foreground">{b.policy_count}</p>
                    <p className="text-xs text-muted-foreground">Policies</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-surface-foreground">{b.client_count}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-surface-foreground">MUR {b.commission_total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Commission</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
