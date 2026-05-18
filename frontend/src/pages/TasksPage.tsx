import { useCallback, useEffect, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { supabase } from "../lib/supabase";
import {
  WORKFLOW_COLOR_OPTIONS,
  workflowColorChipClass,
  workflowColorDotClass,
  type WorkflowColorToken,
} from "../lib/workflowChips";

type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

interface TaskRow {
  id: string;
  assignee_id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  task_date: string;
  status: TaskStatus;
  color_token: string;
  created_by: string;
  assignee?: { full_name: string } | null;
  client?: { full_name: string } | null;
}

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Done",
  cancelled: "Cancelled",
};

export function TasksPage() {
  const { user, profile, demoAuthActive } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const [day, setDay] = useState(() => new Date());
  const dayStr = format(day, "yyyy-MM-dd");
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teamDayView, setTeamDayView] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [clientChoices, setClientChoices] = useState<{ id: string; full_name: string }[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    color_token: "accent" as WorkflowColorToken,
    assignee_id: "",
    client_id: "",
  });

  const loadTasks = useCallback(async () => {
    if (!user || demoAuthActive) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let q = db
      .tasks()
      .select(
        `
        id, assignee_id, client_id, title, description, task_date, status, color_token, created_by,
        assignee:profiles!tasks_assignee_id_fkey ( full_name ),
        client:profiles!tasks_client_id_fkey ( full_name )
      `,
      )
      .eq("task_date", dayStr)
      .order("created_at", { ascending: true });

    if (profile?.role === "client") {
      q = q.or(`assignee_id.eq.${user.id},client_id.eq.${user.id}`);
    } else if (!teamDayView) {
      q = q.or(`assignee_id.eq.${user.id},client_id.eq.${user.id},created_by.eq.${user.id}`);
    }

    const { data, error } = await q;
    setLoading(false);
    if (error) {
      setRows([]);
      toast.error("Could not load tasks.");
      return;
    }
    setRows((data ?? []) as TaskRow[]);
  }, [user, profile?.role, dayStr, teamDayView, demoAuthActive]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!isStaff || demoAuthActive) {
      setProfiles([]);
      setClientChoices([]);
      return;
    }
    void supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name")
      .then(({ data }) => setProfiles((data ?? []) as typeof profiles));
    void supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "client")
      .order("full_name")
      .then(({ data }) => setClientChoices((data ?? []) as { id: string; full_name: string }[]));
  }, [isStaff, demoAuthActive]);

  useEffect(() => {
    if (user?.id) {
      setForm((f) => ({ ...f, assignee_id: f.assignee_id || user.id }));
    }
  }, [user?.id]);

  const addTask = async () => {
    if (!user) return;
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    const assignee = isStaff && form.assignee_id ? form.assignee_id : user.id;
    setSaving(true);
    try {
      const { error } = await db.tasks().insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        task_date: dayStr,
        status: "pending",
        color_token: form.color_token,
        assignee_id: assignee,
        client_id: form.client_id || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast.success("Task added for this day.");
      setForm((f) => ({ ...f, title: "", description: "", client_id: "" }));
      void loadTasks();
    } catch {
      toast.error("Could not add task.");
    } finally {
      setSaving(false);
    }
  };

  const setTaskStatus = async (id: string, status: TaskStatus) => {
    const { error } = await db.tasks().update({ status }).eq("id", id);
    if (error) {
      toast.error("Update failed.");
      return;
    }
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Remove this task?")) return;
    const { error } = await db.tasks().delete().eq("id", id);
    if (error) {
      toast.error("Delete failed.");
      return;
    }
    setRows((prev) => prev.filter((t) => t.id !== id));
    toast.success("Task removed.");
  };

  if (demoAuthActive) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-surface-foreground">Tasks</h2>
        <p className="text-muted-foreground">Tasks use live Supabase data. Turn off demo login to use day tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Tasks for the day</h2>
          <p className="text-muted-foreground">
            Pick a date to see everything due that day. Colour tags match the renewals page for a consistent look.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadTasks()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {isStaff && (
            <label className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={teamDayView} onChange={(e) => setTeamDayView(e.target.checked)} className="rounded border-border" />
              Team day view
            </label>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => setDay((d) => subDays(d, 1))}
            className="rounded-lg border border-border p-2 hover:bg-muted cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <input
              type="date"
              value={dayStr}
              onChange={(e) => setDay(parseISO(e.target.value))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium"
            />
          </div>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => setDay((d) => addDays(d, 1))}
            className="rounded-lg border border-border p-2 hover:bg-muted cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setDay(new Date())}
            className="ml-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer"
          >
            Today
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-surface-foreground">{format(day, "EEEE d MMM yyyy")}</span>
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <h3 className="font-semibold text-surface-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary-600" />
          Add task for {format(day, "d MMM")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-surface-foreground">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              placeholder="Call client, send renewal pack…"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-surface-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-surface-foreground">Colour tag</label>
            <select
              value={form.color_token}
              onChange={(e) => setForm((f) => ({ ...f, color_token: e.target.value as WorkflowColorToken }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              {WORKFLOW_COLOR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {isStaff && (
            <>
              <div>
                <label className="text-sm font-medium text-surface-foreground">Assignee</label>
                <select
                  value={form.assignee_id || user?.id}
                  onChange={(e) => setForm((f) => ({ ...f, assignee_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-surface-foreground">Related client (optional)</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="">None</option>
                  {clientChoices.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">Pick a client when the task is on their file (also visible to them).</p>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => void addTask()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add to this day
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No tasks for this day.</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3 min-w-0">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${workflowColorDotClass(t.color_token)}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-surface-foreground">{t.title}</p>
                    {t.description && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{t.description}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Assignee: {t.assignee?.full_name ?? "—"}
                      {t.client && <span> · Client: {t.client.full_name}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${workflowColorChipClass(t.color_token)}`}>{t.color_token}</span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{STATUS_LABEL[t.status]}</span>
                  <select
                    value={t.status}
                    onChange={(e) => void setTaskStatus(t.id, e.target.value as TaskStatus)}
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-xs cursor-pointer"
                  >
                    {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void setTaskStatus(t.id, "completed")}
                    className="rounded-lg border border-accent-200 bg-accent-50 p-2 text-accent-700 hover:bg-accent-100 cursor-pointer dark:border-accent-800 dark:bg-accent-950/40"
                    aria-label="Mark complete"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  {(isStaff || t.assignee_id === user?.id || t.created_by === user?.id) && (
                    <button
                      type="button"
                      onClick={() => void deleteTask(t.id)}
                      className="rounded-lg p-2 text-danger-600 hover:bg-danger-50 cursor-pointer dark:hover:bg-danger-950/30"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
