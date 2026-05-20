import { Bot, Sparkles } from "lucide-react";

/**
 * Visual placeholder for a future insurance assistant (no backend / no model wired yet).
 * Icon + text field sit side‑by‑side; input is read-only so visitors are not misled into expecting replies.
 */
export function HomeAssistantTeaser() {
  return (
    <div
      className="pointer-events-auto fixed z-[35] max-lg:left-4 max-lg:right-4 max-lg:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:right-8 lg:left-auto lg:max-w-md"
      role="region"
      aria-label="Insurance assistant preview"
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-border/90 bg-surface/95 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md ring-2 ring-violet-400/30 dark:from-violet-500 dark:to-indigo-500 dark:ring-violet-300/25"
          aria-hidden
        >
          <Bot className="h-5 w-5 text-white" strokeWidth={2} />
          <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-200 drop-shadow-sm" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <label htmlFor="home-assistant-teaser-input" className="sr-only">
            Insurance assistant (coming soon)
          </label>
          <input
            id="home-assistant-teaser-input"
            name="assistant-teaser"
            type="text"
            readOnly
            tabIndex={-1}
            autoComplete="off"
            placeholder="Ask about cover, renewals, or claims…"
            title="Assistant is not connected yet — use Get a quote, WhatsApp, or call us for now."
            className="h-10 w-full min-w-0 cursor-default rounded-xl border border-border/80 bg-muted/50 px-3 text-sm text-surface-foreground placeholder:text-muted-foreground/80 outline-none ring-primary-500/20 focus-visible:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-primary-50 dark:placeholder:text-primary-300/70"
          />
          <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground dark:text-primary-400/90">
            Assistant coming soon · not connected
          </p>
        </div>
      </div>
    </div>
  );
}
