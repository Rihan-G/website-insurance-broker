import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { addDays, differenceInCalendarDays, format, isBefore, startOfDay } from "date-fns";
import { ListTodo, Circle, CircleCheck, Clock, User, Database, AlertTriangle, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import { CarePageEmpty } from "../components/CarePageEmpty";
import { useAuth } from "../context/AuthContext";
import { insertAuditLog } from "../lib/auditLog";
import { db } from "../lib/db";

type TaskStatus = "open" | "in_progress" | "done";

type QueueFilter = "all" | "overdue" | "due_soon";

interface TaskRow {
  id: string;
  title: string;
  assignee: string;
  due: Date | null;
  status: TaskStatus;
  client: string;
}

const MOCK: TaskRow[] = [
  {
    id: "mock-1",
    title: "Call client — motor NCB clarification",
    assignee: "You",
    due: addDays(startOfDay(new Date()), -3),
    status: "open",
    client: "Marie Dupont",
  },
  {
    id: "mock-2",
    title: "Renewal quote — home policy",
    assignee: "Alex Kumar",
    due: addDays(startOfDay(new Date()), 2),
    status: "in_progress",
    client: "Jean Paul",
  },
  {
    id: "mock-3",
    title: "KYC document review",
    assignee: "You",
    due: addDays(startOfDay(new Date()), 5),
    status: "open",
    client: "Sonia Li",
  },
  {
    id: "mock-4",
    title: "Quarterly compliance checklist",
    assignee: "Alex Kumar",
    due: addDays(startOfDay(new Date()), 40),
    status: "done",
    client: "Internal",
  },
];

function statusStyle(s: TaskStatus) {
  if (s === "done") return "bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-950/40 dark:text-accent-200 dark:border-accent-800/50";
  if (s === "in_progress") return "bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:border-primary-800/50";
  return "bg-muted text-muted-foreground border-border";
}

function taskBucket(t: TaskRow): "overdue" | "due_soon" | "other" {
  if (t.status === "done") return "other";
  if (!t.due) return "other";
  const d0 = startOfDay(t.due);
  const t0 = startOfDay(new Date());
  if (isBefore(d0, t0)) return "overdue";
  if (differenceInCalendarDays(d0, t0) <= 7) return "due_soon";
  return "other";
}

function TaskListBlock({
  title,
  hint,
  icon: Icon,
  tone,
  children,
}: {
  title: string;
  hint: string;
  icon: typeof AlertTriangle;
  tone: string;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-border/80 last:border-b-0">
      <div className={`flex items-center gap-2 border-b border-border/60 px-6 py-3 text-xs font-bold uppercase tracking-wide ${tone}`}>
        <Icon className="h-4 w-4" aria-hidden />
        <span>{title}</span>
        <span className="ml-auto font-medium normal-case tracking-normal text-muted-foreground">{hint}</span>
      </div>
      {children}
    </div>
  );
}

export function TasksPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");

  const staff = profile?.role === "admin" || profile?.role === "broker";

  useEffect(() => {
    const b = searchParams.get("bucket");
    if (b === "overdue" || b === "due_soon") setQueueFilter(b);
  }, [searchParams]);

  const setQueue = (q: QueueFilter) => {
    setQueueFilter(q);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (q === "all") next.delete("bucket");
        else next.set("bucket", q);
        return next;
      },
      { replace: true },
    );
  };

  const load = useCallback(async () => {
    if (!user || !staff) {
      setTasks([]);
      setLive(false);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      setTasks(MOCK);
      setLive(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await db.brokerTasks().select("*").order("due_at", { ascending: true, nullsFirst: false });
    if (error || !data) {
      setTasks(MOCK);
      setLive(false);
      if (error) toast.error("Could not load tasks — demo data.");
    } else {
      const rows = data as Array<{
        id: string;
        title: string;
        status: TaskStatus;
        due_at: string | null;
        client_id: string | null;
        assignee_id: string | null;
      }>;
      const ids = [...new Set(rows.flatMap((r) => [r.client_id, r.assignee_id]).filter(Boolean))] as string[];
      let names = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await db.profiles().select("id, full_name").in("id", ids);
        names = new Map((profs ?? []).map((p: { id: string; full_name: string }) => [p.id, p.full_name]));
      }
      setTasks(
        rows.map((t) => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee_id ? (names.get(t.assignee_id) ?? "—") : "—",
          due: t.due_at ? new Date(t.due_at) : null,
          status: t.status,
          client: t.client_id ? (names.get(t.client_id) ?? "—") : "—",
        })),
      );
      setLive(true);
    }
    setLoading(false);
  }, [user, session, demoAuthActive, staff]);

  useEffect(() => {
    void load();
  }, [load]);

  const assigneeOptions = useMemo(() => {
    const set = new Set(tasks.map((t) => t.assignee).filter(Boolean));
    return ["all", ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = assigneeFilter === "all" ? tasks : tasks.filter((t) => t.assignee === assigneeFilter);
    if (queueFilter === "overdue") list = list.filter((t) => taskBucket(t) === "overdue");
    if (queueFilter === "due_soon") list = list.filter((t) => taskBucket(t) === "due_soon");
    return list;
  }, [tasks, assigneeFilter, queueFilter]);

  const sections = useMemo(() => {
    const overdue = filtered.filter((t) => taskBucket(t) === "overdue");
    const dueSoon = filtered.filter((t) => taskBucket(t) === "due_soon");
    const other = filtered.filter((t) => taskBucket(t) === "other");
    return { overdue, dueSoon, other };
  }, [filtered]);

  const cycle = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || !user) return;
    const order: TaskStatus[] = ["open", "in_progress", "done"];
    const i = order.indexOf(t.status);
    const next = order[(i + 1) % order.length]!;
    const prevStatus = t.status;
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    if (!live || demoAuthActive || !session || id.startsWith("mock")) {
      toast.success("Task status updated (demo).");
      return;
    }
    const { error } = await db.brokerTasks().update({ status: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      void load();
    } else {
      toast.success("Updated.");
      void insertAuditLog({
        userId: user.id,
        action: "task_status_changed",
        resourceType: "broker_task",
        resourceId: id,
        details: { from: prevStatus, to: next, title: t.title },
      });
    }
  };

  const renderRow = (t: TaskRow) => (
    <li key={t.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
            <span className="font-medium text-surface-foreground/90">{t.assignee}</span>
          </div>
        </div>
      </div>
      <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(t.status)}`}>
        {t.status.replace("_", " ")}
      </span>
    </li>
  );

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
            Stored in <code className="text-xs">broker_tasks</code>. Visible to admins and brokers when Supabase is connected. Overdue and due-soon buckets use local midnight.
          </p>
        </div>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            live ? "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200" : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" aria-hidden />
          {loading ? "Loading…" : live ? "Live" : "Demo"}
        </span>
      </div>

      {!loading && tasks.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Assignee
            <select
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-surface-foreground"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              {assigneeOptions.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "Everyone" : a}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <span>Queue view</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All open"],
                  ["overdue", "Overdue"],
                  ["due_soon", "Due ≤7d"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQueue(key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    queueFilter === key
                      ? "border-primary-500 bg-primary-600 text-white"
                      : "border-border bg-surface text-surface-foreground hover:bg-muted/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/80 px-6 py-4">
          <ListTodo className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h3 className="font-semibold text-surface-foreground">Task queue</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="p-6">
            <CarePageEmpty
              icon={ListTodo}
              title="No tasks in the queue"
              description="Create broker_tasks in Supabase or use demo login to see sample SLAs, overdue items, and assignee filters."
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <CarePageEmpty
              icon={ListTodo}
              title="Nothing matches these filters"
              description="Try clearing the assignee filter or switching queue view to “All open” to see tasks again."
            />
          </div>
        ) : (
          <div>
            {queueFilter === "all" ? (
              <>
                {sections.overdue.length > 0 && (
                  <TaskListBlock
                    title="Overdue"
                    hint={`${sections.overdue.length} task${sections.overdue.length === 1 ? "" : "s"}`}
                    icon={AlertTriangle}
                    tone="text-danger-700 dark:text-danger-300"
                  >
                    <ul className="divide-y divide-border/80">{sections.overdue.map(renderRow)}</ul>
                  </TaskListBlock>
                )}
                {sections.dueSoon.length > 0 && (
                  <TaskListBlock
                    title="Due within 7 days"
                    hint={`${sections.dueSoon.length} task${sections.dueSoon.length === 1 ? "" : "s"}`}
                    icon={CalendarDays}
                    tone="text-warning-800 dark:text-warning-200"
                  >
                    <ul className="divide-y divide-border/80">{sections.dueSoon.map(renderRow)}</ul>
                  </TaskListBlock>
                )}
                {sections.other.length > 0 && (
                  <TaskListBlock title="Later & completed" hint={`${sections.other.length} shown`} icon={Clock} tone="text-muted-foreground">
                    <ul className="divide-y divide-border/80">{sections.other.map(renderRow)}</ul>
                  </TaskListBlock>
                )}
              </>
            ) : (
              <ul className="divide-y divide-border/80">{filtered.map(renderRow)}</ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
