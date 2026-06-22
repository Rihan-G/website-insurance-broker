import { useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";
import { COMPANY_NAME_SHORT } from "~/lib/branding";

const links = [
  { to: "/products", label: "Products" },
  { to: "/compare", label: "Compare" },
  { to: "/claims-guide", label: "Claims" },
  { to: "/checklists", label: "Checklists" },
  { to: "/blog", label: "Insights" },
  { to: "/about", label: "About" },
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200/90 bg-white/92 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/96">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="truncate text-lg font-bold text-blue-900 dark:text-blue-50">{COMPANY_NAME_SHORT}</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:inline-flex">
            Sign in
          </Link>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-700 md:hidden dark:text-gray-300"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-medium text-gray-800 dark:text-gray-100">
              {label}
            </Link>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="mt-2 block rounded-lg bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white">
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}
