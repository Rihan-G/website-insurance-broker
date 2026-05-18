import { useState } from "react";
import { Bell, BellRing, CheckCheck, FileText, CreditCard, Shield } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

type NotifKind = "document" | "payment" | "security";

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
};

const INITIAL: NotifItem[] = [
  {
    id: "n1",
    kind: "document",
    title: "Document processed",
    body: "Your motor policy schedule OCR finished with 96% confidence.",
    at: new Date(Date.now() - 1000 * 60 * 20),
    read: false,
  },
  {
    id: "n2",
    kind: "payment",
    title: "Payment received",
    body: "MUR 4,200 allocated to policy MOT-2024-8841.",
    at: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: false,
  },
  {
    id: "n3",
    kind: "security",
    title: "New device sign-in",
    body: "Chrome on Windows from Port Louis — if this was not you, reset your password.",
    at: new Date(Date.now() - 1000 * 60 * 60 * 30),
    read: true,
  },
];

export function NotificationsPage() {
  const [items, setItems] = useState(INITIAL);

  const unread = items.filter((i) => !i.read).length;

  const markRead = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  };

  const markAll = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    toast.success("All notifications marked read (demo).");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Activity</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Notifications</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            In-app feed for documents, payments, and security signals. Hook to Supabase realtime or your event bus when ready.
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-surface-foreground shadow-sm hover:bg-muted/60"
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            Mark all read
          </button>
        )}
      </div>

      <div className="dashboard-panel rounded-2xl divide-y divide-border/80">
        {items.map((n) => {
          const Icon = ICONS[n.kind];
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => markRead(n.id)}
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
        })}
      </div>
    </div>
  );
}
