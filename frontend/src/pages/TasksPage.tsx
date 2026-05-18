import { useState } from "react";
import { ListTodo, Circle, CircleCheck, Clock, User } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

type TaskStatus = "open" | "in_progress" | "done";

interface TaskRow {
  id: string;
  title: string;
  assignee: string;
  due: Date;
  status: TaskStatus;
  client: string;
}

const INITIAL: TaskRow[] = [
  { id: "1", title: "Call client — motor NCB clarification", assignee: "You", due: new Date(Date.now() + 1000 * 60 * 60 * 8), status: "open", client: "Marie Dupont" },
  { id: "2", title: "Upload signed mandate to insurer portal", assignee: "Broker desk", due: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), status: "in_progress", client: "Jean-Pierre R." },
  { id: "3", title: "Reconcile commission statement — April", assignee: "Finance", due: new Date(Date.now() - 1000 * 60 * 60 * 6), status: "done", client: "—" },
];

function statusStyle(s: TaskStatus) {
  if (s === "done") return "bg-accent-50 text-accent-800 border-accent-200 dark:bg-accent-950/40 dark:text-accent-200 dark:border-accent-800/50";
  if (s === "in_progress") return "bg-primary-50 text-primary-800 border-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:border-primary-800/50";
  return "bg-muted text-muted-foreground border-border";
}

export function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL);

  const cycle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const order: TaskStatus[] = ["open", "in_progress", "done"];
        const i = order.indexOf(t.status);
        const next = order[(i + 1) % order.length]!;
        return { ...t, status: next };
      }),
    );
    toast.success("Task status updated (demo).");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Operations</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Tasks & SLAs</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Lightweight follow-ups for brokers and admins. Connect to assignments tables or an external PM tool when you scale.
        </p>
      </div>

      <div className="dashboard-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/80 px-6 py-4">
          <ListTodo className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
          <h3 className="font-semibold text-surface-foreground">Open queue</h3>
        </div>
        <ul className="divide-y divide-border/80">
          {tasks.map((t) => (
            <li key={t.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 gap-3">
                <button
                  type="button"
                  onClick={() => cycle(t.id)}
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
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      Due {format(t.due, "MMM d, HH:mm")}
                    </span>
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
      </div>
    </div>
  );
}
