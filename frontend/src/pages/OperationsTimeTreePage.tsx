import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CalendarRange, Database, GitBranch, ListTodo, Shield, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { MAURITIUS_HOLIDAYS, type MauritiusHoliday } from "../lib/mauritiusHolidays";

type EventKind = "holiday" | "renewal" | "task";

interface CalEvent {
  id: string;
  at: Date;
  kind: EventKind;
  title: string;
  subtitle?: string;
  badge?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOCK_EVENTS: CalEvent[] = [
  {
    id: "mock-h1",
    at: startOfDay(parseISO("2026-05-01")),
    kind: "holiday",
    title: "Labour Day",
    subtitle: "Public holiday",
    badge: "Office",
  },
  {
    id: "mock-r1",
    at: startOfDay(addMonths(new Date(), 0)),
    kind: "renewal",
    title: "Policy MOT-2024-8841",
    subtitle: "Motor — renewal date",
    badge: "Renewal",
  },
  {
    id: "mock-t1",
    at: new Date(),
    kind: "task",
    title: "Call client — NCB clarification",
    subtitle: "Broker task · in progress",
    badge: "Task",
  },
];

function holidayOnDay(day: Date): MauritiusHoliday | undefined {
  return MAURITIUS_HOLIDAYS.find((h) => isSameDay(parseISO(h.date), day));
}

function kindDotClass(kind: EventKind): string {
  if (kind === "holiday") return "bg-violet-500";
  if (kind === "renewal") return "bg-amber-500";
  return "bg-primary-500";
}

export function OperationsTimeTreePage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const staff = profile?.role === "admin" || profile?.role === "broker";

  const load = useCallback(async () => {
    if (!user || !staff) {
      setEvents([]);
      setLive(false);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      setEvents(MOCK_EVENTS);
      setLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const next: CalEvent[] = [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    for (const h of MAURITIUS_HOLIDAYS) {
      const d = parseISO(h.date);
      if (d >= monthStart && d <= monthEnd) {
        next.push({
          id: `holiday-${h.date}`,
          at: startOfDay(d),
          kind: "holiday",
          title: h.name,
          subtitle: h.type === "public" ? "Public holiday" : "Optional / religious",
          badge: "Holiday",
        });
      }
    }

    const polQ = db.policies().select("id, policy_number, product_type, end_date, insurer").order("end_date", { ascending: true });
    const { data: policies, error: polErr } = await polQ;
    if (polErr) toast.error("Could not load policy dates for calendar.");
    for (const p of policies ?? []) {
      const row = p as { id: string; policy_number: string; product_type: string; end_date: string; insurer: string };
      const d = startOfDay(parseISO(row.end_date));
      if (d >= monthStart && d <= monthEnd) {
        next.push({
          id: `renewal-${row.id}`,
          at: d,
          kind: "renewal",
          title: row.policy_number,
          subtitle: `${row.product_type} · ${row.insurer}`,
          badge: "Renewal",
        });
      }
    }

    const { data: tasks, error: taskErr } = await db.brokerTasks().select("id, title, due_at, status").order("due_at", { ascending: true });
    if (taskErr) toast.error("Could not load tasks for calendar.");
    for (const t of tasks ?? []) {
      const row = t as { id: string; title: string; due_at: string | null; status: string };
      if (!row.due_at) continue;
      const at = new Date(row.due_at);
      const d0 = startOfDay(at);
      if (d0 >= monthStart && d0 <= monthEnd) {
        next.push({
          id: `task-${row.id}`,
          at,
          kind: "task",
          title: row.title,
          subtitle: `Task · ${row.status.replace("_", " ")}`,
          badge: "Task",
        });
      }
    }

    next.sort((a, b) => a.at.getTime() - b.at.getTime());
    setEvents(next);
    setLive(!polErr && !taskErr);
    setLoading(false);
  }, [user, staff, session, demoAuthActive, currentMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const key = format(startOfDay(e.at), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.at.getTime() - b.at.getTime());
    return map;
  }, [events]);

  const selectedKey = format(selectedDay, "yyyy-MM-dd");
  const treeEvents = eventsByDay.get(selectedKey) ?? [];

  if (!staff) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-foreground">Operations calendar</h2>
        <p className="max-w-lg text-sm text-muted-foreground">This schedule is for brokerage staff. Sign in as a broker or admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Planning</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Operations time tree</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Month grid with holidays, policy renewal dates, and broker task deadlines. Pick a day to see the vertical timeline for that date.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            live ? "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200" : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" aria-hidden />
          {loading ? "Loading…" : live ? "Live" : "Demo / partial"}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
        <div className="dashboard-panel rounded-2xl border border-border/80 p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-surface-foreground hover:bg-muted/60"
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="flex items-center gap-2 text-center">
              <CalendarRange className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
              <h3 className="text-base font-bold text-surface-foreground sm:text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-surface-foreground hover:bg-muted/60"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">
                {d}
              </div>
            ))}
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(key) ?? [];
              const hol = holidayOnDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDay);
              const kinds = [...new Set(dayEvents.map((e) => e.kind))];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(startOfDay(day))}
                  className={`relative flex min-h-[52px] flex-col items-center justify-start gap-1 rounded-xl border p-1.5 text-center transition-colors sm:min-h-[58px] sm:p-2 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50/80 ring-2 ring-primary-400/30 dark:bg-primary-950/40"
                      : "border-transparent hover:bg-muted/50 dark:hover:bg-muted/25"
                  } ${isToday && !isSelected ? "ring-1 ring-primary-500/60" : ""}`}
                >
                  <span className={`text-sm font-semibold ${isToday ? "text-primary-700 dark:text-primary-300" : "text-surface-foreground"}`}>
                    {format(day, "d")}
                  </span>
                  <div className="flex min-h-[10px] flex-wrap justify-center gap-0.5">
                    {kinds.slice(0, 4).map((k) => (
                      <span key={k} className={`h-1.5 w-1.5 rounded-full ${kindDotClass(k)}`} title={k} />
                    ))}
                  </div>
                  {hol && dayEvents.length === 0 && <span className="max-w-full truncate text-[8px] font-medium text-violet-700 dark:text-violet-300 sm:text-[9px]">Hol</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 border-t border-border/70 pt-4 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500" /> Holiday
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Renewal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary-500" /> Task
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full ring-1 ring-primary-500" /> Today
            </span>
          </div>
        </div>

        <div className="dashboard-panel flex flex-col rounded-2xl border border-border/80">
          <div className="border-b border-border/80 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
              <h3 className="font-semibold text-surface-foreground">Time tree</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{format(selectedDay, "EEEE, MMMM d, yyyy")}</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {treeEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 py-12 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground/50" aria-hidden />
                <p className="text-sm font-medium text-surface-foreground">Quiet day</p>
                <p className="max-w-xs text-xs text-muted-foreground">No holidays, renewals, or tasks with deadlines on this date in the current data set.</p>
              </div>
            ) : (
              <div className="relative pl-1">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-primary-500/35 to-border" aria-hidden />
                <ul className="space-y-0">
                  {treeEvents.map((ev, idx) => {
                    const isTask = ev.kind === "task";
                    const timeLabel = isTask ? format(ev.at, "HH:mm") : "All day";
                    const Icon = ev.kind === "holiday" ? Shield : ev.kind === "renewal" ? CalendarRange : ListTodo;
                    return (
                      <li key={ev.id} className="relative flex gap-3 pb-8 last:pb-0">
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-surface shadow-sm">
                          <Icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 rounded-xl border border-border/80 bg-muted/10 px-3 py-2.5 sm:px-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{timeLabel}</span>
                            {ev.badge && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                  ev.kind === "holiday"
                                    ? "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                                    : ev.kind === "renewal"
                                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                                      : "bg-primary-100 text-primary-900 dark:bg-primary-950/40 dark:text-primary-200"
                                }`}
                              >
                                {ev.badge}
                              </span>
                            )}
                            {idx < treeEvents.length - 1 && (
                              <span className="ml-auto hidden text-[10px] text-muted-foreground/70 sm:inline" aria-hidden>
                                │
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-semibold leading-snug text-surface-foreground">{ev.title}</p>
                          {ev.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{ev.subtitle}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
