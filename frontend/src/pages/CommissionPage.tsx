import { useState, useEffect } from "react";
import { Award, TrendingUp, Download, Plus } from "lucide-react";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { exportToCsv } from "../lib/exportService";
import toast from "react-hot-toast";

interface Commission {
  id: string;
  broker_id: string;
  policy_id: string;
  amount: number;
  rate: number;
  status: string;
  created_at: string;
  broker?: { full_name: string };
  policy?: { policy_number: string; product_type: string; premium: number };
}

const statusStyles: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700",
  paid: "bg-accent-50 text-accent-700",
  cancelled: "bg-muted text-muted-foreground",
};

export function CommissionPage() {
  const { user, profile } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; earned: number; paid: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ earned: 0, paid: 0, pending: 0 });
  const [showForm, setShowForm] = useState(false);
  const [brokerProfiles, setBrokerProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [policies, setPolicies] = useState<{ id: string; policy_number: string; product_type: string; premium: number }[]>([]);
  const [form, setForm] = useState({ broker_id: "", policy_id: "", rate: "10", amount: "" });

  const isAdmin = profile?.role === "admin";
  const isBroker = profile?.role === "broker";

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const commQuery = isAdmin
      ? db.commissions().select("*, broker:profiles!commissions_broker_id_fkey(full_name), policy:policies(policy_number, product_type, premium)").order("created_at", { ascending: false })
      : db.commissions().select("*, broker:profiles!commissions_broker_id_fkey(full_name), policy:policies(policy_number, product_type, premium)").eq("broker_id", user.id).order("created_at", { ascending: false });

    const { data } = await commQuery;
    const comms = (data as Commission[]) ?? [];
    setCommissions(comms);

    const earned = comms.reduce((s, c) => s + c.amount, 0);
    const paid = comms.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);
    const pending = comms.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);
    setTotals({ earned, paid, pending });

    // Monthly trend
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = startOfMonth(d).toISOString();
      const end = endOfMonth(d).toISOString();
      const monthComms = comms.filter((c) => c.created_at >= start && c.created_at <= end);
      months.push({
        month: format(d, "MMM"),
        earned: monthComms.reduce((s, c) => s + c.amount, 0),
        paid: monthComms.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0),
      });
    }
    setMonthlyData(months);

    // Admin helpers
    if (isAdmin) {
      const [{ data: bp }, { data: pols }] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("role", "broker"),
        supabase.from("policies").select("id, policy_number, product_type, premium").order("created_at", { ascending: false }).limit(100),
      ]);
      setBrokerProfiles((bp as typeof brokerProfiles) ?? []);
      setPolicies((pols as typeof policies) ?? []);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addCommission = async () => {
    if (!form.broker_id || !form.policy_id || !form.rate) {
      toast.error("Please fill in all fields.");
      return;
    }
    const pol = policies.find((p) => p.id === form.policy_id);
    const amount = form.amount ? parseFloat(form.amount) : (pol?.premium ?? 0) * (parseFloat(form.rate) / 100);
    const { error } = await db.commissions().insert({
      broker_id: form.broker_id,
      policy_id: form.policy_id,
      rate: parseFloat(form.rate),
      amount,
      status: "pending",
    });
    if (error) { toast.error("Failed to record commission."); return; }
    toast.success("Commission recorded.");
    setShowForm(false);
    setForm({ broker_id: "", policy_id: "", rate: "10", amount: "" });
    fetchData();
  };

  const markPaid = async (id: string) => {
    await db.commissions().update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    toast.success("Commission marked as paid.");
    fetchData();
  };

  const exportCsv = () => {
    exportToCsv(commissions.map((c) => ({
      Date: c.created_at,
      Broker: c.broker?.full_name ?? c.broker_id,
      Policy: c.policy?.policy_number ?? c.policy_id,
      Product: c.policy?.product_type ?? "",
      Rate: `${c.rate}%`,
      Amount: c.amount,
      Status: c.status,
    })), "commissions");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Commission Tracker</h2>
          <p className="text-muted-foreground">{isAdmin ? "Manage broker commissions" : "Your earnings overview"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
            <Download className="h-4 w-4" />Export CSV
          </button>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors">
              <Plus className="h-4 w-4" />Record Commission
            </button>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Earned", value: totals.earned, color: "text-surface-foreground", icon: Award },
          { label: "Total Paid", value: totals.paid, color: "text-accent-600", icon: TrendingUp },
          { label: "Pending Payment", value: totals.pending, color: "text-warning-600", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>MUR {s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="font-semibold text-surface-foreground mb-4">6-Month Commission Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => `MUR ${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
            <Bar dataKey="earned" name="Earned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-surface-foreground">Commission Records</h3>
        </div>
        {commissions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Award className="mx-auto h-8 w-8 opacity-40 mb-2" />
            <p className="text-sm">No commissions recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Date", isAdmin ? "Broker" : null, "Policy", "Product", "Rate", "Amount", "Status", isAdmin ? "Action" : null].filter(Boolean).map((h) => (
                    <th key={h as string} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    {isAdmin && <td className="px-4 py-3 font-medium text-surface-foreground">{c.broker?.full_name ?? "—"}</td>}
                    <td className="px-4 py-3 text-muted-foreground">{c.policy?.policy_number ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.policy?.product_type ?? "—"}</td>
                    <td className="px-4 py-3">{c.rate}%</td>
                    <td className="px-4 py-3 font-semibold text-surface-foreground">MUR {c.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[c.status] ?? ""}`}>{c.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {c.status === "pending" && (
                          <button onClick={() => markPaid(c.id)} className="text-xs text-accent-600 hover:underline cursor-pointer">Mark Paid</button>
                        )}
                      </td>
                    )}
                    {isBroker && <td className="px-4 py-3" />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add commission modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-surface-foreground">Record Commission</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Broker</label>
              <select aria-label="Select broker" value={form.broker_id} onChange={(e) => setForm((p) => ({ ...p, broker_id: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm cursor-pointer">
                <option value="">Select broker…</option>
                {brokerProfiles.map((b) => <option key={b.id} value={b.id}>{b.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Policy</label>
              <select aria-label="Select policy" value={form.policy_id} onChange={(e) => setForm((p) => ({ ...p, policy_id: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm cursor-pointer">
                <option value="">Select policy…</option>
                {policies.map((p) => <option key={p.id} value={p.id}>{p.product_type} · {p.policy_number} (MUR {p.premium.toLocaleString()})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Rate (%)</label>
                <input type="number" aria-label="Commission rate percentage" placeholder="0.0" value={form.rate} onChange={(e) => setForm((p) => ({ ...p, rate: e.target.value }))} min="0" max="50" step="0.5" className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount (MUR, optional)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Auto from rate" className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={addCommission} className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
