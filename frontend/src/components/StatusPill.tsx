type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  success: "border-accent-200 bg-accent-50 text-accent-800 dark:border-accent-700 dark:bg-accent-950/40 dark:text-accent-200",
  warning: "border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-700 dark:bg-warning-950/35 dark:text-warning-200",
  danger: "border-danger-200 bg-danger-50 text-danger-700 dark:border-danger-700 dark:bg-danger-950/35 dark:text-danger-200",
  info: "border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-700 dark:bg-primary-950/40 dark:text-primary-200",
};

export function StatusPill({
  label,
  tone = "neutral",
  icon,
}: {
  label: string;
  tone?: StatusTone;
  icon?: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {icon}
      {label}
    </span>
  );
}
