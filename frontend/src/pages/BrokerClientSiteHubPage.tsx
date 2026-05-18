import { ExternalLink, FileText, FolderOpen, Home, MessageSquare, Receipt, ShieldAlert, Upload, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { clientPortalUrl, getClientPortalBaseUrl } from "../lib/clientPortalUrl";

const CLIENT_LINKS: { id: string; label: string; description: string; path: string; icon: typeof Home }[] = [
  { id: "policies", label: "My policies", description: "Client policy list, certificates, and renewal status.", path: "/dashboard/my-policies", icon: Home },
  { id: "documents", label: "Documents", description: "Download and review files shared with the client.", path: "/dashboard/documents", icon: FileText },
  { id: "upload", label: "Upload", description: "Client upload & OCR flow for schedules and proof.", path: "/dashboard/upload", icon: Upload },
  { id: "payments", label: "Payments", description: "Payment history and receipts on the client account.", path: "/dashboard/payments", icon: Receipt },
  { id: "messages", label: "Secure messages", description: "Encrypted threads visible to the signed-in client.", path: "/dashboard/secure-messages", icon: MessageSquare },
  { id: "claims", label: "Claims intake", description: "First notice of loss wizard as the client sees it.", path: "/dashboard/claims", icon: ShieldAlert },
];

const INTERNAL_LINKS: { id: string; label: string; description: string; to: string; icon: typeof Users }[] = [
  { id: "clients", label: "Clients (CRM)", description: "Pick a client profile before opening the portal links.", to: "/dashboard/clients", icon: Users },
  { id: "review", label: "Document review", description: "Staff queue for OCR and approvals.", to: "/dashboard/review", icon: FolderOpen },
];

/** Admin & broker hub: opens the client-facing site in a new tab for assisted sessions. */
export function BrokerClientSiteHubPage() {
  const base = getClientPortalBaseUrl();
  const sameOrigin = typeof window !== "undefined" && base === window.location.origin;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Staff</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Client website shortcuts</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          For admins and brokers working with a client: these open the same client-facing pages for files, uploads, and service tasks. Each link opens in a new tab so you keep this workspace open.
        </p>
      </div>

      <div className="rounded-2xl border border-primary-200/80 bg-primary-50/50 p-4 text-sm text-primary-900 dark:border-primary-800/50 dark:bg-primary-950/35 dark:text-primary-100">
        <p className="font-semibold">Portal base URL</p>
        <p className="mt-1 break-all font-mono text-xs opacity-90">{base || "(not available)"}</p>
        <p className="mt-2 text-xs leading-relaxed opacity-90">
          {sameOrigin ? (
            <>Same deployment as this dashboard. For a separate marketing or client-only host, set <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">VITE_CLIENT_PORTAL_URL</code> at build time.</>
          ) : (
            <>Using <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">VITE_CLIENT_PORTAL_URL</code> — links leave this origin.</>
          )}
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Open client site (new tab)</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CLIENT_LINKS.map((item) => {
            const href = clientPortalUrl(item.path);
            return (
              <a
                key={item.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-border/90 bg-surface p-5 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50/30 dark:hover:border-primary-700 dark:hover:bg-primary-950/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary-600 dark:text-primary-400">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400" aria-hidden />
                </div>
                <p className="mt-3 font-semibold text-surface-foreground">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                <p className="mt-3 truncate text-[10px] font-mono text-muted-foreground/80">{href}</p>
              </a>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Continue in broker workspace</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {INTERNAL_LINKS.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className="flex flex-col rounded-2xl border border-border/90 bg-muted/15 p-5 transition-colors hover:border-border hover:bg-muted/25"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary-600 dark:text-primary-400">
                  <item.icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="font-semibold text-surface-foreground">{item.label}</p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
