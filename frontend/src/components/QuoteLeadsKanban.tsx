import { format } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  QUOTE_STATUS_OPTIONS,
  quoteStatusLabel,
  describeQuoteSource,
  quoteLeadContact,
  type QuoteLeadRow,
  type QuoteStatus,
} from "../lib/quoteLeads";

const columnTone: Record<QuoteStatus, string> = {
  draft: "border-border bg-muted/30",
  sent: "border-primary-200 bg-primary-50/60 dark:border-primary-700/40 dark:bg-primary-950/20",
  accepted: "border-accent-200 bg-accent-50/60 dark:border-accent-700/40 dark:bg-accent-950/20",
  rejected: "border-danger-200 bg-danger-50/60 dark:border-danger-700/40 dark:bg-danger-950/20",
  converted: "border-accent-300 bg-accent-50 dark:border-accent-600/50 dark:bg-accent-950/30",
};

interface Props {
  rows: QuoteLeadRow[];
  updatingId: string | null;
  onStatusChange: (id: string, next: QuoteStatus) => void;
}

export function QuoteLeadsKanban({ rows, updatingId, onStatusChange }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1000px] grid-cols-5 gap-3">
        {QUOTE_STATUS_OPTIONS.map((status, columnIndex) => {
          const columnRows = rows.filter((r) => r.status === status);
          return (
            <div key={status} className={`flex flex-col rounded-2xl border ${columnTone[status]}`}>
              <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
                <h3 className="text-sm font-semibold text-surface-foreground">{quoteStatusLabel[status]}</h3>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted-foreground">{columnRows.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {columnRows.length === 0 ? (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">No leads</p>
                ) : (
                  columnRows.map((r) => {
                    const prevStatus = QUOTE_STATUS_OPTIONS[columnIndex - 1];
                    const nextStatus = QUOTE_STATUS_OPTIONS[columnIndex + 1];
                    const busy = updatingId === r.id;
                    return (
                      <div key={r.id} className="rounded-xl border border-border bg-surface p-3 shadow-sm dark:shadow-none">
                        <p className="text-sm font-semibold capitalize text-surface-foreground">{r.product_type}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {r.client?.full_name ?? quoteLeadContact(r.input_data ?? undefined, r.notes)}
                        </p>
                        <p className="mt-1 text-xs tabular-nums text-surface-foreground">
                          {r.estimated_premium != null ? `MUR ${Number(r.estimated_premium).toLocaleString()}` : "—"}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {describeQuoteSource(r.input_data ?? undefined)} · {format(new Date(r.created_at), "dd MMM")}
                        </p>
                        <div className="mt-2 flex justify-between gap-1">
                          <button
                            type="button"
                            disabled={!prevStatus || busy}
                            onClick={() => prevStatus && onStatusChange(r.id, prevStatus)}
                            aria-label={`Move ${r.product_type} lead back to ${prevStatus ? quoteStatusLabel[prevStatus] : "previous stage"}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowLeft className="h-3 w-3" aria-hidden />
                          </button>
                          <button
                            type="button"
                            disabled={!nextStatus || busy}
                            onClick={() => nextStatus && onStatusChange(r.id, nextStatus)}
                            aria-label={`Move ${r.product_type} lead forward to ${nextStatus ? quoteStatusLabel[nextStatus] : "next stage"}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowRight className="h-3 w-3" aria-hidden />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
