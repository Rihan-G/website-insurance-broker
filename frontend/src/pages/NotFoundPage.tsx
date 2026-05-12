import { Link, useLocation } from "react-router-dom";
import { Home, LogIn, LayoutDashboard, ArrowLeft } from "lucide-react";
import { COMPANY_NAME_SHORT } from "../lib/branding";

export function NotFoundPage() {
  const location = useLocation();
  const inDashboard = location.pathname.startsWith("/dashboard");

  if (inDashboard) {
    return (
      <div className="flex min-h-[min(70vh,32rem)] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
        <p className="text-6xl font-black tabular-nums text-primary-200 dark:text-primary-900/80">404</p>
        <h1 className="mt-2 text-xl font-bold text-surface-foreground">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          There is no route for <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-surface-foreground">{location.pathname}</code>.
          Check the spelling or pick a destination below.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/dashboard/documents"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted transition-colors"
          >
            Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
          <ArrowLeft className="h-4 w-4" />
          Back to {COMPANY_NAME_SHORT}
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-7xl font-black tabular-nums text-primary-100 dark:text-primary-950">404</p>
        <h1 className="mt-4 text-2xl font-bold text-surface-foreground sm:text-3xl">We could not find that page</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          The address may be mistyped, or the page may have moved. If you followed a bookmark, try opening the portal from the home page.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-surface-foreground hover:bg-muted transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
