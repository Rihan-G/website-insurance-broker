import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

type Props = {
  /** When set, used for layout classes (e.g. nav on dark hero) */
  variant?: "default" | "onDark";
  className?: string;
};

export function ThemeToggle({ variant = "default", className = "" }: Props) {
  const { resolved, setPreference } = useTheme();
  const isDark = resolved === "dark";

  const base =
    variant === "onDark"
      ? "rounded-xl border border-white/20 bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
      : "rounded-xl border border-border bg-surface p-2 text-surface-foreground shadow-sm hover:bg-muted";

  return (
    <button
      type="button"
      onClick={() => setPreference(isDark ? "light" : "dark")}
      className={`cursor-pointer transition-colors duration-200 ${base} ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
    </button>
  );
}
