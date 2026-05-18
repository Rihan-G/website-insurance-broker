export type PortalFlavor = "unified" | "client" | "staff";

/** How this bundle is deployed: single site (default), client-only host, or staff-only host. */
export function getPortalFlavor(): PortalFlavor {
  const v = import.meta.env.VITE_PORTAL_FLAVOR?.trim().toLowerCase();
  if (v === "client" || v === "staff") return v;
  return "unified";
}

export function isUnifiedPortal(): boolean {
  return getPortalFlavor() === "unified";
}

export function isClientPortalHost(): boolean {
  return getPortalFlavor() === "client";
}

export function isStaffPortalHost(): boolean {
  return getPortalFlavor() === "staff";
}

/** Operations / staff portal origin (no trailing slash). Used from client portal for hand-offs. */
export function staffPortalBaseUrl(): string | null {
  const raw = import.meta.env.VITE_STAFF_PORTAL_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

/** Client portal origin (no trailing slash). Used from staff portal for hand-offs. */
export function clientPortalBaseUrl(): string | null {
  const raw = import.meta.env.VITE_CLIENT_PORTAL_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}
