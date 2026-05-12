import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, type CurrencyCode } from "../context/CurrencyContext";

export function CurrencySwitcher({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const baseStyle =
    variant === "dark"
      ? "border-white/20 text-white hover:bg-white/10"
      : "border-border text-surface-foreground hover:bg-muted";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors duration-200 ${baseStyle}`}
      >
        {currency.symbol} {currency.code}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-lg border border-border bg-surface shadow-lg z-50 overflow-hidden">
          {allCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code as CurrencyCode); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 ${
                c.code === currency.code
                  ? "bg-primary-50 text-primary-700 font-semibold"
                  : "text-surface-foreground hover:bg-muted"
              }`}
            >
              <span className="w-6 text-center font-semibold">{c.symbol}</span>
              <span>{c.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
