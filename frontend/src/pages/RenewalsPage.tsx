import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { RefreshCw, Plus, Calendar, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import {
  WORKFLOW_COLOR_OPTIONS,
  workflowColorChipClass,
  workflowColorDotClass,
  type WorkflowColorToken,
} from "../lib/workflowChips";

type RenewalStatus = "scheduled" | "due" | "completed" | "lapsed" | "cancelled";

interface RenewalRow {
  id: string;
  client_id: string;
  policy_id: string | null;
  title: string;
  notes: string | null;
  renewal_date: string;
  status: RenewalStatus;
  color_token: string;
  template_key: string | null;
  client?: { full_name: string; email: string } | null;
  policy?: { policy_number: string; product_type: string } | null;
}

const STATUS_BADGE: Record<RenewalStatus, string> = {
  scheduled: "bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-200",
  due: "bg-warning-100 text-warning-800 dark:bg-warning-950/40 dark:text-warning-200",
  completed: "bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-200",
  lapsed: "bg-muted text-muted-foreground",
  cancelled: "bg-danger-50 text-danger-700 dark:bg-danger-950/30 dark:text-danger-200",
};

export function RenewalsPage() {
  const { user, profile, demoAuthActive } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const [rows, setRows] = useState<RenewalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [policies, setPolicies] = useState<{ id: string; policy_number: string; product_type: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    client_id: "",
    policy_id: "",
    title: "",
    renewal_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    color_token: "primary" as WorkflowColorToken,
    status: "scheduled" as RenewalStatus,
    template_key: "",
  });

  const loadRenewals = useCallback(async () => {
    if (!user || demoAuthActive) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = db
      .renewals()
      .select(
        `
        id, client_id, policy_id, title, notes, renewal_date, status, color_token, template_key,
        client:profiles!renewals_client_id_fkey ( full_name, email ),
        policy:policies ( policy_number, product_type )
      `,
      )
      .order("renewal_date", { ascending: true });
    if (profile?.role === "client") {
      q = q.eq("client_id", user.id);
    }
    const { data, error } = await q;
    setLoading(false);
    if (error) {
      setRows([]);
      toast.error("Could not load renewals.");
      return;
    }
    setRows((data ?? []) as RenewalRow[]);
  }, [user, profile?.role, demoAuthActive]);

  useEffect(() => {
    void loadRenewals();
  }, [loadRenewals]);

  useEffect(() => {
    if (!isStaff || demoAuthActive) {
      setClients([]);
      return;
    }
    void supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "client")
      .order("full_name")
      .then(({ data }) => setClients((data ?? []) as typeof clients));
  }, [isStaff, demoAuthActive]);

  useEffect(() => {
    if (!form.client_id || demoAuthActive) {
      setPolicies([]);
      return;
    }
    void db
      .policies()
      .select("id, policy_number, product_type")
      .eq("client_id", form.client_id)
      .order("end_date", { ascending: false })
      .then(({ data }) => setPolicies((data ?? []) as typeof policies));
  }, [form.client_id, demoAuthActive]);

  const submitRenewal = async () => {
    if (!user || !isStaff) return;
    if (!form.client_id || !form.title.trim()) {
      toast.error("Client and title are required.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await db.renewals().insert({
        client_id: form.client_id,
        policy_id: form.policy_id || null,
        title: form.title.trim(),
        notes: form.notes.trim() || null,
        renewal_date: form.renewal_date,
        status: form.status,
        color_token: form.color_token,
        template_key: form.template_key.trim() || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success("Renewal saved.");
      setShowForm(false);
      setForm({
        client_id: "",
        policy_id: "",
        title: "",
        renewal_date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        color_token: "primary",
        status: "scheduled",
        template_key: "",
      });
      void loadRenewals();
    } catch {
      toast.error("Failed to save renewal.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: RenewalStatus) => {
    if (!isStaff) return;
    const { error } = await db.renewals().update({ status }).eq("id", id);
    if (error) {
      toast.error("Update failed.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success("Renewal updated.");
  };

  const removeRenewal = async (id: string) => {
    if (!isStaff) return;
    if (!confirm("Delete this renewal record?")) return;
    const { error } = await db.renewals().delete().eq("id", id);
    if (error) {
      toast.error("Delete failed.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Renewal removed.");
  };

  if (demoAuthActive) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-foreground">Renewals</h2>
        <p className="text-muted-foreground">Renewals use live Supabase data. Turn off demo login to manage renewal dates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Renewals</h2>
          <p className="text-muted-foreground">
            {isStaff ? "Schedule and track policy renewals per client." : "Your upcoming renewals as recorded by your broker."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadRenewals()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {isStaff && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add renewal
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-primary-200/60 bg-primary-50/50 p-4 text-sm text-primary-900 dark:border-primary-900/40 dark:bg-primary-950/30 dark:text-primary-100">
        <p className="font-medium text-surface-foreground">Shared styling with Tasks</p>
        <p className="mt-1 text-muted-foreground">
          Colour chips use the same tokens on both pages so renewals and day tasks look consistent in lists and exports.
        </p>
      </div>

      {isStaff && showForm && (
        <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
          <h3 className="font-semibold text-surface-foreground">New renewal</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-surface-foreground">Client</label>
              <select
                value={form.client_id}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value, policy_id: "" }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-foreground">Policy (optional)</label>
              <select
                value={form.policy_id}
                onChange={(e) => setForm((f) => ({ ...f, policy_id: e.target.value }))}
                disabled={!form.client_id}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">None</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.policy_number} — {p.product_type}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-surface-foreground">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                placeholder="e.g. Motor renewal FY2026"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-foreground">Renewal date</label>
              <input
                type="date"
                value={form.renewal_date}
                onChange={(e) => setForm((f) => ({ ...f, renewal_date: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RenewalStatus }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="scheduled">Scheduled</option>
                <option value="due">Due</option>
                <option value="completed">Completed</option>
                <option value="lapsed">Lapsed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-foreground">Colour tag</label>
              <select
                value={form.color_token}
                onChange={(e) => setForm((f) => ({ ...f, color_token: e.target.value as WorkflowColorToken }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                {WORKFLOW_COLOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-foreground">Template key (optional)</label>
              <input
                value={form.template_key}
                onChange={(e) => setForm((f) => ({ ...f, template_key: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                placeholder="e.g. motor_standard_v1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-surface-foreground">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm cursor-pointer">
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void submitRenewal()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save renewal
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No renewals yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${workflowColorDotClass(r.color_token)}`} aria-hidden />
                  <div className="min-w-0">
                    <p className="font-medium text-surface-foreground truncate">{r.title}</p>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {format(parseISO(r.renewal_date), "d MMM yyyy")}
                      {isStaff && r.client && <span>· {r.client.full_name}</span>}
                      {r.policy && (
                        <span className="text-xs">
                          · {r.policy.policy_number} ({r.policy.product_type})
                        </span>
                      )}
                    </p>
                    {r.notes && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.notes}</p>}
                    {r.template_key && (
                      <p className="mt-1 text-xs font-mono text-muted-foreground">Template: {r.template_key}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${workflowColorChipClass(r.color_token)}`}>
                    {r.color_token}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[r.status]}`}>{r.status}</span>
                  {isStaff && (
                    <>
                      <select
                        value={r.status}
                        onChange={(e) => void updateStatus(r.id, e.target.value as RenewalStatus)}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs cursor-pointer"
                      >
                        {(Object.keys(STATUS_BADGE) as RenewalStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label="Delete renewal"
                        onClick={() => void removeRenewal(r.id)}
                        className="rounded-lg p-2 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
