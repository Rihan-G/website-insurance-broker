import { useState } from "react";
import { Calculator, Car, Home, Heart, Plane, Briefcase, HeartPulse, ChevronRight, Download } from "lucide-react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  type QuoteCurrency,
  QUOTE_CURRENCIES,
  convertToMur,
  convertFromMur,
  formatInCurrency,
  currencyHint,
} from "../lib/currency";

type ProductType = "motor" | "home" | "life" | "health" | "travel" | "business";

interface QuoteResult {
  base: number;
  tax: number;
  total: number;
  breakdown: Array<{ label: string; amount: number }>;
}

const products: Array<{ id: ProductType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
  { id: "motor", label: "Motor Insurance", icon: Car, color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800" },
  { id: "home", label: "Home Insurance", icon: Home, color: "bg-green-50 text-green-600 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800" },
  { id: "life", label: "Life Insurance", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800" },
  { id: "health", label: "Health Insurance", icon: HeartPulse, color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800" },
  { id: "travel", label: "Travel Insurance", icon: Plane, color: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800" },
  { id: "business", label: "Business Insurance", icon: Briefcase, color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" },
];

function calcMotor(v: Record<string, string>): QuoteResult {
  const value = parseFloat(v.vehicleValue || "0");
  const age = parseInt(v.driverAge || "30", 10);
  const years = parseInt(v.yearsNoClain || "0", 10);
  const base = value * 0.035;
  const ageAdj = age < 25 ? base * 0.2 : age > 65 ? base * 0.1 : 0;
  const ncd = Math.min(years * 0.05, 0.5);
  const afterNcd = (base + ageAdj) * (1 - ncd);
  const tax = afterNcd * 0.15;
  return {
    base: afterNcd,
    tax,
    total: afterNcd + tax,
    breakdown: [
      { label: "Base Premium", amount: base },
      { label: "Age Loading", amount: ageAdj },
      { label: `NCD Discount (${Math.round(ncd * 100)}%)`, amount: -(base + ageAdj) * ncd },
      { label: "VAT (15%)", amount: tax },
    ],
  };
}

function calcHome(v: Record<string, string>): QuoteResult {
  const value = parseFloat(v.propertyValue || "0");
  const contents = parseFloat(v.contentsValue || "0");
  const base = value * 0.003 + contents * 0.005;
  const tax = base * 0.15;
  return {
    base,
    tax,
    total: base + tax,
    breakdown: [
      { label: "Building Premium", amount: value * 0.003 },
      { label: "Contents Premium", amount: contents * 0.005 },
      { label: "VAT (15%)", amount: tax },
    ],
  };
}

function calcLife(v: Record<string, string>): QuoteResult {
  const sum = parseFloat(v.sumAssured || "0");
  const age = parseInt(v.age || "30", 10);
  const smoker = v.smoker === "yes";
  const rate = 0.002 + (age - 20) * 0.0002 + (smoker ? 0.0015 : 0);
  const base = sum * rate;
  const tax = base * 0.1;
  return {
    base,
    tax,
    total: base + tax,
    breakdown: [
      { label: "Life Premium", amount: base },
      { label: "Smoker Loading", amount: smoker ? base * 0.3 : 0 },
      { label: "Stamp Duty (10%)", amount: tax },
    ],
  };
}

function calcHealth(v: Record<string, string>): QuoteResult {
  const members = parseInt(v.members || "1", 10);
  const plan = v.plan || "basic";
  const planRates: Record<string, number> = { basic: 18000, standard: 32000, premium: 55000 };
  const base = (planRates[plan] ?? 18000) * members;
  const tax = base * 0.15;
  return {
    base,
    tax,
    total: base + tax,
    breakdown: [
      { label: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan × ${members}`, amount: base },
      { label: "VAT (15%)", amount: tax },
    ],
  };
}

function calcTravel(v: Record<string, string>): QuoteResult {
  const days = parseInt(v.days || "7", 10);
  const dest = v.destination || "regional";
  const travellers = parseInt(v.travellers || "1", 10);
  const ratePerDay: Record<string, number> = { regional: 180, europe: 290, worldwide: 420 };
  const base = (ratePerDay[dest] ?? 180) * days * travellers;
  const tax = base * 0.15;
  return {
    base,
    tax,
    total: base + tax,
    breakdown: [
      { label: `${dest} × ${days} days × ${travellers} travellers`, amount: base },
      { label: "VAT (15%)", amount: tax },
    ],
  };
}

function calcBusiness(v: Record<string, string>): QuoteResult {
  const revenue = parseFloat(v.annualRevenue || "0");
  const employees = parseInt(v.employees || "1", 10);
  const base = revenue * 0.008 + employees * 2500;
  const tax = base * 0.15;
  return {
    base,
    tax,
    total: base + tax,
    breakdown: [
      { label: "Liability Premium", amount: revenue * 0.008 },
      { label: "Workers Comp", amount: employees * 2500 },
      { label: "VAT (15%)", amount: tax },
    ],
  };
}

const calculators: Record<ProductType, (v: Record<string, string>) => QuoteResult> = {
  motor: calcMotor,
  home: calcHome,
  life: calcLife,
  health: calcHealth,
  travel: calcTravel,
  business: calcBusiness,
};

/** Field keys whose values are monetary amounts typed in the selected display currency (converted to MUR for pricing). */
const moneyFieldKeys: Record<ProductType, string[]> = {
  motor: ["vehicleValue"],
  home: ["propertyValue", "contentsValue"],
  life: ["sumAssured"],
  health: [],
  travel: [],
  business: ["annualRevenue"],
};

const fields: Record<ProductType, Array<{ key: string; label: string; type: string; options?: string[]; placeholder?: string }>> = {
  motor: [
    { key: "vehicleValue", label: "Vehicle value", type: "number", placeholder: "500000" },
    { key: "driverAge", label: "Driver age", type: "number", placeholder: "30" },
    { key: "yearsNoClain", label: "Years no claims", type: "number", placeholder: "3" },
    { key: "usage", label: "Vehicle usage", type: "select", options: ["Private", "Commercial", "Hire"] },
  ],
  home: [
    { key: "propertyValue", label: "Property value", type: "number", placeholder: "3000000" },
    { key: "contentsValue", label: "Contents value", type: "number", placeholder: "500000" },
    { key: "propertyType", label: "Property type", type: "select", options: ["House", "Apartment", "Villa"] },
  ],
  life: [
    { key: "sumAssured", label: "Sum assured", type: "number", placeholder: "2000000" },
    { key: "age", label: "Age", type: "number", placeholder: "35" },
    { key: "term", label: "Policy term (years)", type: "number", placeholder: "20" },
    { key: "smoker", label: "Smoker?", type: "select", options: ["no", "yes"] },
  ],
  health: [
    { key: "members", label: "Family members", type: "number", placeholder: "2" },
    { key: "plan", label: "Plan", type: "select", options: ["basic", "standard", "premium"] },
    { key: "age", label: "Oldest member age", type: "number", placeholder: "40" },
  ],
  travel: [
    { key: "destination", label: "Destination", type: "select", options: ["regional", "europe", "worldwide"] },
    { key: "days", label: "Trip duration (days)", type: "number", placeholder: "7" },
    { key: "travellers", label: "Travellers", type: "number", placeholder: "2" },
  ],
  business: [
    { key: "annualRevenue", label: "Annual revenue", type: "number", placeholder: "5000000" },
    { key: "employees", label: "Number of employees", type: "number", placeholder: "10" },
    { key: "industry", label: "Industry", type: "select", options: ["Retail", "Services", "Manufacturing", "Hospitality"] },
  ],
};

function toMurValues(product: ProductType, values: Record<string, string>, currency: QuoteCurrency): Record<string, string> {
  const keys = moneyFieldKeys[product];
  if (keys.length === 0 || currency === "MUR") return { ...values };
  const out = { ...values };
  for (const key of keys) {
    const raw = values[key];
    if (raw === undefined || raw === "") continue;
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) continue;
    out[key] = String(convertToMur(n, currency));
  }
  return out;
}

function fieldLabel(product: ProductType, f: { key: string; label: string }, currency: QuoteCurrency): string {
  if (moneyFieldKeys[product].includes(f.key)) {
    return `${f.label} (${currency})`;
  }
  return f.label;
}

export function QuoteCalculatorPage() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [currency, setCurrency] = useState<QuoteCurrency>("MUR");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [saving, setSaving] = useState(false);

  const calculate = () => {
    if (!selectedProduct) return;
    const calc = calculators[selectedProduct];
    const murValues = toMurValues(selectedProduct, values, currency);
    setResult(calc(murValues));
  };

  const saveQuote = async () => {
    if (!result || !selectedProduct) return;
    setSaving(true);
    try {
      const { error } = await db.quotes().insert({
        client_id: user?.id ?? null,
        product_type: selectedProduct,
        input_data: { ...values, _displayCurrency: currency },
        estimated_premium: result.total,
        status: "draft",
      });
      if (error) {
        toast.error((error as { message?: string }).message ?? "Failed to save quote.");
        return;
      }
      toast.success("Quote saved successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save quote.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setSelectedProduct(null);
    setValues({});
    setResult(null);
    setCurrency("MUR");
  };

  const fmt = (amountMur: number) => formatInCurrency(convertFromMur(amountMur, currency), currency);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Quote calculator</h2>
        <p className="text-muted-foreground">Instant premium estimate — enter your own figures and switch currency for display</p>
      </div>

      {!selectedProduct ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedProduct(p.id)}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-6 text-left shadow-sm hover:shadow-md hover:border-primary-400/80 dark:hover:border-primary-600 cursor-pointer transition-[box-shadow,border-color,transform] duration-200 ease-out active:scale-[0.99]"
            >
              <div className={`rounded-xl border p-3 ${p.color}`}>
                <p.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-surface-foreground">{p.label}</p>
                <p className="text-sm text-muted-foreground">Get instant quote</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary-600 transition-colors duration-200" />
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button" onClick={reset} className="text-sm text-primary-600 hover:underline cursor-pointer">
                ← Back
              </button>
              <span className="text-muted-foreground">·</span>
              <div className="flex items-center gap-2 min-w-0">
                {(() => {
                  const p = products.find((x) => x.id === selectedProduct);
                  return p ? (
                    <>
                      <p.icon className="h-5 w-5 shrink-0 text-primary-600" />
                      <span className="font-semibold text-surface-foreground truncate">{p.label}</span>
                    </>
                  ) : null;
                })()}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Display & input currency</label>
              <select
                aria-label="Quote currency"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as QuoteCurrency);
                  setResult(null);
                }}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none cursor-pointer"
              >
                {QUOTE_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">{currencyHint()}</p>
            </div>

            <div className="space-y-4">
              {fields[selectedProduct].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-surface-foreground mb-1.5">{fieldLabel(selectedProduct, f, currency)}</label>
                  {f.type === "select" ? (
                    <select
                      aria-label={f.label}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">Select…</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o.toLowerCase()}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={values[f.key] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={calculate}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200 active:scale-[0.99]"
            >
              <Calculator className="h-4 w-4" />
              Calculate premium
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm dark:shadow-none">
            {result ? (
              <div className="space-y-5">
                <h3 className="font-semibold text-surface-foreground">Premium estimate</h3>

                <div className="rounded-xl bg-primary-50 border border-primary-200 p-6 text-center dark:bg-primary-950/45 dark:border-primary-800">
                  <p className="text-sm text-muted-foreground">Estimated annual premium</p>
                  <p className="mt-2 text-4xl font-bold text-primary-700 dark:text-primary-200">{fmt(result.total)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Stored in MUR · Indicative · Subject to underwriting</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</p>
                  {result.breakdown
                    .filter((b) => b.amount !== 0)
                    .map((b) => (
                      <div key={b.label} className="flex items-center justify-between rounded-lg px-4 py-2.5 bg-muted/50 dark:bg-muted/30">
                        <span className="text-sm text-surface-foreground">{b.label}</span>
                        <span className={`text-sm font-medium ${b.amount < 0 ? "text-accent-600 dark:text-accent-400" : "text-surface-foreground"}`}>
                          {b.amount < 0 ? "-" : "+"} {fmt(Math.abs(b.amount))}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={saveQuote}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer transition-colors duration-200 active:scale-[0.99]"
                  >
                    {saving ? "Saving…" : "Save quote"}
                  </button>
                  <button
                    type="button"
                    aria-label="Download quote as PDF"
                    className="rounded-lg border border-border p-2.5 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200 active:scale-[0.98]"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  This is an indicative quote only. Final premium is subject to full underwriting assessment.
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center text-center text-muted-foreground">
                <div>
                  <Calculator className="mx-auto h-12 w-12 mb-4 opacity-30" />
                  <p>Fill in the details and click Calculate to see your premium estimate.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
