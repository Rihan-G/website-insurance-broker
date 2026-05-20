/** Minimal full-width spinner while lazy dashboard routes load. */
export function PageFallback() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center" aria-busy="true" aria-label="Loading page">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent dark:border-primary-400" />
    </div>
  );
}
