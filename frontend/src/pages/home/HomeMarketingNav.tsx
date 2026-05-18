import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Menu, X } from "lucide-react";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CurrencySwitcher } from "../../components/CurrencySwitcher";
import { COMPANY_NAME_SHORT } from "../../lib/branding";

const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#products", label: "Products" },
  { href: "#quote", label: "Get Quote" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
] as const;

export function HomeMarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const panelId = useId();

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

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary-100 dark:border-border bg-white/80 dark:bg-surface/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <ShieldCheck className="h-7 w-7 shrink-0 text-accent-500" aria-hidden />
          <span className="truncate text-lg font-bold text-primary-900 dark:text-primary-50 tracking-tight">
            {COMPANY_NAME_SHORT}
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium text-primary-700 dark:text-primary-200 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CurrencySwitcher />
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-muted cursor-pointer transition-colors duration-200 sm:block"
          >
            Sign In
          </Link>
          <Link
            to="/login"
            className="rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200 sm:px-4"
          >
            Client Portal
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-primary-800 dark:text-primary-200 hover:bg-primary-100/80 dark:hover:bg-muted md:hidden"
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
          className="border-t border-primary-100 bg-white/95 backdrop-blur-lg dark:border-border dark:bg-surface/95 md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className="block rounded-lg px-3 py-3 text-base font-medium text-primary-800 hover:bg-primary-50 dark:text-primary-100 dark:hover:bg-muted"
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col gap-2 border-t border-primary-100 pt-4 dark:border-border">
              <Link
                to="/login"
                onClick={closeMobile}
                className="block rounded-lg border border-border px-3 py-3 text-center text-sm font-semibold text-primary-800 dark:text-primary-100"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                onClick={closeMobile}
                className="block rounded-lg bg-primary-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-primary-700"
              >
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
