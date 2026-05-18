import { addDays, format, parseISO, startOfDay } from "date-fns";

export type PortalCalendarEventKind = "task" | "renewal" | "meeting" | "reminder" | "follow_up";

export interface PortalCalendarEvent {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  notes?: string;
  kind: PortalCalendarEventKind;
  /** Staff pool is shared (TimeTree-style office calendar); client entries are personal. */
  scope: "staff" | "client";
}

const STAFF_KEY = "sb_portal_calendar_staff_v1";

function clientKey(userId: string): string {
  return `sb_portal_calendar_client_v1:${userId}`;
}

function iso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function defaultStaffEvents(anchor: Date): PortalCalendarEvent[] {
  const a = startOfDay(anchor);
  return [
    {
      id: "seed-staff-1",
      date: iso(addDays(a, 1)),
      title: "Claims diary — motor FNOL follow-ups",
      kind: "task",
      scope: "staff",
      notes: "Shared office calendar (like TimeTree). Visible to all administrators and brokers.",
    },
    {
      id: "seed-staff-2",
      date: iso(addDays(a, 3)),
      title: "Underwriting huddle & capacity check",
      kind: "meeting",
      scope: "staff",
    },
    {
      id: "seed-staff-3",
      date: iso(addDays(a, 7)),
      title: "Month-end commission file prep",
      kind: "follow_up",
      scope: "staff",
    },
    {
      id: "seed-staff-4",
      date: iso(addDays(a, 14)),
      title: "Regulatory filing reminder (FSC)",
      kind: "reminder",
      scope: "staff",
    },
  ];
}

function defaultClientEvents(anchor: Date): PortalCalendarEvent[] {
  const a = startOfDay(anchor);
  return [
    {
      id: "seed-client-1",
      date: iso(addDays(a, 5)),
      title: "Motor policy renewal window opens",
      kind: "renewal",
      scope: "client",
      notes: "We will email payment options before the due date.",
    },
    {
      id: "seed-client-2",
      date: iso(addDays(a, 21)),
      title: "Home contents renewal due",
      kind: "renewal",
      scope: "client",
    },
    {
      id: "seed-client-3",
      date: iso(addDays(a, 10)),
      title: "Optional: mid-term adjustment review call",
      kind: "meeting",
      scope: "client",
    },
  ];
}

function safeParse(raw: string | null): PortalCalendarEvent[] | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return null;
    return v.filter(
      (row): row is PortalCalendarEvent =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as PortalCalendarEvent).id === "string" &&
        typeof (row as PortalCalendarEvent).date === "string" &&
        typeof (row as PortalCalendarEvent).title === "string" &&
        typeof (row as PortalCalendarEvent).kind === "string" &&
        ((row as PortalCalendarEvent).scope === "staff" || (row as PortalCalendarEvent).scope === "client"),
    );
  } catch {
    return null;
  }
}

export function loadStaffCalendarEvents(anchor = new Date()): PortalCalendarEvent[] {
  if (typeof localStorage === "undefined") return defaultStaffEvents(anchor);
  const parsed = safeParse(localStorage.getItem(STAFF_KEY));
  if (!parsed || parsed.length === 0) {
    const initial = defaultStaffEvents(anchor);
    localStorage.setItem(STAFF_KEY, JSON.stringify(initial));
    return initial;
  }
  return parsed;
}

export function saveStaffCalendarEvents(events: PortalCalendarEvent[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STAFF_KEY, JSON.stringify(events));
}

export function loadClientCalendarEvents(userId: string, anchor = new Date()): PortalCalendarEvent[] {
  if (typeof localStorage === "undefined") return defaultClientEvents(anchor);
  const parsed = safeParse(localStorage.getItem(clientKey(userId)));
  if (!parsed || parsed.length === 0) {
    const initial = defaultClientEvents(anchor);
    localStorage.setItem(clientKey(userId), JSON.stringify(initial));
    return initial;
  }
  return parsed;
}

export function saveClientCalendarEvents(userId: string, events: PortalCalendarEvent[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(clientKey(userId), JSON.stringify(events));
}

export function newEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function eventsForMonth(events: PortalCalendarEvent[], monthStart: Date, monthEnd: Date): PortalCalendarEvent[] {
  const t0 = monthStart.getTime();
  const t1 = monthEnd.getTime();
  return events.filter((e) => {
    const t = startOfDay(parseISO(e.date)).getTime();
    return t >= t0 && t <= t1;
  });
}

export const eventKindLabel: Record<PortalCalendarEventKind, string> = {
  task: "Task",
  renewal: "Renewal",
  meeting: "Meeting",
  reminder: "Reminder",
  follow_up: "Follow-up",
};
