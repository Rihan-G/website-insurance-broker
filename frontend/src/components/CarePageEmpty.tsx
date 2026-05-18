import type { LucideIcon } from "lucide-react";

interface CarePageEmptyProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

/** Shared empty state for Care / operations pages (notifications, tasks, renewals, etc.). */
export function CarePageEmpty({ icon: Icon, title, description }: CarePageEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/90 bg-gradient-to-b from-muted/30 to-transparent px-8 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-surface text-primary-600 shadow-sm dark:text-primary-400">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <p className="text-base font-semibold tracking-tight text-surface-foreground">{title}</p>
        {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
