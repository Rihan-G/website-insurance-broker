import { formatDistance } from "date-fns";

/** Human-readable relative time for ISO timestamps (e.g. pipeline rows). */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return formatDistance(d, now, { addSuffix: true });
  } catch {
    return "";
  }
}
