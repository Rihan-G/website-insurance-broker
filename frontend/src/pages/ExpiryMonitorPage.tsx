import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Clock, Bell, BellOff, RefreshCw, Plus } from "lucide-react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { differenceInDays, format } from "date-fns";
import toast from "react-hot-toast";

interface ExpiryAlert {
  id: string;
  client_id: string;
  alert_type: string;
  expires_at: string;
  days_before_alert: number;
  status: string;
  notified_at: string | null;
  created_at: string;
  client?: { full_name: string; email: string };
  policy?: { policy_number: string; product_type: string; insurer: string };
}

function urgencyColor(daysLeft: number) {
  if (daysLeft <= 7) return "text-danger-600 bg-danger-50 border-danger-200";
  if (daysLeft <= 30) return "text-warning-600 bg-warning-50 border-warning-200";
  return "text-accent-600 bg-accent-50 border-accent-200";
}

function urgencyIcon(daysLeft: number) {
  if (daysLeft <= 7) return AlertTriangle;
  if (daysLeft <= 30) return Clock;
  return CheckCircle;
}

export function ExpiryMonitorPage() {
  const { user, profile } = useAuth();
  const [alerts, setAlerts] = useState<ExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "soon" | "upcoming">("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    clientEmail: "",
    alertType: "policy_expiry",
    expiresAt: "",
    daysBeforeAlert: "30",
  });
  const [adding, setAdding] = useState(false);

  const isAdminOrBroker = profile?.role === "admin" || profile?.role === "broker";

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const query = isAdminOrBroker
      ? db.expiryAlerts().select("*, client:profiles!expiry_alerts_client_id_fkey(full_name, email), policy:policies(policy_number, product_type, insurer)").eq("status", "active").order("expires_at", { ascending: true })
      : db.expiryAlerts().select("*, policy:policies(policy_number, product_type, insurer)").eq("client_id", user.id).eq("status", "active").order("expires_at", { ascending: true });

    const { data, error } = await query;
    if (!error) setAlerts((data as unknown as ExpiryAlert[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissAlert = async (id: string) => {
    await db.expiryAlerts().update({ status: "dismissed" }).eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert dismissed.");
  };

  const snoozeAlert = async (id: string) => {
    await db.expiryAlerts().update({ status: "snoozed" }).eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert snoozed for 7 days.");
  };

  const addAlert = async () => {
    if (!user || !addForm.clientEmail || !addForm.expiresAt) {
      toast.error("All fields are required.");
      return;
    }
    setAdding(true);
    try {
      const { data: client } = await db.profiles().select("id").eq("email", addForm.clientEmail).single();
      if (!client) { toast.error("Client not found."); return; }

      const { error } = await db.expiryAlerts().insert({
        client_id: (client as { id: string }).id,
        alert_type: addForm.alertType,
        expires_at: addForm.expiresAt,
        days_before_alert: parseInt(addForm.daysBeforeAlert),
      });

      if (error) throw error;
      toast.success("Alert created.");
      setShowAddForm(false);
      fetchAlerts();
    } catch {
      toast.error("Failed to create alert.");
    } finally {
      setAdding(false);
    }
  };

  const now = new Date();

  const filtered = alerts.filter((a) => {
    const daysLeft = differenceInDays(new Date(a.expires_at), now);
    if (filter === "critical") return daysLeft <= 7;
    if (filter === "soon") return daysLeft > 7 && daysLeft <= 30;
    if (filter === "upcoming") return daysLeft > 30;
    return true;
  });

  const criticalCount = alerts.filter((a) => differenceInDays(new Date(a.expires_at), now) <= 7).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Expiry Monitor</h2>
          <p className="text-muted-foreground">
            Track policy and document expiry dates
            {criticalCount > 0 && (
              <span className="ml-2 rounded-full bg-danger-600 px-2 py-0.5 text-xs font-semibold text-white">
                {criticalCount} critical
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAlerts} aria-label="Refresh alerts" className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
            <RefreshCw className="h-4 w-4" />
          </button>
          {isAdminOrBroker && (
            <button onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200">
              <Plus className="h-4 w-4" />
              Add Alert
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Critical (≤7 days)", count: alerts.filter((a) => differenceInDays(new Date(a.expires_at), now) <= 7).length, color: "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700/40 dark:bg-danger-950/35 dark:text-danger-200" },
          { label: "Soon (8–30 days)", count: alerts.filter((a) => { const d = differenceInDays(new Date(a.expires_at), now); return d > 7 && d <= 30; }).length, color: "border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-700/40 dark:bg-warning-950/35 dark:text-warning-200" },
          { label: "Upcoming (30+ days)", count: alerts.filter((a) => differenceInDays(new Date(a.expires_at), now) > 30).length, color: "border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-700/35 dark:bg-accent-950/30 dark:text-accent-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.color}`}>
            <p className="text-3xl font-bold">{s.count}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "critical", "soon", "upcoming"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize cursor-pointer transition-colors duration-200 ${
              filter === f ? "bg-primary-600 text-white" : "bg-muted text-muted-foreground hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-950/55 dark:hover:text-primary-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-accent-500 mb-3" />
          <p className="font-medium text-surface-foreground">No alerts in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const daysLeft = differenceInDays(new Date(alert.expires_at), now);
            const Icon = urgencyIcon(daysLeft);
            const color = urgencyColor(daysLeft);
            return (
              <div key={alert.id} className={`flex items-start gap-4 rounded-xl border p-5 ${color}`}>
                <div className="mt-0.5 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{alert.client?.full_name ?? "Your Policy"}</p>
                      <p className="text-sm capitalize">{alert.alert_type.replace(/_/g, " ")} · {alert.policy?.product_type ?? "Insurance"}</p>
                      {alert.policy?.policy_number && (
                        <p className="text-xs mt-0.5 opacity-80">Policy: {alert.policy.policy_number}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold">{daysLeft > 0 ? `${daysLeft}d` : "Expired"}</p>
                      <p className="text-xs">{format(new Date(alert.expires_at), "dd MMM yyyy")}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => snoozeAlert(alert.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/60 border border-current/20 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-white/80 transition-colors duration-200">
                      <BellOff className="h-3.5 w-3.5" />
                      Snooze
                    </button>
                    <button onClick={() => dismissAlert(alert.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/60 border border-current/20 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-white/80 transition-colors duration-200">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Dismiss
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-white/60 border border-current/20 px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-white/80 transition-colors duration-200">
                      <Bell className="h-3.5 w-3.5" />
                      Remind Client
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add alert form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-surface-foreground">Add Expiry Alert</h3>
            {[
              { label: "Client Email", key: "clientEmail", type: "email", placeholder: "client@email.com" },
              { label: "Expiry Date", key: "expiresAt", type: "date" },
              { label: "Alert Days Before", key: "daysBeforeAlert", type: "number", placeholder: "30" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-surface-foreground mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={addForm[f.key as keyof typeof addForm]}
                  onChange={(e) => setAddForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Alert Type</label>
              <select aria-label="Select alert type" value={addForm.alertType} onChange={(e) => setAddForm((p) => ({ ...p, alertType: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none">
                <option value="policy_expiry">Policy Expiry</option>
                <option value="document_expiry">Document Expiry</option>
                <option value="renewal_due">Renewal Due</option>
                <option value="payment_due">Payment Due</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddForm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer">Cancel</button>
              <button onClick={addAlert} disabled={adding} className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer">
                {adding ? "Adding…" : "Add Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
