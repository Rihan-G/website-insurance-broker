import { useEffect } from "react";

/**
 * Full-page navigation to another origin (client ↔ staff portal).
 * Used so each hostname keeps its own Supabase session in localStorage.
 */
export function CrossPortalNavigate({ href }: { href: string }) {
  useEffect(() => {
    window.location.assign(href);
  }, [href]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
      <p>Opening the other portal…</p>
    </div>
  );
}
