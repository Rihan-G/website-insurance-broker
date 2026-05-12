/** Display / input currency for quotes. Premium math runs in MUR then converts for display. */
export type QuoteCurrency = "MUR" | "USD" | "GBP" | "EUR";

/** Indicative MUR per 1 unit of foreign currency — adjust periodically; not live FX. */
const MUR_PER_UNIT: Record<QuoteCurrency, number> = {
  MUR: 1,
  USD: 45.25,
  GBP: 57.8,
  EUR: 49.35,
};

export const QUOTE_CURRENCIES: Array<{ code: QuoteCurrency; label: string }> = [
  { code: "MUR", label: "MUR — Mauritian rupee" },
  { code: "USD", label: "USD — US dollar" },
  { code: "GBP", label: "GBP — British pound" },
  { code: "EUR", label: "EUR — Euro" },
];

export function convertToMur(amount: number, from: QuoteCurrency): number {
  if (!Number.isFinite(amount)) return 0;
  return amount * MUR_PER_UNIT[from];
}

export function convertFromMur(amountMur: number, to: QuoteCurrency): number {
  if (!Number.isFinite(amountMur)) return 0;
  if (to === "MUR") return amountMur;
  return amountMur / MUR_PER_UNIT[to];
}

export function formatInCurrency(amount: number, code: QuoteCurrency): string {
  if (code === "MUR") {
    return `MUR ${amount.toLocaleString("en-MU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function currencyHint(): string {
  return "Indicative FX to MUR for estimates only — not live rates.";
}
