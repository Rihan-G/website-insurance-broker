/** Shared chip / badge styling for renewals and tasks (colour + label copy). */

export const WORKFLOW_COLOR_TOKENS = ["primary", "accent", "warning", "danger", "muted"] as const;
export type WorkflowColorToken = (typeof WORKFLOW_COLOR_TOKENS)[number];

export const WORKFLOW_COLOR_OPTIONS: { value: WorkflowColorToken; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "accent", label: "Accent" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
  { value: "muted", label: "Muted" },
];

export function workflowColorChipClass(token: string): string {
  const map: Record<string, string> = {
    primary:
      "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800 dark:bg-primary-950/60 dark:text-primary-200",
    accent:
      "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-800 dark:bg-accent-950/50 dark:text-accent-200",
    warning:
      "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-800 dark:bg-warning-950/40 dark:text-warning-200",
    danger:
      "border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800 dark:bg-danger-950/40 dark:text-danger-200",
    muted: "border-border bg-muted text-muted-foreground",
  };
  return map[token] ?? map.muted;
}

export function workflowColorDotClass(token: string): string {
  const map: Record<string, string> = {
    primary: "bg-primary-500",
    accent: "bg-accent-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    muted: "bg-muted-foreground/50",
  };
  return map[token] ?? map.muted;
}
