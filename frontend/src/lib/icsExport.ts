import type { PortalCalendarEvent } from "./portalCalendarEvents";

function icsDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

export function downloadIcsCalendar(events: PortalCalendarEvent[], filename = "sindicom-calendar.ics"): void {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sindicom Brokers//Portal Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const ev of events) {
    const uid = `${ev.id}@sindicombrokers.mu`;
    const startIso = ev.reminderTime ? `${ev.date}T${ev.reminderTime}:00` : `${ev.date}T09:00:00`;
    const start = new Date(startIso);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${icsDate(new Date().toISOString())}`,
      `DTSTART:${icsDate(start.toISOString())}`,
      `DTEND:${icsDate(end.toISOString())}`,
      `SUMMARY:${ev.title.replace(/[,;\\]/g, " ")}`,
      ev.notes ? `DESCRIPTION:${ev.notes.replace(/\n/g, "\\n").replace(/[,;\\]/g, " ")}` : "",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.filter(Boolean).join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Download a single calendar reminder for a policy's renewal date. */
export function downloadPolicyRenewalReminder(policy: {
  id: string;
  policy_number: string;
  insurer: string;
  product_type: string;
  end_date: string;
}): void {
  const event: PortalCalendarEvent = {
    id: `policy-renewal-${policy.id}`,
    date: policy.end_date,
    title: `${policy.product_type} renewal — ${policy.policy_number}`,
    notes: `Insurer: ${policy.insurer}. Contact Sindicom Brokers before this date to renew your cover.`,
    kind: "renewal",
    scope: "client",
    reminderTime: "09:00",
  };
  downloadIcsCalendar([event], `renewal-${policy.policy_number || policy.id}.ics`);
}
