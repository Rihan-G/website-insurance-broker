/**
 * Base URL for the client-facing SecureBroker portal.
 * Set `VITE_CLIENT_PORTAL_URL` when the marketing / client site is hosted separately;
 * otherwise the current origin is used (same deployment).
 */
export function getClientPortalBaseUrl(): string {
  const raw = import.meta.env.VITE_CLIENT_PORTAL_URL as string | undefined;
  if (raw?.trim()) return raw.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

/** Full URL to a dashboard path on the client portal (e.g. `/dashboard/documents`). */
export function clientPortalUrl(path: string): string {
  const base = getClientPortalBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
