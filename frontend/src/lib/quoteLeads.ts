/** Helpers for `quotes` rows from the calculator and home quick-quote lead capture. */

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "converted";

export const QUOTE_STATUS_OPTIONS: QuoteStatus[] = ["draft", "sent", "accepted", "rejected", "converted"];

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  converted: "Converted",
};

export interface QuoteLeadRow {
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
