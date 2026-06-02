import { useCallback, useEffect, useState } from "react";
import { Bell, BellRing, CheckCheck, FileText, CreditCard, Shield, Database } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import {
  readDemoPortalNotifications,
  markDemoPortalNotificationRead,
  markAllDemoPortalNotificationsRead,
} from "../lib/demoClientNotifications";
import { StatusPill } from "../components/StatusPill";

type NotifKind = "document" | "payment" | "security" | "system";

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
];

export function NotificationsPage() {
  const { user, session, demoAuthActive } = useAuth();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [kindFilter, setKindFilter] = useState<"all" | NotifKind>("all");

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      const stacked = readDemoPortalNotifications(user.id).map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        at: new Date(n.at),
        read: n.read,
      }));
      setItems([...stacked, ...MOCK]);
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

  const unread = items.filter((i) => !i.read).length;
  const visibleItems = items.filter((i) => (showUnreadOnly ? !i.read : true)).filter((i) => (kindFilter === "all" ? true : i.kind === kindFilter));

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
    if (demoAuthActive && user && id.startsWith("demo-n-")) {
      markDemoPortalNotificationRead(user.id, id);
      return;
    }
    if (!live || demoAuthActive || !session || id.startsWith("mock")) return;
    const { error } = await db.portalNotifications().update({ read: true }).eq("id", id).eq("user_id", user!.id);
    if (error) toast.error(error.message);
  };

  const markAll = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    if (demoAuthActive && user) {
      markAllDemoPortalNotificationsRead(user.id);
      toast.success("All notifications marked read (demo).");
      return;
    }
    if (!live || demoAuthActive || !session) {
      toast.success("All notifications marked read (demo).");
      return;
    }
    const { error } = await db.portalNotifications().update({ read: true }).eq("user_id", user!.id);
    if (error) toast.error(error.message);
    else toast.success("All marked read.");
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
          <StatusPill
            tone={live ? "success" : "neutral"}
            icon={<Database className="h-3.5 w-3.5" aria-hidden />}
            label={loading ? "Loading…" : live ? "Live" : "Demo"}
          />
          <button
            type="button"
            onClick={() => setShowUnreadOnly((v) => !v)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${showUnreadOnly ? "border-primary-300 bg-primary-50 text-primary-800 dark:border-primary-700 dark:bg-primary-950/40 dark:text-primary-200" : "border-border bg-surface text-muted-foreground"}`}
          >
            Unread only
          </button>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as "all" | NotifKind)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-surface-foreground"
            aria-label="Filter by notification type"
          >
            <option value="all">All types</option>
            <option value="document">Documents</option>
            <option value="payment">Payments</option>
            <option value="security">Security</option>
            <option value="system">System</option>
          </select>
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

      <div className="dashboard-panel rounded-2xl divide-y divide-border/80">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : visibleItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <p>No notifications in this view yet.</p>
            <p className="mt-1 text-xs">Keeping this list clear helps you spot urgent policy actions faster.</p>
          </div>
        ) : (
          visibleItems.map((n) => {
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
