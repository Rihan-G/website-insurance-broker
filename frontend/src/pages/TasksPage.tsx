import { useCallback, useEffect, useMemo, useState } from "react";
import { ListTodo, Circle, CircleCheck, Clock, User, Database, Plus, Bell, CalendarPlus, Trash2 } from "lucide-react";
import { differenceInHours, format, isPast } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { loadBrokerTaskMeta, saveBrokerTaskMeta, upsertBrokerTaskMeta, type BrokerTaskMetaMap } from "../lib/portalBrokerTaskMeta";
import { appendStaffCalendarEvent } from "../lib/portalCalendarEvents";
import { StatusPill } from "../components/StatusPill";

type TaskStatus = "open" | "in_progress" | "done";

interface TaskRow {
  id: string;
  title: string;
  assignee: string;
  due: Date | null;
  status: TaskStatus;
  client: string;
  clientId?: string | null;
  createdAt?: Date | null;
}

const DEMO_TASKS_KEY = "sb_portal_demo_tasks_v1";

const TASK_COLORS = ["slate", "sky", "amber", "rose", "violet", "emerald"] as const;
type TaskColor = (typeof TASK_COLORS)[number];

const ACCENT_BORDER: Record<TaskColor, string> = {
  slate: "border-l-slate-400",
  sky: "border-l-sky-500",
  amber: "border-l-amber-500",
  rose: "border-l-rose-500",
  violet: "border-l-violet-500",
  emerald: "border-l-emerald-500",
};

const SLA_HOURS = 48;

const MOCK: TaskRow[] = [
  {
    id: "mock-1",
    title: "Call client — motor NCB clarification",
    assignee: "You",
    due: new Date(Date.now() + 1000 * 60 * 60 * 8),
    status: "open",
    client: "Marie Dupont",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
];

type StoredDemoTask = Omit<TaskRow, "due" | "createdAt"> & { due: string | null; createdAt: string | null };

function readDemoTasks(): TaskRow[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_TASKS_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return (v as StoredDemoTask[]).map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee,
      due: t.due ? new Date(t.due) : null,
      status: t.status,
      client: t.client,
      clientId: t.clientId,
      createdAt: t.createdAt ? new Date(t.createdAt) : null,
    }));
  } catch {
    return [];
  }
}

function writeDemoTasks(rows: TaskRow[]) {
  if (typeof localStorage === "undefined") return;
  const serial: StoredDemoTask[] = rows.map((t) => ({
    ...t,
    due: t.due ? t.due.toISOString() : null,
    createdAt: t.createdAt ? t.createdAt.toISOString() : null,
  }));
  localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(serial));
}

function statusStyle(s: TaskStatus) {
  if (s === "done") return "bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-950/40 dark:text-accent-200 dark:border-accent-800/50";
  if (s === "in_progress") return "bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:border-primary-800/50";
  return "bg-muted text-muted-foreground border-border";
}

function defaultColorForId(id: string): TaskColor {
  const h = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return TASK_COLORS[h % TASK_COLORS.length]!;
}

export function TasksPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hideDone, setHideDone] = useState(false);
  const [meta, setMeta] = useState<BrokerTaskMetaMap>({});
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newReminder, setNewReminder] = useState("");

  const staff = profile?.role === "admin" || profile?.role === "broker";

  const hydrateMeta = useCallback((ids: string[]) => {
    const m = loadBrokerTaskMeta();
    const next = { ...m };
    let changed = false;
    for (const id of ids) {
      if (!next[id]) {
        next[id] = {
          color: defaultColorForId(id),
          reminderAt: null,
          statusChangedAt: new Date().toISOString(),
        };
        changed = true;
      }
    }
    if (changed) saveBrokerTaskMeta(next);
    setMeta(next);
  }, []);

  const load = useCallback(async () => {
    if (!user || !staff) {
      setTasks([]);
      setLive(false);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      let persisted = readDemoTasks();
      if (!persisted.length) {
        writeDemoTasks(MOCK);
        persisted = MOCK;
      }
      setTasks(persisted);
      hydrateMeta(persisted.map((t) => t.id));
      setLive(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await db
      .brokerTasks()
      .select("id, title, status, due_at, client_id, assignee_id, created_at")
      .order("due_at", { ascending: true, nullsFirst: false });
    if (error || !data) {
      setTasks(MOCK);
      setLive(false);
      if (error) toast.error("Could not load tasks — demo data.");
      hydrateMeta(MOCK.map((t) => t.id));
    } else {
      const rows = data as Array<{
        id: string;
        title: string;
        status: TaskStatus;
        due_at: string | null;
        client_id: string | null;
        assignee_id: string | null;
        created_at: string;
      }>;
      const ids = [...new Set(rows.flatMap((r) => [r.client_id, r.assignee_id]).filter(Boolean))] as string[];
      let names = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await db.profiles().select("id, full_name").in("id", ids);
        names = new Map((profs ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
      }
      const mapped = rows.map((t) => ({
        id: t.id,
        title: t.title,
        assignee: t.assignee_id ? (names.get(t.assignee_id) ?? "—") : "—",
        due: t.due_at ? new Date(t.due_at) : null,
        status: t.status,
        client: t.client_id ? (names.get(t.client_id) ?? "—") : "—",
        clientId: t.client_id,
        createdAt: new Date(t.created_at),
      }));
      setTasks(mapped);
      hydrateMeta(mapped.map((t) => t.id));
      setLive(true);
    }
    setLoading(false);
  }, [user, session, demoAuthActive, staff, hydrateMeta]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleTasks = useMemo(
    () => (hideDone ? tasks.filter((t) => t.status !== "done") : tasks),
    [tasks, hideDone],
  );

  const staleNote = (t: TaskRow): string | null => {
    if (t.status === "done") return null;
    const m = meta[t.id];
    const changed = m?.statusChangedAt ? new Date(m.statusChangedAt) : t.createdAt ?? null;
    if (changed && differenceInHours(new Date(), changed) >= SLA_HOURS) {
      return `No progress for ${SLA_HOURS}+ hours — consider reassigning or nudging.`;
    }
    if (t.due && isPast(t.due)) return "Due date has passed.";
    if (m?.reminderAt) {
      const rt = new Date(m.reminderAt);
      if (!isPast(rt)) return null;
      return "Reminder time passed — still open.";
    }
    return null;
  };

  const persistDemo = (next: TaskRow[]) => {
    writeDemoTasks(next);
    setTasks(next);
  };

  const cycle = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const order: TaskStatus[] = ["open", "in_progress", "done"];
    const i = order.indexOf(t.status);
    const nextStatus = order[(i + 1) % order.length]!;
    const nextTasks = tasks.map((x) => (x.id === id ? { ...x, status: nextStatus } : x));
    const mnext = upsertBrokerTaskMeta(id, { touchStatus: true });
    setMeta(mnext);

    if (demoAuthActive || !session || id.startsWith("mock")) {
      persistDemo(nextTasks);
      toast.success("Task status updated (demo).");
      return;
    }
    setTasks(nextTasks);
    const { error } = await db.brokerTasks().update({ status: nextStatus }).eq("id", id);
    if (error) {
      toast.error(error.message);
      void load();
    } else toast.success("Updated.");
  };

  const setColor = (id: string, color: TaskColor) => {
    const mnext = upsertBrokerTaskMeta(id, { color });
    setMeta(mnext);
    if (demoAuthActive || !session) writeDemoTasks(tasks);
  };

  const addTask = async () => {
    if (!newTitle.trim()) {
      toast.error("Title is required.");
      return;
    }
    const due = newDue ? new Date(newDue) : null;
    const reminderAt = newReminder ? new Date(newReminder) : null;

    if (demoAuthActive || !session) {
      const id = `mock-${Date.now()}`;
      const row: TaskRow = {
        id,
        title: newTitle.trim(),
        assignee: "You",
        due,
        status: "open",
        client: newClient.trim() || "—",
        createdAt: new Date(),
      };
      const mnext = upsertBrokerTaskMeta(id, {
        color: defaultColorForId(id),
        reminderAt: reminderAt?.toISOString() ?? null,
        touchStatus: true,
      });
      setMeta(mnext);
      persistDemo([...tasks, row]);
      setNewTitle("");
      setNewClient("");
      setNewDue("");
      setNewReminder("");
      toast.success("Task added (demo).");
      return;
    }
    if (!user) return;
    const { data, error } = await db
      .brokerTasks()
      .insert({
        title: newTitle.trim(),
        client_id: null,
        assignee_id: user.id,
        due_at: due?.toISOString() ?? null,
        status: "open",
        created_by: user.id,
      })
      .select("id, created_at")
      .single();
    if (error || !data) {
      toast.error(error?.message ?? "Could not create task.");
      return;
    }
    const ins = data as { id: string; created_at: string };
    upsertBrokerTaskMeta(ins.id, {
      color: defaultColorForId(ins.id),
      reminderAt: reminderAt?.toISOString() ?? null,
      touchStatus: true,
    });
    toast.success("Task created.");
    setNewTitle("");
    setNewClient("");
    setNewDue("");
    setNewReminder("");
    void load();
  };

  const removeDone = () => {
    const next = tasks.filter((t) => t.status !== "done");
    if (demoAuthActive || !session) {
      persistDemo(next);
      toast.success("Removed completed tasks from this demo list.");
      return;
    }
    toast.success("Use Supabase to archive done tasks in production.");
  };

  const pinToCalendar = (t: TaskRow) => {
    if (!t.due) {
      toast.error("Set a due date before pinning to the office calendar.");
      return;
    }
    appendStaffCalendarEvent({
      date: format(t.due, "yyyy-MM-dd"),
      title: `Task: ${t.title}`,
      kind: "task",
      notes: `Linked task ${t.id} · ${t.client}`,
      reminderTime: format(t.due, "HH:mm"),
    });
    toast.success("Added to shared office calendar (this browser).");
  };

  if (!staff) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-foreground">Tasks & SLAs</h2>
        <p className="max-w-lg text-sm text-muted-foreground">This queue is for brokerage staff. Sign in as a broker or admin to manage tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Operations</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Tasks & SLAs</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Colour-coded queue with optional reminders and stale-task hints. Demo data is stored in local storage; live data uses{" "}
            <code className="text-xs">broker_tasks</code> plus local accent metadata.
          </p>
        </div>
        <StatusPill
          tone={live ? "success" : "neutral"}
          icon={<Database className="h-3.5 w-3.5" aria-hidden />}
          label={loading ? "Loading…" : live ? "Live" : "Demo"}
        />
      </div>

      <div className="dashboard-panel rounded-2xl space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="rounded border-border" />
            Hide completed
          </label>
          <button
            type="button"
            onClick={removeDone}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Clear done (demo list)
          </button>
        </div>
        <div className="grid gap-3 border-t border-border/80 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm sm:col-span-2"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            aria-label="New task title"
          />
          <input
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            placeholder="Client name (label)"
            value={newClient}
            onChange={(e) => setNewClient(e.target.value)}
            aria-label="Client label"
          />
          <div className="flex gap-2 sm:col-span-2">
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
              aria-label="Due date"
            />
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              aria-label="Reminder at"
            />
          </div>
          <button
            type="button"
            onClick={() => void addTask()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 sm:col-span-2"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add task
          </button>
        </div>
      </div>

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/80 px-6 py-4">
          <ListTodo className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h3 className="font-semibold text-surface-foreground">Queue</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : visibleTasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <p>No tasks in this view.</p>
            <p className="mt-1 text-xs">Create one to keep client follow-ups visible and within SLA.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/80">
            {visibleTasks.map((t) => {
              const color = (meta[t.id]?.color as TaskColor) ?? defaultColorForId(t.id);
              const border = ACCENT_BORDER[color] ?? ACCENT_BORDER.slate;
              const note = staleNote(t);
              return (
                <li key={t.id} className={`border-l-4 ${border} flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between`}>
                  <div className="flex min-w-0 flex-1 gap-3">
                    <button
                      type="button"
                      onClick={() => void cycle(t.id)}
                      className="mt-0.5 shrink-0 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                      aria-label={`Cycle status for ${t.title}`}
                    >
                      {t.status === "done" ? <CircleCheck className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </button>
                    <div className="min-w-0">
                      <p className="font-semibold text-surface-foreground">{t.title}</p>
                      {note && (
                        <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-warning-50 px-2 py-1 text-xs font-medium text-warning-800 dark:bg-warning-950/40 dark:text-warning-200">
                          <Bell className="h-3 w-3 shrink-0" aria-hidden />
                          {note}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5" aria-hidden />
                          {t.client}
                        </span>
                        {t.due && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            Due {format(t.due, "MMM d, HH:mm")}
                          </span>
                        )}
                        <span>{t.assignee}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Colour</span>
                        {TASK_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            aria-label={`Set accent ${c}`}
                            onClick={() => setColor(t.id, c)}
                            className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-surface-foreground ring-2 ring-primary-500" : "border-transparent"} bg-gradient-to-br ${
                              c === "slate"
                                ? "from-slate-300 to-slate-500"
                                : c === "sky"
                                  ? "from-sky-300 to-sky-600"
                                  : c === "amber"
                                    ? "from-amber-300 to-amber-600"
                                    : c === "rose"
                                      ? "from-rose-300 to-rose-600"
                                      : c === "violet"
                                        ? "from-violet-300 to-violet-600"
                                        : "from-emerald-300 to-emerald-600"
                            }`}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => pinToCalendar(t)}
                          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted"
                        >
                          <CalendarPlus className="h-3.5 w-3.5" aria-hidden />
                          Pin to calendar
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(t.status)}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
