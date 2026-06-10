import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CurrencySwitcher } from "../../components/CurrencySwitcher";
import { useTheme } from "../../context/ThemeContext";
import { COMPANY_NAME_SHORT } from "../../lib/branding";

const navLinks = [
  { href: "#platform", label: "Platform" },
  { href: "#claims", label: "Claims" },
  { href: "#services", label: "Services" },
  { href: "#products", label: "Products" },
  { href: "#quote", label: "Get Quote" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

const SCROLL_THRESHOLD = 24;

export function HomeMarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > SCROLL_THRESHOLD : false,
  );
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const { resolved } = useTheme();
  const isDark = resolved === "dark";
  const heroTop = !scrolled;

  const bar = scrolled
    ? "border-b border-primary-200/90 bg-white/92 shadow-[0_8px_30px_-12px_rgba(3,105,161,0.2)] backdrop-blur-xl dark:border-border dark:bg-surface/96 dark:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)]"
    : isDark
      ? "border-b border-white/10 bg-slate-950/35 shadow-none backdrop-blur-md dark:border-white/8 dark:bg-black/25"
      : "border-b border-primary-200/55 bg-white/55 shadow-none backdrop-blur-md";

  const linkBase =
    "relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:rounded-full after:bg-current after:transition-all after:duration-200 after:content-[''] ";
  const linkIdle = scrolled
    ? "text-primary-800 hover:text-primary-950 after:w-0 hover:after:w-full dark:text-primary-200 dark:hover:text-white"
    : isDark
      ? "text-primary-50 hover:text-white after:w-0 hover:after:w-full"
      : "text-primary-800 hover:text-primary-950 after:w-0 hover:after:w-full";

  const brand = scrolled
    ? "text-primary-900 dark:text-primary-50"
    : isDark
      ? "text-white drop-shadow-sm dark:text-primary-50"
      : "text-primary-950";

  const heroCta =
    heroTop && !isDark
      ? "bg-white/75 text-primary-900 ring-1 ring-primary-300/60 hover:bg-white/90"
      : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25 dark:bg-white/10 dark:ring-white/20 dark:hover:bg-white/15";

  return (
    <nav className={`fixed top-0 z-50 w-full transition-[background,box-shadow,border-color] duration-300 ${bar}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandLogo
            className="h-9 shrink-0"
            imageClassName="h-9 w-auto max-w-[9.5rem] shrink-0 object-contain"
            label="Sindicom Brokers"
          />
          <span className={`truncate text-lg font-bold tracking-tight transition-colors ${brand}`}>{COMPANY_NAME_SHORT}</span>
        </div>

        <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className={`${linkBase} ${linkIdle}`}>
              {label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="#quote"
            className={`hidden rounded-lg px-4 py-2 text-sm font-bold transition-colors duration-200 md:inline-flex ${
              scrolled ? "btn-marketing text-white" : heroCta
            }`}
          >
            Get Quote
          </a>
          <CurrencySwitcher />
          <ThemeToggle variant={scrolled || !isDark ? "default" : "onDark"} />
          <Link
            to="/login"
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 sm:px-4 ${
              scrolled
                ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                : heroCta
            }`}
          >
            Sign in
          </Link>
          <button
            type="button"
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 md:hidden ${
              scrolled
                ? "text-primary-800 hover:bg-primary-100/80 dark:text-primary-200 dark:hover:bg-muted"
                : isDark
                  ? "text-white hover:bg-white/10"
                  : "text-primary-900 hover:bg-primary-100/70"
            }`}
            aria-expanded={mobileOpen}
            aria-controls={panelId}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            {mobileOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id={panelId}
          className="border-t border-primary-100 bg-white/98 backdrop-blur-lg dark:border-border dark:bg-surface/98 md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className="flex min-h-[48px] items-center rounded-lg px-3 py-3 text-base font-medium text-primary-800 hover:bg-primary-50 dark:text-primary-100 dark:hover:bg-muted"
              >
                {label}
              </a>
            ))}
            <a
              href="#quote"
              onClick={closeMobile}
              className="btn-marketing flex min-h-[48px] items-center justify-center rounded-lg px-3 text-center text-sm font-bold text-white"
            >
              Get Quote
            </a>
            <div className="border-t border-primary-100 pt-4 dark:border-border">
              <Link
                to="/login"
                onClick={closeMobile}
                className="flex min-h-[48px] items-center justify-center rounded-lg bg-primary-600 px-3 text-center text-sm font-semibold text-white hover:bg-primary-700"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
