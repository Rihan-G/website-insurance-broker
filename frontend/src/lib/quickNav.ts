/** Flat navigation for command palette — keep in sync with `App.tsx` routes and `RoleGuard` rules. */
import type { PortalFlavor } from "./portalFlavor";
import { getPortalFlavor } from "./portalFlavor";

export type AppRole = "admin" | "broker" | "client";

export interface QuickNavItem {
  id: string;
  label: string;
  to: string;
  /** Extra tokens to match when filtering (lowercased). */
  keywords?: string;
  /** If set, only these roles see the item. */
  roles?: AppRole[];
}

export const QUICK_NAV_ITEMS: QuickNavItem[] = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard", keywords: "home overview stats" },
  { id: "my-policies", label: "My Policies", to: "/dashboard/my-policies", keywords: "client portal policies", roles: ["client"] },
  { id: "documents", label: "Documents", to: "/dashboard/documents", keywords: "files download pdf" },
  { id: "upload", label: "Upload", to: "/dashboard/upload", keywords: "ocr scan files" },
  { id: "clients", label: "Clients", to: "/dashboard/clients", keywords: "crm people", roles: ["admin", "broker"] },
  { id: "services", label: "Services", to: "/dashboard/services", keywords: "products motor home" },
  { id: "quotes", label: "Quote Calculator", to: "/dashboard/quotes", keywords: "premium estimate motor" },
  { id: "mid-term", label: "Mid-Term Adjustments", to: "/dashboard/mid-term", keywords: "mta policy change" },
  { id: "inbox", label: "Inbox", to: "/dashboard/inbox", keywords: "messages mail" },
  { id: "payments", label: "Payments", to: "/dashboard/payments", keywords: "invoice card receipt" },
  { id: "renewals", label: "Renewals", to: "/dashboard/renewals", keywords: "renewal countdown reminders retention" },
  { id: "claims", label: "Claims intake", to: "/dashboard/claims", keywords: "fnol loss incident first notice" },
  { id: "secure-messages", label: "Secure messages", to: "/dashboard/secure-messages", keywords: "encrypted threads chat" },
  { id: "notifications", label: "Notifications", to: "/dashboard/notifications", keywords: "alerts activity feed" },
  { id: "tasks", label: "Tasks", to: "/dashboard/tasks", keywords: "sla follow up todo broker", roles: ["admin", "broker"] },
  { id: "whatsapp", label: "WhatsApp", to: "/dashboard/whatsapp", keywords: "templates meta", roles: ["admin", "broker"] },
  { id: "review", label: "Document Review", to: "/dashboard/review", keywords: "ocr approve", roles: ["admin", "broker"] },
  { id: "analytics", label: "Analytics", to: "/dashboard/analytics", keywords: "charts reports", roles: ["admin", "broker"] },
  { id: "commissions", label: "Commissions", to: "/dashboard/commissions", keywords: "broker fees", roles: ["admin", "broker"] },
  { id: "capacity", label: "Capacity Management", to: "/dashboard/capacity", keywords: "brokers workload", roles: ["admin"] },
  { id: "audit", label: "Audit Log", to: "/dashboard/audit", keywords: "security history", roles: ["admin"] },
  { id: "expiry", label: "Expiry Monitor", to: "/dashboard/expiry", keywords: "renewal alerts" },
  { id: "calendar", label: "Holiday Calendar", to: "/dashboard/calendar", keywords: "mauritius holidays" },
  { id: "voice", label: "Voice Upload", to: "/dashboard/voice", keywords: "transcription audio" },
  { id: "compliance", label: "Compliance & KYC", to: "/dashboard/compliance", keywords: "aml kyc", roles: ["admin", "broker"] },
  { id: "2fa", label: "Two-Factor Auth", to: "/dashboard/2fa", keywords: "totp security" },
  { id: "settings", label: "Settings", to: "/dashboard/settings", keywords: "profile account" },
];

function quickNavItemAllowedForShell(item: QuickNavItem, role: AppRole, shell: PortalFlavor): boolean {
  if (shell === "client") {
    if (!item.roles) return true;
    return item.roles.includes("client");
  }
  if (shell === "staff") {
    if (!item.roles) return true;
    return item.roles.some((r) => r === "admin" || r === "broker");
  }
  if (!item.roles) return true;
  return item.roles.includes(role);
}

export function quickNavForRole(role: AppRole | undefined, query: string): QuickNavItem[] {
  const r = role ?? "client";
  const shell = getPortalFlavor();
  const allowed = QUICK_NAV_ITEMS.filter((item) => quickNavItemAllowedForShell(item, r, shell));
  const q = query.trim().toLowerCase();
  if (!q) return allowed;
  return allowed.filter((item) => {
    const hay = `${item.label} ${item.keywords ?? ""} ${item.id}`.toLowerCase();
    return hay.includes(q);
  });
}
