export type DocumentStatus = "uploaded" | "processing" | "reviewed" | "approved" | "rejected";

export const DOCUMENT_STATUS_BADGE_CLASS: Record<DocumentStatus, string> = {
  uploaded: "bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300",
  processing: "bg-warning-50 text-warning-600",
  reviewed: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-200",
  approved: "bg-accent-50 text-accent-600",
  rejected: "bg-danger-50 text-danger-600",
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

/** Human-readable type label from MIME (table column / pipeline subtitle). */
export function labelFromMime(mime: string | null | undefined): string {
  if (!mime) return "Document";
  const sub = mime.split("/")[1];
  if (!sub) return "Document";
  if (sub === "pdf") return "PDF";
  return sub.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}
