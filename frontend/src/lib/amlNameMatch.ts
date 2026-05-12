/**
 * Demo AML-style name consistency check (local only).
 * Production would call a sanctions / KYC API; this uses normalized string similarity.
 */

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

export function normalizePersonName(s: string): string {
  return stripDiacritics(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const ca = a[i - 1];
      const cb = b[j - 1];
      const cost = ca === cb ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

function jaccardTokens(a: string, b: string): number {
  const ta = new Set(normalizePersonName(a).split(" ").filter(Boolean));
  const tb = new Set(normalizePersonName(b).split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) {
    if (tb.has(t)) inter++;
  }
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export type AmlNameVerdict = "match" | "review" | "mismatch";

export interface AmlNameMatchResult {
  score: number;
  verdict: AmlNameVerdict;
  normalizedRecord: string;
  normalizedInput: string;
}

/**
 * @param recordName — name on file (e.g. KYC / CRM)
 * @param suppliedName — name on ID, wire, or third-party document
 */
export function matchPersonName(recordName: string, suppliedName: string): AmlNameMatchResult {
  const na = normalizePersonName(recordName);
  const nb = normalizePersonName(suppliedName);
  if (!na || !nb) {
    return { score: 0, verdict: "mismatch", normalizedRecord: na, normalizedInput: nb };
  }
  if (na === nb) {
    return { score: 1, verdict: "match", normalizedRecord: na, normalizedInput: nb };
  }
  const maxLen = Math.max(na.length, nb.length);
  const levRatio = 1 - levenshtein(na, nb) / maxLen;
  const jac = jaccardTokens(recordName, suppliedName);
  const score = Math.max(levRatio * 0.65 + jac * 0.35, jac);
  let verdict: AmlNameVerdict = "mismatch";
  if (score >= 0.92) verdict = "match";
  else if (score >= 0.72) verdict = "review";
  return { score, verdict, normalizedRecord: na, normalizedInput: nb };
}
