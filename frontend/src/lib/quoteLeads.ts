/** Helpers for `quotes` rows from the calculator and home quick-quote lead capture. */

export function describeQuoteSource(inputData: Record<string, unknown> | null | undefined): string {
  if (!inputData || typeof inputData !== "object") return "Calculator";
  const src = inputData.source;
  if (src === "home_quick_quote") return "Website quick quote";
  if (typeof src === "string" && src.trim()) return src.replace(/_/g, " ");
  return "Calculator";
}

export function quoteLeadContact(inputData: Record<string, unknown> | null | undefined, notes: string | null): string {
  const e = inputData?.lead_email;
  if (typeof e === "string" && e.trim()) return e.trim();
  if (notes?.includes("Lead:")) {
    const part = notes.split("Lead:")[1]?.split("·")[0]?.trim();
    if (part) return part;
  }
  return "—";
}
