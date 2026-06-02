/** Minimal full-width spinner while lazy dashboard routes load. */
export function PageFallback() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center" aria-busy="true" aria-live="polite" aria-label="Loading page">
      <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent dark:border-primary-400" />
        Loading page...
      </div>
    </div>
  );
}
