import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "../BrandLogo";
import { ThemeToggle } from "../ThemeToggle";
import { CurrencySwitcher } from "../CurrencySwitcher";
import { COMPANY_NAME_SHORT } from "../../lib/branding";

const links = [
  { to: "/#platform", label: "Platform" },
  { to: "/products", label: "Products" },
  { to: "/compare", label: "Compare" },
  { to: "/claims-guide", label: "Claims" },
  { to: "/checklists", label: "Checklists" },
  { to: "/blog", label: "Insights" },
  { to: "/about", label: "About" },
  { to: "/#quote", label: "Quote" },
] as const;

export function MarketingSubNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-primary-200/90 bg-white/92 shadow-sm backdrop-blur-xl dark:border-border dark:bg-surface/96">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo className="h-9 shrink-0" imageClassName="h-9 w-auto max-w-[9.5rem] object-contain" label="Sindicom Brokers" />
          <span className="truncate text-lg font-bold text-primary-900 dark:text-primary-50">{COMPANY_NAME_SHORT}</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className="text-primary-800 hover:text-primary-950 dark:text-primary-200 dark:hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <CurrencySwitcher />
          <ThemeToggle />
          <Link to="/login" className="hidden rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 sm:inline-flex">
            Sign in
          </Link>
          <button type="button" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-primary-800 md:hidden dark:text-primary-200" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-primary-800 dark:text-primary-100">
              {label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-primary-600 px-3 py-3 text-center text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}
