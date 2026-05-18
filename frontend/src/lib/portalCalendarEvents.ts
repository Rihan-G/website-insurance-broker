import { addDays, format, parseISO, startOfDay } from "date-fns";

export type PortalCalendarEventKind = "task" | "renewal" | "meeting" | "reminder" | "follow_up";

export interface PortalCalendarEvent {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  title: string;
  notes?: string;
  kind: PortalCalendarEventKind;
  /** Staff pool is shared; client entries are personal. */
  scope: "staff" | "client";
  /** Optional same-day reminder time (HH:mm, 24h). */
  reminderTime?: string;
}

const STAFF_KEY = "sb_portal_calendar_staff_v2";

function clientKey(userId: string): string {
  return `sb_portal_calendar_client_v2:${userId}`;
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
      notes: "Shared office calendar. Visible to administrators and brokers.",
      reminderTime: "09:00",
    },
    {
      id: "seed-staff-2",
      date: iso(addDays(a, 3)),
      title: "Underwriting huddle & capacity check",
      kind: "meeting",
      scope: "staff",
      reminderTime: "14:30",
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
      reminderTime: "08:45",
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
      reminderTime: "10:00",
    },
    {
      id: "seed-client-2",
      date: iso(addDays(a, 21)),
      title: "Home contents renewal due",
      kind: "renewal",
      scope: "client",
      reminderTime: "09:00",
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

/** Append a single staff event (e.g. from Tasks page). */
export function appendStaffCalendarEvent(event: Omit<PortalCalendarEvent, "id" | "scope"> & { id?: string }): PortalCalendarEvent[] {
  const full: PortalCalendarEvent = {
    id: event.id ?? newEventId(),
    date: event.date,
    title: event.title,
    notes: event.notes,
    kind: event.kind,
    scope: "staff",
    reminderTime: event.reminderTime,
  };
  const cur = loadStaffCalendarEvents();
  const next = [...cur, full];
  saveStaffCalendarEvents(next);
  return next;
}
