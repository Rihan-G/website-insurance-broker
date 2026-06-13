import { differenceInDays } from "date-fns";
import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";
import { StatusPill } from "./StatusPill";

export type RenewalTone = "success" | "warning" | "danger";

/** Shared urgency thresholds: ≤7 days danger, ≤30 days warning, else success. */
export function renewalTone(daysLeft: number): RenewalTone {
  if (daysLeft <= 7) return "danger";
  if (daysLeft <= 30) return "warning";
  return "success";
}

/** Compact chip showing days-to-renewal with the same urgency tiers used across the portal. */
export function RenewalCountdown({ endDate }: { endDate: string }) {
  const daysLeft = differenceInDays(new Date(endDate), new Date());
  const tone = renewalTone(daysLeft);
  const Icon = tone === "danger" ? AlertTriangle : tone === "warning" ? CalendarClock : CheckCircle2;
  const label = daysLeft < 0 ? "Expired" : daysLeft === 0 ? "Renews today" : `Renews in ${daysLeft}d`;

  return <StatusPill label={label} tone={tone} icon={<Icon className="h-3.5 w-3.5" aria-hidden />} />;
}
