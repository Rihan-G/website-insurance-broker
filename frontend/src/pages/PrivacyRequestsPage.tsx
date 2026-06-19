import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ShieldCheck, RefreshCw, CheckCircle2, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "../components/EmptyState";

type RequestType = "export" | "delete";
type RequestStatus = "pending" | "in_progress" | "done";

interface DataRequest {
  id: string;
  client_id: string;
  type: RequestType;
  status: RequestStatus;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  client?: { full_name: string; email: string } | null;
}

const statusTone: Record<RequestStatus, string> = {
  pending: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950/30 dark:text-warning-300 dark:border-warning-800/50",
  in_progress: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/30 dark:text-primary-300 dark:border-primary-800/50",
  done: "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-950/30 dark:text-accent-300 dark:border-accent-800/50",
};

const STATUS_OPTIONS: RequestStatus[] = ["pending", "in_progress", "done"];

export function PrivacyRequestsPage() {
  const { session } = useAuth();
  const [rows, setRows] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await db
      .dataRequests()
      .select("*, client:profiles!data_requests_client_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast.error(error.message ?? "Failed to load requests.");
    } else {
      setRows((data as DataRequest[]) ?? []);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: RequestStatus) => {
    setUpdatingId(id);
    const { error } = await db
      .dataRequests()
      .update({ status, resolved_at: status === "done" ? new Date().toISOString() : null })
      .eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast.error(error.message ?? "Update failed.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status, resolved_at: status === "done" ? new Date().toISOString() : null } : r)));
    toast.success("Status updated.");
  };

  const pending = rows.filter((r) => r.status !== "done").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Compliance</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Data & Privacy Requests</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Client DSAR submissions under the Mauritius Data Protection Act. Fulfil requests manually and mark done.
            {pending > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-950/40 dark:text-warning-300">
                {pending} open
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted/80"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm dark:shadow-none">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShieldCheck}
              title="No data requests yet"
              description="When clients submit export or deletion requests from the Settings page, they appear here for staff action."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Request type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resolved</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(r.created_at), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-surface-foreground">{r.client?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{r.client?.email ?? r.client_id.slice(0, 8) + "…"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        r.type === "delete"
                          ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-800/50 dark:bg-danger-950/30 dark:text-danger-300"
                          : "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800/50 dark:bg-primary-950/30 dark:text-primary-300"
                      }`}>
                        {r.type === "delete" ? "Account deletion" : "Data export"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusTone[r.status]}`}>
                        {r.status === "done" ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <Clock className="h-3 w-3" aria-hidden />}
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {r.resolved_at ? format(new Date(r.resolved_at), "dd MMM yyyy") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {updatingId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
                      ) : (
                        <select
                          aria-label={`Update status for request ${r.id}`}
                          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium focus:border-primary-500 focus:outline-none cursor-pointer disabled:opacity-50"
                          value={r.status}
                          onChange={(e) => void updateStatus(r.id, e.target.value as RequestStatus)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
