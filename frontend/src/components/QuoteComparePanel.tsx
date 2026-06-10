export interface QuoteCompareRow {
  id: string;
  product_type: string;
  estimated_premium: number | null;
  status: string;
  input_data: Record<string, unknown> | null;
  client: { full_name: string; email: string } | null;
}

export function QuoteComparePanel({ quotes }: { quotes: QuoteCompareRow[] }) {
  if (quotes.length < 2) return null;

  const fields: Array<{ label: string; get: (q: QuoteCompareRow) => string }> = [
    { label: "Product", get: (q) => q.product_type },
    { label: "Premium", get: (q) => (q.estimated_premium != null ? `MUR ${q.estimated_premium.toLocaleString()}` : "—") },
    { label: "Status", get: (q) => q.status },
    { label: "Contact", get: (q) => q.client?.email ?? (q.input_data?.lead_email as string) ?? "—" },
    { label: "Source", get: (q) => String(q.input_data?.source ?? "—") },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800 dark:bg-primary-950/30">
      <h3 className="text-sm font-bold text-surface-foreground">Compare selected quotes</h3>
      <table className="mt-3 w-full min-w-[28rem] text-sm">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-muted-foreground" />
            {quotes.map((q) => (
              <th key={q.id} className="p-2 text-left font-semibold text-surface-foreground">
                {q.product_type}
                <span className="block text-xs font-normal text-muted-foreground">{q.id.slice(0, 8)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.label} className="border-t border-border/60">
              <td className="p-2 font-medium text-muted-foreground">{f.label}</td>
              {quotes.map((q) => (
                <td key={q.id} className="p-2 text-surface-foreground">{f.get(q)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
