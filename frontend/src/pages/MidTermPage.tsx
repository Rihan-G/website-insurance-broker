import { useState, useEffect } from "react";
import { RefreshCw, Plus, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Adjustment {
  id: string;
  policy_id: string;
  adjustment_type: string;
  description: string;
  premium_change: number | null;
  status: string;
  created_at: string;
  policy?: { policy_number: string; product_type: string };
}

const adjustmentTypes = [
  "Change of vehicle", "Address change", "Additional driver",
  "Coverage increase", "Coverage decrease", "Endorsement",
  "Name change", "Bank detail update", "Beneficiary change", "Other",
];

const statusStyles: Record<string, string> = {
  pending: "bg-warning-50 text-warning-600",
  in_review: "bg-primary-50 text-primary-600",
  approved: "bg-accent-50 text-accent-600",
  rejected: "bg-danger-50 text-danger-600",
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  in_review: RefreshCw,
  approved: CheckCircle,
  rejected: XCircle,
};

export function MidTermPage() {
  const { user, profile } = useAuth();
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [policies, setPolicies] = useState<{ id: string; policy_number: string; product_type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ policy_id: "", adjustment_type: "", description: "", premium_change: "" });

  const isAdminOrBroker = profile?.role === "admin" || profile?.role === "broker";

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: adjs }, { data: pols }] = await Promise.all([
      isAdminOrBroker
        ? db.midTermAdjustments().select("*, policy:policies(policy_number, product_type)").order("created_at", { ascending: false })
        : db.midTermAdjustments().select("*, policy:policies(policy_number, product_type)").eq("client_id", user.id).order("created_at", { ascending: false }),
      supabase.from("policies").select("id, policy_number, product_type").eq("client_id", user.id),
    ]);
    setAdjustments((adjs as Adjustment[]) ?? []);
    setPolicies((pols as { id: string; policy_number: string; product_type: string }[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitAdjustment = async () => {
    if (!user || !form.policy_id || !form.adjustment_type || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await db.midTermAdjustments().insert({
        policy_id: form.policy_id,
        client_id: user.id,
        adjustment_type: form.adjustment_type,
        description: form.description,
        premium_change: form.premium_change ? parseFloat(form.premium_change) : null,
      });
      if (error) throw error;
      toast.success("Mid-term adjustment request submitted.");
      setShowForm(false);
      setForm({ policy_id: "", adjustment_type: "", description: "", premium_change: "" });
      fetchData();
    } catch {
      toast.error("Failed to submit adjustment request.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await db.midTermAdjustments().update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Failed to update status."); return; }
    toast.success(`Adjustment ${status}.`);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Mid-Term Adjustments</h2>
          <p className="text-muted-foreground">Request or review changes to active policies</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-5 flex gap-3 dark:border-primary-700/50 dark:bg-primary-950/45">
        <AlertTriangle className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
        <div className="text-sm text-primary-800 dark:text-primary-100">
          <p className="font-semibold">What is a mid-term adjustment?</p>
          <p className="mt-1">A mid-term adjustment (MTA) is any change made to an active policy between the start and renewal date — such as adding a driver, changing your address, or updating your vehicle details. Premium adjustments may apply.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : adjustments.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <RefreshCw className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-40" />
          <p className="text-muted-foreground">No adjustment requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adjustments.map((adj) => {
            const Icon = statusIcons[adj.status] ?? Clock;
            return (
              <div key={adj.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[adj.status] ?? ""}`}>
                        <Icon className="h-3 w-3" />
                        {adj.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">{adj.adjustment_type}</span>
                    </div>
                    <p className="font-medium text-surface-foreground">{adj.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {adj.policy?.product_type} · {adj.policy?.policy_number} · {new Date(adj.created_at).toLocaleDateString()}
                    </p>
                    {adj.premium_change !== null && (
                      <p className={`text-xs font-medium mt-1 ${adj.premium_change >= 0 ? "text-danger-600" : "text-accent-600"}`}>
                        Premium change: {adj.premium_change >= 0 ? "+" : ""}MUR {adj.premium_change}
                      </p>
                    )}
                  </div>
                  {isAdminOrBroker && adj.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => updateStatus(adj.id, "approved")} className="rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-700 cursor-pointer transition-colors">Approve</button>
                      <button onClick={() => updateStatus(adj.id, "rejected")} className="rounded-lg bg-danger-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger-700 cursor-pointer transition-colors">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-surface-foreground">New Mid-Term Adjustment Request</h3>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Policy</label>
              <select aria-label="Select policy" value={form.policy_id} onChange={(e) => setForm((p) => ({ ...p, policy_id: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none cursor-pointer">
                <option value="">Select policy…</option>
                {policies.map((p) => <option key={p.id} value={p.id}>{p.product_type} · {p.policy_number}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Adjustment Type</label>
              <select aria-label="Select adjustment type" value={form.adjustment_type} onChange={(e) => setForm((p) => ({ ...p, adjustment_type: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none cursor-pointer">
                <option value="">Select type…</option>
                {adjustmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the change you need…" className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Expected Premium Change (MUR, optional)</label>
              <input type="number" value={form.premium_change} onChange={(e) => setForm((p) => ({ ...p, premium_change: e.target.value }))} placeholder="e.g. 500 or -200" className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer">Cancel</button>
              <button onClick={submitAdjustment} disabled={submitting} className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer">
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
