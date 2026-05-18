/** Demo-only: stack renewal pings and other alerts for the signed-in user (no Supabase). */

export type DemoPortalNotifKind = "document" | "payment" | "security" | "system";

export interface DemoPortalNotif {
  id: string;
  kind: DemoPortalNotifKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
}

function key(userId: string): string {
  return `sb_demo_portal_notifications_v1:${userId}`;
}

export function readDemoPortalNotifications(userId: string): DemoPortalNotif[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(key(userId));
    if (!raw) return [];
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter(
      (row): row is DemoPortalNotif =>
        typeof row === "object" &&
        row !== null &&
        typeof (row as DemoPortalNotif).id === "string" &&
        typeof (row as DemoPortalNotif).title === "string" &&
        typeof (row as DemoPortalNotif).body === "string",
    );
  } catch {
    return [];
  }
}

export function pushDemoPortalNotification(
  userId: string,
  partial: Omit<DemoPortalNotif, "id" | "at" | "read"> & { at?: string; read?: boolean },
): DemoPortalNotif {
  const next: DemoPortalNotif = {
    id: `demo-n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: partial.kind,
    title: partial.title,
    body: partial.body,
    at: partial.at ?? new Date().toISOString(),
    read: partial.read ?? false,
  };
  const prev = readDemoPortalNotifications(userId);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(key(userId), JSON.stringify([next, ...prev].slice(0, 50)));
  }
  return next;
}

export function markDemoPortalNotificationRead(userId: string, id: string): void {
  const prev = readDemoPortalNotifications(userId);
  const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(key(userId), JSON.stringify(next));
  }
}

export function markAllDemoPortalNotificationsRead(userId: string): void {
  const prev = readDemoPortalNotifications(userId);
  const next = prev.map((n) => ({ ...n, read: true }));
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(key(userId), JSON.stringify(next));
  }
}
