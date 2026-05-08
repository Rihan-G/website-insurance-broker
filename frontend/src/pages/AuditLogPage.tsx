import { useState, useEffect } from "react";
import { ClipboardList, Search, Download, User, Shield, FileText, CreditCard, Settings } from "lucide-react";
import { fetchAuditLogs } from "../lib/auditService";
import { exportToCsv } from "../lib/exportService";
import toast from "react-hot-toast";

type AuditLog = {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string; role: string } | null;
};

const actionIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  document: FileText,
  profile: User,
  payment: CreditCard,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  "document.approved": "text-accent-600 bg-accent-50",
  "document.rejected": "text-danger-600 bg-danger-50",
  "document.uploaded": "text-primary-600 bg-primary-50",
  "user.2fa_enabled": "text-accent-600 bg-accent-50",
  "payment.paid": "text-accent-600 bg-accent-50",
  "user.login": "text-primary-600 bg-primary-50",
};

function getActionColor(action: string) {
  return actionColors[action] ?? "text-muted-foreground bg-muted";
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAuditLogs(200)
      .then((data) => setLogs(data as unknown as AuditLog[]))
      .catch(() => toast.error("Failed to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.profiles?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.resource_type.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const data = filtered.map((l) => ({
      "Timestamp": new Date(l.created_at).toLocaleString(),
      "User": l.profiles?.full_name ?? "—",
      "Email": l.profiles?.email ?? "—",
      "Action": l.action,
      "Resource Type": l.resource_type,
      "Resource ID": l.resource_id,
      "IP Address": l.ip_address ?? "—",
      "Details": JSON.stringify(l.details ?? {}),
    }));
    exportToCsv(data, "audit_log");
    toast.success("Audit log exported.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Audit Trail</h2>
          <p className="text-muted-foreground">All user actions logged for compliance and security</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by user, action, or resource…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
        />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No audit logs found.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Timestamp</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">User</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Action</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Resource</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => {
                  const Icon = actionIcon[log.resource_type] ?? Shield;
                  return (
                    <tr key={log.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-foreground">{log.profiles?.full_name ?? "System"}</p>
                        <p className="text-xs text-muted-foreground">{log.profiles?.role ?? ""}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getActionColor(log.action)}`}>
                          <Icon className="h-3 w-3" />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-surface-foreground capitalize">{log.resource_type}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-32">{log.resource_id}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{log.ip_address ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
