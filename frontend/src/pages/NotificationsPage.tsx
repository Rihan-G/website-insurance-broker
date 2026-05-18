import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell, BellRing, CheckCheck, FileText, CreditCard, Shield, Database, Inbox } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { CarePageEmpty } from "../components/CarePageEmpty";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";

type NotifKind = "document" | "payment" | "security" | "system";

type ReadFilter = "all" | "unread";
type KindFilter = "all" | NotifKind;

interface NotifItem {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  at: Date;
  read: boolean;
}

const ICONS: Record<NotifKind, typeof Bell> = {
  document: FileText,
  payment: CreditCard,
  security: Shield,
  system: Bell,
};

const MOCK: NotifItem[] = [
  {
    id: "mock-1",
    kind: "document",
    title: "Document processed",
    body: "Your motor policy schedule OCR finished with 96% confidence.",
    at: new Date(Date.now() - 1000 * 60 * 20),
    read: false,
  },
  {
    id: "mock-2",
    kind: "payment",
    title: "Payment received",
    body: "MUR 4,200 allocated to policy MOT-2024-8841.",
    at: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: false,
  },
  {
    id: "mock-3",
    kind: "security",
    title: "New device sign-in",
    body: "A new browser session was recorded from Chrome on Windows.",
    at: new Date(Date.now() - 1000 * 60 * 60 * 26),
    read: true,
  },
];

const KIND_LABELS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "document", label: "Documents" },
  { value: "payment", label: "Payments" },
  { value: "security", label: "Security" },
  { value: "system", label: "System" },
];

export function NotificationsPage() {
  const { user, session, demoAuthActive } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const markAllFromUrlDone = useRef(false);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      setItems(MOCK);
      setLive(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await db
      .portalNotifications()
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      setItems(MOCK);
      setLive(false);
      toast.error("Could not load notifications — showing demo data.");
    } else {
      setItems(
        (data ?? []).map((n: Record<string, unknown>) => ({
          id: n.id as string,
          kind: n.kind as NotifKind,
          title: n.title as string,
          body: n.body as string,
          at: new Date(n.created_at as string),
          read: Boolean(n.read),
        })),
      );
      setLive(true);
    }
    setLoading(false);
  }, [user, session, demoAuthActive]);

  useEffect(() => {
    void load();
  }, [load]);

  const markAll = useCallback(async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    if (!live || demoAuthActive || !session) {
      toast.success("All notifications marked read (demo).");
      return;
    }
    const { error } = await db.portalNotifications().update({ read: true }).eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else toast.success("All marked read.");
  }, [live, demoAuthActive, session, user]);

  useEffect(() => {
    if (loading) return;
    if (searchParams.get("markAll") !== "1") {
      markAllFromUrlDone.current = false;
      return;
    }
    if (markAllFromUrlDone.current) return;
    markAllFromUrlDone.current = true;
    void (async () => {
      await markAll();
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("markAll");
          return next;
        },
        { replace: true },
      );
      markAllFromUrlDone.current = false;
    })();
  }, [loading, searchParams, markAll, setSearchParams]);

  const unread = items.filter((i) => !i.read).length;

  const visible = useMemo(() => {
    let list = items;
    if (readFilter === "unread") list = list.filter((i) => !i.read);
    if (kindFilter !== "all") list = list.filter((i) => i.kind === kindFilter);
    return list;
  }, [items, readFilter, kindFilter]);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    if (!live || demoAuthActive || !session || id.startsWith("mock")) return;
    const { error } = await db.portalNotifications().update({ read: true }).eq("id", id).eq("user_id", user!.id);
    if (error) toast.error(error.message);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Activity</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Notifications</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Reads from <code className="text-xs">portal_notifications</code> for your signed-in user.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
              live ? "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200" : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <Database className="h-3.5 w-3.5" aria-hidden />
            {loading ? "Loading…" : live ? "Live" : "Demo"}
          </span>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void markAll()}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-surface-foreground shadow-sm hover:bg-muted/60"
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <span>Read state</span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["unread", "Unread only"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReadFilter(key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    readFilter === key
                      ? "border-primary-500 bg-primary-600 text-white"
                      : "border-border bg-surface text-surface-foreground hover:bg-muted/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex min-w-[11rem] flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Type
            <select
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-surface-foreground"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            >
              {KIND_LABELS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="dashboard-panel rounded-2xl divide-y divide-border/80">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <CarePageEmpty
              icon={Inbox}
              title="No notifications yet"
              description="When your broker or the portal generates alerts, they will appear here. Connect Supabase or use demo mode to preview sample items."
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-6">
            <CarePageEmpty
              icon={Bell}
              title="No notifications match these filters"
              description="Switch back to “All” read state or clear the type filter to see your full activity feed."
            />
          </div>
        ) : (
          visible.map((n) => {
            const Icon = ICONS[n.kind] ?? Bell;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => void markRead(n.id)}
                className={`flex w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-50/40 dark:hover:bg-muted/25 ${
                  !n.read ? "bg-primary-50/30 dark:bg-primary-950/20" : ""
                }`}
              >
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    n.kind === "security"
                      ? "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-300"
                      : "border-border bg-muted/50 text-primary-700 dark:text-primary-300"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-surface-foreground">{n.title}</p>
                    {!n.read && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <BellRing className="h-3 w-3" aria-hidden />
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">{format(n.at, "MMM d, yyyy · HH:mm")}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
