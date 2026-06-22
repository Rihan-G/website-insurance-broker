import { useTranslation } from "react-i18next";

const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "mfe", label: "KR" },
];

type Props = {
  /** When set, used for layout classes (e.g. nav on dark hero) */
  variant?: "default" | "onDark";
  className?: string;
};

/** EN / FR / Kreol switcher for the public marketing site, mirroring the dashboard switcher. */
export function LanguageSwitcher({ variant = "default", className = "" }: Props) {
  const { i18n } = useTranslation();

  const base =
    variant === "onDark"
      ? "border-white/20 bg-white/10 text-white"
      : "border-border bg-surface text-surface-foreground";

  const activeClass =
    variant === "onDark" ? "bg-white/25 text-white" : "bg-primary-600 text-white";
  const idleClass =
    variant === "onDark" ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-surface-foreground";

  return (
    <div
      className={`flex items-center gap-0.5 rounded-xl border p-1 text-xs font-bold backdrop-blur-sm ${base} ${className}`}
      role="group"
      aria-label="Choose language"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            void i18n.changeLanguage(code);
            localStorage.setItem("sb_lang", code);
          }}
          aria-pressed={i18n.language === code}
          className={`min-w-[2rem] cursor-pointer rounded-lg px-2 py-1 transition-colors duration-200 ${
            i18n.language === code ? activeClass : idleClass
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
