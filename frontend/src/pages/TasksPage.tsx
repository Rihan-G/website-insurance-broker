import { useCallback, useEffect, useState } from "react";
import { ListTodo, Circle, CircleCheck, Clock, User, Database } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";

type TaskStatus = "open" | "in_progress" | "done";

interface TaskRow {
  id: string;
  title: string;
  assignee: string;
  due: Date | null;
  status: TaskStatus;
  client: string;
}

const MOCK: TaskRow[] = [
  { id: "mock-1", title: "Call client — motor NCB clarification", assignee: "You", due: new Date(Date.now() + 1000 * 60 * 60 * 8), status: "open", client: "Marie Dupont" },
];

function statusStyle(s: TaskStatus) {
  if (s === "done") return "bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-950/40 dark:text-accent-200 dark:border-accent-800/50";
  if (s === "in_progress") return "bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:border-primary-800/50";
  return "bg-muted text-muted-foreground border-border";
}

export function TasksPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const staff = profile?.role === "admin" || profile?.role === "broker";

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

  const cycle = async (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const order: TaskStatus[] = ["open", "in_progress", "done"];
    const i = order.indexOf(t.status);
    const next = order[(i + 1) % order.length]!;
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    if (!live || demoAuthActive || !session || id.startsWith("mock")) {
      toast.success("Task status updated (demo).");
      return;
    }
    const { error } = await db.brokerTasks().update({ status: next }).eq("id", id);
    if (error) {
      toast.error(error.message);
      void load();
    } else toast.success("Updated.");
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
            Stored in <code className="text-xs">broker_tasks</code>. Visible to admins and brokers when Supabase is connected.
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

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/80 px-6 py-4">
          <ListTodo className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h3 className="font-semibold text-surface-foreground">Open queue</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No tasks yet. Insert rows in Supabase or use demo login.</div>
        ) : (
          <ul className="divide-y divide-border/80">
            {tasks.map((t) => (
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
                      <span>{t.assignee}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(t.status)}`}>
                  {t.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
