import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Info,
  Globe,
  Plus,
  Trash2,
  Users,
  User,
  Briefcase,
  Pencil,
  Bell,
  ListTodo,
} from "lucide-react";
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  parseISO,
  isBefore,
  isAfter,
  addDays,
  startOfDay,
} from "date-fns";
import { MAURITIUS_HOLIDAYS, type MauritiusHoliday } from "../lib/mauritiusHolidays";
import { useAuth } from "../context/AuthContext";
import {
  loadStaffCalendarEvents,
  saveStaffCalendarEvents,
  loadClientCalendarEvents,
  saveClientCalendarEvents,
  newEventId,
  eventsForMonth,
  eventKindLabel,
  type PortalCalendarEvent,
  type PortalCalendarEventKind,
} from "../lib/portalCalendarEvents";

type Holiday = MauritiusHoliday;

const typeStyles: Record<string, string> = {
  public: "bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:border-primary-700/50",
  optional: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/35 dark:text-amber-200 dark:border-amber-700/40",
  religious: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-700/40",
};

const kindDotClass: Record<PortalCalendarEventKind, string> = {
  task: "bg-sky-500",
  renewal: "bg-emerald-500",
  meeting: "bg-violet-500",
  reminder: "bg-slate-400",
  follow_up: "bg-orange-500",
};

const kindBadgeClass: Record<PortalCalendarEventKind, string> = {
  task: "border-sky-300/60 bg-sky-500/15 text-sky-800 dark:text-sky-100",
  renewal: "border-emerald-300/60 bg-emerald-500/15 text-emerald-800 dark:text-emerald-100",
  meeting: "border-violet-300/60 bg-violet-500/15 text-violet-800 dark:text-violet-100",
  reminder: "border-border bg-muted text-muted-foreground",
  follow_up: "border-orange-300/60 bg-orange-500/15 text-orange-900 dark:text-orange-100",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HolidayCalendarPage() {
  const { user, profile } = useAuth();
  const userId = user?.id ?? profile?.id ?? null;
  const role = profile?.role ?? "client";
  const isStaff = role === "admin" || role === "broker";

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lang, setLang] = useState<"en" | "fr" | "kr">("en");
  const [portalEvents, setPortalEvents] = useState<PortalCalendarEvent[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const allHolidays = MAURITIUS_HOLIDAYS;

  const holidayForDay = (day: Date) => allHolidays.find((h) => isSameDay(new Date(h.date), day));
  const monthHolidays = allHolidays.filter((h) => {
    const d = new Date(h.date);
    return d >= monthStart && d <= monthEnd;
  });

  const getName = (h: Holiday) =>
    lang === "fr" ? (h.nameFr ?? h.name) : lang === "kr" ? (h.nameKr ?? h.name) : h.name;

  const reloadPortalEvents = useCallback(() => {
    if (isStaff) {
      setPortalEvents(loadStaffCalendarEvents());
      return;
    }
    if (userId) setPortalEvents(loadClientCalendarEvents(userId));
    else setPortalEvents([]);
  }, [isStaff, userId]);

  useEffect(() => {
    reloadPortalEvents();
  }, [reloadPortalEvents]);

  const persist = useCallback(
    (next: PortalCalendarEvent[]) => {
      setPortalEvents(next);
      if (isStaff) saveStaffCalendarEvents(next);
      else if (userId) saveClientCalendarEvents(userId, next);
    },
    [isStaff, userId],
  );

  const monthPortalEvents = useMemo(
    () => eventsForMonth(portalEvents, monthStart, monthEnd),
    [portalEvents, monthStart, monthEnd],
  );

  const portalEventsForDay = (day: Date) =>
    portalEvents.filter((e) => isSameDay(parseISO(e.date), day));

  const upcomingReminders = useMemo(() => {
    const today = startOfDay(new Date());
    const horizon = addDays(today, 14);
    return portalEvents
      .filter((e) => {
        if (!e.reminderTime) return false;
        const d = startOfDay(parseISO(e.date));
        return !isBefore(d, today) && !isBefore(horizon, d);
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.reminderTime ?? "").localeCompare(b.reminderTime ?? ""));
  }, [portalEvents]);

  const todaysTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return portalEvents
      .filter((e) => e.kind === "task" && isSameDay(parseISO(e.date), today))
      .sort(
        (a, b) =>
          (a.reminderTime ?? "").localeCompare(b.reminderTime ?? "") || a.title.localeCompare(b.title),
      );
  }, [portalEvents]);

  const futureTasks = useMemo(() => {
    const today = startOfDay(new Date());
    return portalEvents
      .filter((e) => {
        if (e.kind !== "task") return false;
        const d = startOfDay(parseISO(e.date));
        return isAfter(d, today);
      })
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.reminderTime ?? "").localeCompare(b.reminderTime ?? "") ||
          a.title.localeCompare(b.title),
      );
  }, [portalEvents]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [draftTitle, setDraftTitle] = useState("");
  const [draftKind, setDraftKind] = useState<PortalCalendarEventKind>("task");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftReminderTime, setDraftReminderTime] = useState("");

  const resetDraft = () => {
    setDraftTitle("");
    setDraftNotes("");
    setDraftReminderTime("");
    setEditingId(null);
  };

  const openAddForDay = (day: Date) => {
    setEditingId(null);
    setDraftDate(format(day, "yyyy-MM-dd"));
    setDraftKind(isStaff ? "task" : "renewal");
    setDraftTitle("");
    setDraftNotes("");
    setDraftReminderTime("09:00");
    setFormOpen(true);
  };

  /** Opens the form with kind Task (used from the task column; desk “Add entry” still uses role defaults). */
  const openAddTaskForDay = (day: Date) => {
    setEditingId(null);
    setDraftDate(format(day, "yyyy-MM-dd"));
    setDraftKind("task");
    setDraftTitle("");
    setDraftNotes("");
    setDraftReminderTime("09:00");
    setFormOpen(true);
  };

  const openEdit = (e: PortalCalendarEvent) => {
    setEditingId(e.id);
    setDraftDate(e.date);
    setDraftTitle(e.title);
    setDraftKind(e.kind);
    setDraftNotes(e.notes ?? "");
    setDraftReminderTime(e.reminderTime ?? "");
    setFormOpen(true);
  };

  const saveEntry = () => {
    const title = draftTitle.trim();
    if (!title) return;
    if (editingId) {
      persist(
        portalEvents.map((ev) =>
          ev.id === editingId
            ? {
                ...ev,
                date: draftDate,
                title,
                kind: draftKind,
                notes: draftNotes.trim() || undefined,
                reminderTime: draftReminderTime.trim() || undefined,
              }
            : ev,
        ),
      );
    } else {
      const next: PortalCalendarEvent = {
        id: newEventId(),
        date: draftDate,
        title,
        kind: draftKind,
        scope: isStaff ? "staff" : "client",
        notes: draftNotes.trim() || undefined,
        reminderTime: draftReminderTime.trim() || undefined,
      };
      persist([...portalEvents, next]);
    }
    setFormOpen(false);
    resetDraft();
  };

  const removeEvent = (id: string) => {
    persist(portalEvents.filter((e) => e.id !== id));
    if (editingId === id) {
      setFormOpen(false);
      resetDraft();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground sm:text-3xl">Schedule &amp; calendar</h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Your general work calendar: tasks, meetings, renewals, and reminders. A Mauritius public-holiday reference is included below the month view for planning — your own entries stay in this browser until Supabase sync exists.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["en", "fr", "kr"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                lang === l
                  ? "border border-transparent bg-primary-600 text-white"
                  : "border border-border text-muted-foreground hover:bg-muted dark:hover:bg-muted/80"
              }`}
            >
              {l === "en" ? "EN" : l === "fr" ? "FR" : "Kreol"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {isStaff ? (
          <>
            <Users className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <span>
              <span className="font-medium text-surface-foreground">Shared desk calendar</span> — administrators and brokers see the same schedule. Click any day to add or edit entries.
            </span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <span>
              <span className="font-medium text-surface-foreground">Your calendar</span> — appointments and reminders are private to this profile on this device.
            </span>
          </>
        )}
      </div>

      {upcomingReminders.length > 0 && (
        <div className="rounded-xl border border-accent-200 bg-accent-50/90 p-4 dark:border-accent-700/50 dark:bg-accent-950/35">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-900 dark:text-accent-100">
            <Bell className="h-4 w-4 shrink-0" aria-hidden />
            Upcoming reminders (next 14 days)
          </div>
          <ul className="mt-2 space-y-1.5 text-sm text-accent-800 dark:text-accent-200">
            {upcomingReminders.map((e) => (
              <li key={e.id}>
                <span className="font-medium text-surface-foreground">{format(parseISO(e.date), "EEE d MMM")}</span>
                {e.reminderTime && <span className="text-muted-foreground"> · {e.reminderTime}</span>} — {e.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-surface-foreground">
              {isStaff ? "Desk schedule" : "My schedule"}
            </h3>
            <p className="text-sm text-muted-foreground">Add, edit, or remove entries. Use reminder time for same-day nudges.</p>
          </div>
          <button
            type="button"
            onClick={() => openAddForDay(new Date())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add entry
          </button>
        </div>

        {formOpen && (
          <div className="border-b border-border bg-muted/20 px-6 py-5">
            <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={draftKind}
                  onChange={(e) => setDraftKind(e.target.value as PortalCalendarEventKind)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
                >
                  {(isStaff
                    ? (["task", "meeting", "reminder", "follow_up", "renewal"] as const)
                    : (["renewal", "reminder", "meeting", "task", "follow_up"] as const)
                  ).map((k) => (
                    <option key={k} value={k}>
                      {eventKindLabel[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder={isStaff ? "e.g. Lloyd’s treaty submission" : "e.g. Motor renewal — confirm payment"}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Reminder time (optional)</label>
                <input
                  type="time"
                  value={draftReminderTime}
                  onChange={(e) => setDraftReminderTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-base"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={saveEntry}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
                >
                  {editingId ? "Save changes" : "Save entry"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    resetDraft();
                  }}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-border">
          {monthPortalEvents.length === 0 ? (
            <div className="px-6 py-12 text-center text-base text-muted-foreground">
              No custom entries this month. Pick a day on the grid or use &quot;Add entry&quot;.
            </div>
          ) : (
            monthPortalEvents
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
              .map((e) => (
                <div key={e.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="w-14 shrink-0 text-center">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{format(parseISO(e.date), "d")}</p>
                      <p className="text-xs font-medium text-muted-foreground">{format(parseISO(e.date), "EEE")}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-surface-foreground">{e.title}</p>
                      {e.notes && <p className="mt-1 text-sm text-muted-foreground">{e.notes}</p>}
                      {e.reminderTime && (
                        <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent-700 dark:text-accent-300">
                          <Bell className="h-3.5 w-3.5" aria-hidden />
                          Reminder at {e.reminderTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase ${kindBadgeClass[e.kind]}`}
                    >
                      {eventKindLabel[e.kind]}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEdit(e)}
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted cursor-pointer"
                      aria-label={`Edit ${e.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEvent(e.id)}
                      className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-600/15 dark:hover:text-danger-300 cursor-pointer"
                      aria-label="Remove entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start">
        <aside
          className="order-2 flex flex-col gap-4 lg:order-1 lg:sticky lg:top-6 lg:self-start"
          aria-label="Tasks for today and upcoming"
        >
          <section
            className="rounded-xl border-2 border-sky-300/70 bg-gradient-to-b from-sky-50 to-surface p-4 shadow-sm dark:border-sky-600/45 dark:from-sky-950/50 dark:to-surface"
            aria-labelledby="today-tasks-heading"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  id="today-tasks-heading"
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-sky-900 dark:text-sky-100"
                >
                  <ListTodo className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                  Today&apos;s tasks
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Type <span className="font-medium text-surface-foreground">Task</span> only, dated today — separate from the month grid.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAddTaskForDay(new Date())}
                className="shrink-0 rounded-lg border border-sky-300/80 bg-surface p-2 text-sky-700 shadow-sm hover:bg-sky-50 dark:border-sky-600/50 dark:text-sky-200 dark:hover:bg-sky-950/60 cursor-pointer"
                aria-label="Add task for today"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {todaysTasks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-sky-200/90 bg-surface/60 px-3 py-6 text-center text-sm text-muted-foreground dark:border-sky-800/60">
                  No tasks for today. Use + or pick a day on the calendar.
                </li>
              ) : (
                todaysTasks.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-lg border border-border bg-surface/90 p-3 shadow-sm dark:bg-surface/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-surface-foreground">{e.title}</p>
                        {e.reminderTime && (
                          <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-accent-700 dark:text-accent-300">
                            <Bell className="h-3 w-3 shrink-0" aria-hidden />
                            {e.reminderTime}
                          </p>
                        )}
                        {e.notes && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{e.notes}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                          aria-label={`Edit ${e.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEvent(e.id)}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-600/15 dark:hover:text-danger-300 cursor-pointer"
                          aria-label={`Remove ${e.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section
            className="rounded-xl border border-border bg-surface p-4 shadow-sm"
            aria-labelledby="future-tasks-heading"
          >
            <h3
              id="future-tasks-heading"
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted-foreground"
            >
              <ListTodo className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />
              Future tasks
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Tasks dated after today — soonest dates at the top.
            </p>
            <ul className="mt-3 max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto overscroll-y-contain pr-0.5">
              {futureTasks.length === 0 ? (
                <li className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
                  No upcoming tasks. Add a Task entry with a future date in the schedule above or from the calendar.
                </li>
              ) : (
                futureTasks.map((e) => (
                  <li key={e.id} className="rounded-lg border border-border bg-muted/15 p-3 dark:bg-muted/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                          {format(parseISO(e.date), "EEE d MMM")}
                        </p>
                        <p className="mt-0.5 font-semibold text-surface-foreground">{e.title}</p>
                        {e.reminderTime && (
                          <p className="mt-0.5 text-xs text-muted-foreground">Reminder {e.reminderTime}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted cursor-pointer"
                          aria-label={`Edit ${e.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEvent(e.id)}
                          className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-danger-50 hover:text-danger-700 dark:hover:bg-danger-600/15 dark:hover:text-danger-300 cursor-pointer"
                          aria-label={`Remove ${e.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="rounded-xl border border-border bg-surface p-4 sm:p-8">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Month view</p>
            <div className="mb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                className="cursor-pointer rounded-lg border border-border p-2.5 text-lg hover:bg-muted"
                aria-label="Previous month"
              >
                ‹
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
                <h3 className="text-lg font-bold text-surface-foreground sm:text-xl">{format(currentMonth, "MMMM yyyy")}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                className="cursor-pointer rounded-lg border border-border p-2.5 text-lg hover:bg-muted"
                aria-label="Next month"
              >
                ›
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-sm font-semibold text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: startPadding }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((day) => {
                const holiday = holidayForDay(day);
                const dayEvents = portalEventsForDay(day);
                const isToday = isSameDay(day, new Date());
                const isWeekend = [0, 6].includes(getDay(day));
                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    title={[holiday ? getName(holiday) : "", ...dayEvents.map((e) => e.title)].filter(Boolean).join(" · ")}
                    onClick={() => openAddForDay(day)}
                    className={`relative min-h-[96px] cursor-pointer rounded-xl p-2 text-left text-base transition-colors sm:min-h-[112px] ${
                      isToday ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-surface" : ""
                    } ${
                      holiday
                        ? holiday.type === "public"
                          ? "bg-primary-100 dark:bg-primary-950/45"
                          : "bg-amber-50 dark:bg-amber-950/25"
                        : isWeekend
                          ? "bg-muted/50 dark:bg-muted/30"
                          : "hover:bg-muted/30 dark:hover:bg-muted/25"
                    }`}
                  >
                    <span
                      className={`block text-center text-base font-bold sm:text-lg ${
                        isToday
                          ? "text-primary-700 dark:text-primary-200"
                          : holiday
                            ? "text-primary-800 dark:text-primary-100"
                            : isWeekend
                              ? "text-muted-foreground"
                              : "text-surface-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {holiday && (
                      <div className="mt-1 truncate text-center text-xs font-semibold leading-snug text-primary-800 dark:text-primary-200 sm:text-sm">
                        {getName(holiday).split(" ").slice(0, 3).join(" ")}
                      </div>
                    )}
                    {dayEvents.length > 0 && (
                      <div className="mt-2 flex flex-wrap justify-center gap-1">
                        {dayEvents.slice(0, 5).map((e) => (
                          <span key={e.id} className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${kindDotClass[e.kind]}`} title={e.title} />
                        ))}
                        {dayEvents.length > 5 && (
                          <span className="text-xs font-medium text-muted-foreground">+{dayEvents.length - 5}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-primary-100 dark:bg-primary-900/50" /> Public holiday (Mauritius ref.)
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30" /> Optional / religious
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded ring-2 ring-primary-500" /> Today
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-sky-500" aria-hidden /> Schedule markers
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 flex gap-3 dark:border-primary-700/50 dark:bg-primary-950/45">
        <Info className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" aria-hidden />
        <div className="text-sm sm:text-base text-primary-800 dark:text-primary-100">
          <span className="font-medium">When public holidays apply:</span> payment processing may slow and renewals on a holiday often roll to the next business day — confirm with your broker.
        </div>
      </div>

      {monthHolidays.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Mauritius public holidays (reference) — {format(currentMonth, "MMMM yyyy")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">Optional layer for office planning; your entries above are independent of this list.</p>
          </div>
          <div className="divide-y divide-border">
            {monthHolidays.map((h) => (
              <div key={h.date} className="flex items-center gap-4 px-6 py-4">
                <div className="w-14 shrink-0 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{format(new Date(h.date), "d")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(h.date), "EEE")}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-surface-foreground">{getName(h)}</p>
                  {h.religions && <p className="mt-0.5 text-sm text-muted-foreground">{h.religions.join(", ")}</p>}
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${typeStyles[h.type]}`}>
                  {h.type === "public" ? "Public holiday" : "Optional"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface py-12 text-center">
          <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" aria-hidden />
          <p className="text-muted-foreground text-sm">No public holidays this month.</p>
        </div>
      )}
    </div>
  );
}
