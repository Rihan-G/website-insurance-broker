import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Calculator, Download, RefreshCw } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { QuoteComparePanel } from "../components/QuoteComparePanel";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import { exportToCsv } from "../lib/exportService";
import { describeQuoteSource, quoteLeadContact } from "../lib/quoteLeads";

type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "converted";

interface QuoteLeadRow {
  id: string;
  product_type: string;
  estimated_premium: number | null;
  status: QuoteStatus;
  notes: string | null;
  created_at: string;
  client_id: string | null;
  input_data: Record<string, unknown> | null;
  client: { full_name: string; email: string } | null;
}

const STATUS_OPTIONS: QuoteStatus[] = ["draft", "sent", "accepted", "rejected", "converted"];

const demoRows: QuoteLeadRow[] = [
  {
    id: "demo-1",
    product_type: "motor",
    estimated_premium: 58200,
    status: "draft",
    notes: "Lead: prospect@example.com",
    created_at: new Date().toISOString(),
    client_id: null,
    input_data: { source: "home_quick_quote", lead_email: "prospect@example.com" },
    client: null,
  },
  {
    id: "demo-2",
    product_type: "home",
    estimated_premium: 42100,
    status: "sent",
    notes: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    client_id: "00000000-0000-0000-0000-000000000001",
    input_data: { source: "calculator", _displayCurrency: "MUR" },
    client: { full_name: "Demo Client", email: "client@demo.sindicombrokers.local" },
  },
];

export function QuoteLeadsPage() {
  const { demoAuthActive, session } = useAuth();
  const [rows, setRows] = useState<QuoteLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (demoAuthActive) {
      setRows(demoRows);
      setLoading(false);
      return;
    }
    if (!session) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select(
        `
      id,
      product_type,
      estimated_premium,
      status,
      notes,
      created_at,
      client_id,
      input_data,
      client:profiles!quotes_client_id_fkey ( full_name, email )
    `,
      )
      .order("created_at", { ascending: false })
      .limit(250);
    if (error) {
      toast.error(error.message ?? "Failed to load quotes.");
      setRows([]);
    } else {
      setRows((data as QuoteLeadRow[]) ?? []);
    }
    setLoading(false);
  }, [demoAuthActive, session]);

  useEffect(() => {
    void load();
  }, [load]);

  const onStatusChange = async (id: string, next: QuoteStatus) => {
    if (demoAuthActive) {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
      toast.success("Status updated (demo).");
      return;
    }
    setUpdatingId(id);
    const { error } = await db.quotes().update({ status: next }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast.error((error as { message?: string }).message ?? "Update failed.");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    toast.success("Status updated.");
  };

  const exportCsv = () => {
    const flat = rows.map((r) => ({
      Created: format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
      Source: describeQuoteSource(r.input_data ?? undefined),
      Product: r.product_type,
      "Premium (MUR)": r.estimated_premium ?? "",
      Status: r.status,
      "Lead / contact": quoteLeadContact(r.input_data ?? undefined, r.notes),
      Client: r.client?.full_name ?? (r.client_id ? r.client_id.slice(0, 8) + "…" : "Anonymous"),
      "Client email": r.client?.email ?? "",
      Notes: r.notes ?? "",
    }));
    exportToCsv(flat, "quote_leads");
    toast.success("Export started.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Sales</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Quote Pipeline</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Saved estimates from <Link className="text-primary-600 hover:underline dark:text-primary-400" to="/dashboard/quotes">Create Quote</Link> and the public{" "}
            <strong>quick quote</strong> widget. Update status as you work the lead.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted/80"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </button>
        </div>
      </div>

      {compareIds.length >= 2 && (
        <QuoteComparePanel quotes={rows.filter((r) => compareIds.includes(r.id))} />
      )}

      <div className="rounded-2xl border border-border bg-surface shadow-sm dark:shadow-none">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Calculator}
              title="No quote leads yet"
              description="Leads appear when visitors submit the home estimate or staff save from Create Quote."
              actionLabel="Open Create Quote"
              actionTo="/dashboard/quotes"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Compare</th>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Premium (MUR)</th>
                  <th className="px-4 py-3">Contact / client</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Compare quote ${r.id}`}
                        checked={compareIds.includes(r.id)}
                        onChange={(e) => {
                          setCompareIds((prev) =>
                            e.target.checked
                              ? prev.length >= 3
                                ? [...prev.slice(1), r.id]
                                : [...prev, r.id]
                              : prev.filter((id) => id !== r.id),
                          );
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {format(new Date(r.created_at), "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3 capitalize text-surface-foreground">{describeQuoteSource(r.input_data ?? undefined)}</td>
                    <td className="px-4 py-3 capitalize text-surface-foreground">{r.product_type}</td>
                    <td className="px-4 py-3 tabular-nums text-surface-foreground">
                      {r.estimated_premium != null ? Number(r.estimated_premium).toLocaleString() : "—"}
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-surface-foreground">{r.client?.full_name ?? quoteLeadContact(r.input_data ?? undefined, r.notes)}</p>
                      {r.client?.email && <p className="truncate text-xs text-muted-foreground">{r.client.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Status for quote ${r.id}`}
                        className="w-full max-w-[140px] rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium capitalize focus:border-primary-500 focus:outline-none cursor-pointer disabled:opacity-50"
                        value={r.status}
                        disabled={updatingId === r.id}
                        onChange={(e) => void onStatusChange(r.id, e.target.value as QuoteStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
