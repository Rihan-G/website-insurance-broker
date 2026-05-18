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

  const [formOpen, setFormOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [draftTitle, setDraftTitle] = useState("");
  const [draftKind, setDraftKind] = useState<PortalCalendarEventKind>("task");
  const [draftNotes, setDraftNotes] = useState("");

  const openAddForDay = (day: Date) => {
    setDraftDate(format(day, "yyyy-MM-dd"));
    setDraftTitle("");
    setDraftKind(isStaff ? "task" : "renewal");
    setDraftNotes("");
    setFormOpen(true);
  };

  const addEvent = () => {
    const title = draftTitle.trim();
    if (!title) return;
    const next: PortalCalendarEvent = {
      id: newEventId(),
      date: draftDate,
      title,
      kind: draftKind,
      scope: isStaff ? "staff" : "client",
      notes: draftNotes.trim() || undefined,
    };
    persist([...portalEvents, next]);
    setFormOpen(false);
    setDraftTitle("");
    setDraftNotes("");
  };

  const removeEvent = (id: string) => {
    persist(portalEvents.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Calendar</h2>
          <p className="text-muted-foreground">
            Mauritius public holidays plus a shared office schedule for staff, or personal renewal and reminder dates for
            clients — stored in this browser (demo until Supabase sync exists).
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
              <span className="font-medium text-surface-foreground">Office calendar</span> — administrators and brokers see
              the same entries (similar to a shared TimeTree group). Add tasks, meetings, and reminders for the whole desk.
            </span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <span>
              <span className="font-medium text-surface-foreground">Your dates</span> — track renewals, calls, and reminders.
              Only your account on this device can see these entries.
            </span>
          </>
        )}
      </div>

      {/* Info banner */}
      <div className="flex gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-700/50 dark:bg-primary-950/45">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
        <div className="text-sm text-primary-800 dark:text-primary-100">
          <span className="font-medium">Payments & renewals:</span> processing may slow on public holidays. Renewals that fall
          on a holiday are usually moved to the next business day — confirm with your broker.
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="cursor-pointer rounded-lg border border-border p-2 hover:bg-muted"
          >
            ‹
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-surface-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="cursor-pointer rounded-lg border border-border p-2 hover:bg-muted"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
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
                className={`relative min-h-[56px] cursor-pointer rounded-lg p-1.5 text-left text-sm transition-colors ${
                  isToday ? "ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-surface" : ""
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
                  className={`block text-center text-xs font-semibold ${
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
                  <div className="mt-0.5 truncate text-[8px] font-medium leading-tight text-primary-700 dark:text-primary-200">
                    {getName(holiday).split(" ").slice(0, 2).join(" ")}
                  </div>
                )}
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${kindDotClass[e.kind]}`} title={e.title} />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 4}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded bg-primary-100 dark:bg-primary-900/50" /> Public holiday
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30" />{" "}
            Optional / religious
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded ring-2 ring-primary-500" /> Today
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3 w-3 text-sky-500" /> Staff / client markers (dots)
          </div>
        </div>
      </div>

      {/* Add + list portal events */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-surface-foreground">
              {isStaff ? "Office schedule" : "My renewals & reminders"}
            </h3>
            <p className="text-xs text-muted-foreground">Click any day above to add an entry. Data stays in local storage.</p>
          </div>
          <button
            type="button"
            onClick={() => openAddForDay(new Date())}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add entry
          </button>
        </div>

        {formOpen && (
          <div className="border-b border-border bg-muted/20 px-6 py-4">
            <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                <input
                  type="date"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={draftKind}
                  onChange={(e) => setDraftKind(e.target.value as PortalCalendarEventKind)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
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
                  placeholder={isStaff ? "e.g. Lloyd’s treaty submission" : "e.g. Motor renewal — pay by link"}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notes (optional)</label>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={addEvent}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
                >
                  Save entry
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-border">
          {monthPortalEvents.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No custom entries this month. Add renewals, tasks, or meetings using the button above or by clicking a day.
            </div>
          ) : (
            monthPortalEvents
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
              .map((e) => (
                <div key={e.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex gap-3">
                    <div className="w-12 shrink-0 text-center">
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {format(parseISO(e.date), "d")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{format(parseISO(e.date), "EEE")}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-surface-foreground">{e.title}</p>
                      {e.notes && <p className="mt-0.5 text-xs text-muted-foreground">{e.notes}</p>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-start">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${kindBadgeClass[e.kind]}`}
                    >
                      {eventKindLabel[e.kind]}
                    </span>
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

      {/* Month holidays list */}
      {monthHolidays.length > 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Holidays in {format(currentMonth, "MMMM yyyy")}</h3>
          </div>
          <div className="divide-y divide-border">
            {monthHolidays.map((h) => (
              <div key={h.date} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 shrink-0 text-center">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{format(new Date(h.date), "d")}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(h.date), "EEE")}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-surface-foreground">{getName(h)}</p>
                  {h.religions && <p className="mt-0.5 text-xs text-muted-foreground">{h.religions.join(", ")}</p>}
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
          <Globe className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">No public holidays this month.</p>
        </div>
      )}
    </div>
  );
}
