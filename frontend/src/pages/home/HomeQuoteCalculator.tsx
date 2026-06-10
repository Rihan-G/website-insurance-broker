import { useState } from "react";
import { Link } from "react-router-dom";
import { Calculator, ChevronDown, ArrowRight, Send, FileDown } from "lucide-react";
import { generateQuoteEstimatePdf } from "../../lib/pdfService";
import toast from "react-hot-toast";
import {
  type QuoteCurrency,
  QUOTE_CURRENCIES,
  convertToMur,
  convertFromMur,
  formatInCurrency,
  currencyHint,
} from "../../lib/currency";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/db";

type HomePolicy = "motor" | "home" | "life" | "health";

const DEMO_HOME_QUOTES_KEY = "demo_home_quote_estimates_v1";

const coverageAnchors: Record<HomePolicy, Array<{ covMur: number; monthlyMur: number }>> = {
  motor: [
    { covMur: 250_000, monthlyMur: 3200 },
    { covMur: 500_000, monthlyMur: 5400 },
    { covMur: 1_000_000, monthlyMur: 8700 },
  ],
  home: [
    { covMur: 250_000, monthlyMur: 2100 },
    { covMur: 500_000, monthlyMur: 3800 },
    { covMur: 1_000_000, monthlyMur: 6500 },
  ],
  life: [
    { covMur: 250_000, monthlyMur: 1800 },
    { covMur: 500_000, monthlyMur: 3200 },
    { covMur: 1_000_000, monthlyMur: 5900 },
  ],
  health: [
    { covMur: 250_000, monthlyMur: 2800 },
    { covMur: 500_000, monthlyMur: 4600 },
    { covMur: 1_000_000, monthlyMur: 7200 },
  ],
};

function interpolateMonthlyMur(policy: HomePolicy, coverageMur: number): number {
  const pts = coverageAnchors[policy];
  if (coverageMur <= 0) return 0;
  const first = pts[0]!;
  if (coverageMur <= first.covMur) return (first.monthlyMur / first.covMur) * coverageMur;
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i]!;
    if (coverageMur <= cur.covMur) {
      const prev = pts[i - 1]!;
      return (
        prev.monthlyMur +
        ((coverageMur - prev.covMur) / (cur.covMur - prev.covMur)) * (cur.monthlyMur - prev.monthlyMur)
      );
    }
  }
  const penultimate = pts[pts.length - 2]!;
  const last = pts[pts.length - 1]!;
  const slope = (last.monthlyMur - penultimate.monthlyMur) / (last.covMur - penultimate.covMur);
  return last.monthlyMur + (coverageMur - last.covMur) * slope;
}

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

function pushDemoHomeQuote(payload: Record<string, unknown>) {
  try {
    const raw = sessionStorage.getItem(DEMO_HOME_QUOTES_KEY);
    const prev = raw ? (JSON.parse(raw) as unknown[]) : [];
    prev.unshift({ savedAt: new Date().toISOString(), ...payload });
    sessionStorage.setItem(DEMO_HOME_QUOTES_KEY, JSON.stringify(prev.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export function HomeQuoteCalculator() {
  const { user, demoAuthActive } = useAuth();
  const [policyType, setPolicyType] = useState<HomePolicy>("motor");
  const [currency, setCurrency] = useState<QuoteCurrency>("MUR");
  const [coverageInput, setCoverageInput] = useState("500000");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const coverageNum = parseFloat(coverageInput.replace(/,/g, "") || "0");
  const coverageInMur = Number.isFinite(coverageNum) ? convertToMur(coverageNum, currency) : 0;
  const monthlyMur = interpolateMonthlyMur(policyType, coverageInMur);
  const monthlyDisplay = formatInCurrency(convertFromMur(monthlyMur, currency), currency);
  const sliderMur =
    Number.isFinite(coverageInMur) && coverageInMur > 0
      ? Math.min(2_000_000, Math.max(50_000, coverageInMur))
      : 500_000;

  const annualMurEst = monthlyMur * 12;
  /** Demo auth bypasses remote writes; otherwise we use the anon client (guests can insert per quotes RLS). */
  const persistToDatabase = !demoAuthActive;

  const submitEstimate = async () => {
    if (!Number.isFinite(coverageInMur) || coverageInMur <= 0) {
      toast.error("Enter a coverage amount first.");
      return;
    }
    if (!user?.id && !leadEmail.trim()) {
      toast.error("Add your email so we can follow up, or sign in.");
      return;
    }
    if (leadEmail.trim() && !looksLikeEmail(leadEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const inputData = {
        source: "home_quick_quote",
        policy_type: policyType,
        coverage_input: coverageInput,
        display_currency: currency,
        coverage_mur: coverageInMur,
        monthly_mur_estimate: monthlyMur,
        lead_email: leadEmail.trim() || null,
        lead_phone: leadPhone.trim() || null,
      };

      if (!persistToDatabase) {
        pushDemoHomeQuote({
          ...inputData,
          client_id: user?.id ?? null,
          annual_mur_estimate: annualMurEst,
        });
        toast.success("Estimate saved locally (demo). Connect Supabase to store leads in the database.");
        return;
      }

      const { error } = await db.quotes().insert({
        client_id: user?.id ?? null,
        product_type: policyType,
        input_data: inputData,
        estimated_premium: annualMurEst,
        status: "draft",
        notes: leadEmail.trim() ? `Lead: ${leadEmail.trim()}${leadPhone.trim() ? ` · ${leadPhone.trim()}` : ""}` : null,
      });
      if (error) {
        toast.error((error as { message?: string }).message ?? "Could not save estimate.");
        return;
      }
      toast.success("Thanks, your estimate is saved. A broker will follow up.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save estimate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="neon-border rounded-2xl bg-surface p-8 shadow-xl dark:shadow-none">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        <h3 className="text-xl font-bold text-surface-foreground">Quick quote estimate</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-foreground mb-1.5">Policy type</label>
          <div className="relative">
            <select
              aria-label="Select policy type"
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value as HomePolicy)}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer transition-colors duration-200"
            >
              <option value="motor">Motor Insurance</option>
              <option value="home">Home Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="health">Health Insurance</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-foreground mb-1.5">Currency</label>
          <div className="relative">
            <select
              aria-label="Select currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as QuoteCurrency)}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer transition-colors duration-200"
            >
              {QUOTE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{currencyHint()}</p>
        </div>

        <div>
          <label htmlFor="home-coverage-custom" className="block text-sm font-medium text-surface-foreground mb-1.5">
            Coverage sum ({currency})
          </label>
          <input
            id="home-coverage-range"
            type="range"
            min={50_000}
            max={2_000_000}
            step={25_000}
            value={sliderMur}
            onChange={(e) => {
              const mur = Number(e.target.value);
              const displayVal = convertFromMur(mur, currency);
              setCoverageInput(String(Math.round(displayVal)));
            }}
            className="mb-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary-600 dark:accent-primary-400"
            aria-valuemin={50_000}
            aria-valuemax={2_000_000}
            aria-valuenow={sliderMur}
            aria-label="Adjust coverage amount"
          />
          <input
            id="home-coverage-custom"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 500000 or 12000"
            value={coverageInput}
            onChange={(e) => setCoverageInput(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
          />
        </div>

        <div className="rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 p-5 text-center">
          <p className="text-sm text-muted-foreground">Estimated monthly premium</p>
          <p className="mt-1 text-3xl font-bold text-primary-700 dark:text-primary-300 transition-[color,opacity] duration-300 ease-out">
            {monthlyDisplay}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">per month *</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Save this estimate</p>
          {!user?.id && (
            <>
              <label className="block text-sm font-medium text-surface-foreground">
                Email <span className="text-danger-600">*</span>
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
              />
            </>
          )}
          <label className="block text-sm font-medium text-surface-foreground">Phone (optional)</label>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="+230 …"
            value={leadPhone}
            onChange={(e) => setLeadPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void submitEstimate()}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer transition-colors duration-200 active:scale-[0.99]"
          >
            <Send className="h-4 w-4" aria-hidden />
            {submitting ? "Saving…" : persistToDatabase ? "Submit estimate to our team" : "Save estimate (demo)"}
          </button>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {persistToDatabase
              ? user?.id
                ? "Stored in your broker workspace (quotes table) under your account."
                : "Stored as a lead in the quotes table (anonymous). Add your email so a broker can reply."
              : "Demo mode stores submissions in this browser only."}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void generateQuoteEstimatePdf({
              policyType,
              coverageAmount: Math.round(convertFromMur(coverageInMur, currency)),
              currency,
              monthlyPremium: Math.round(convertFromMur(monthlyMur, currency)),
              clientEmail: leadEmail.trim() || undefined,
              clientPhone: leadPhone.trim() || undefined,
            })
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-surface-foreground hover:bg-muted"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          Download estimate PDF
        </button>

        <Link
          to="/login"
          className="btn-marketing flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white cursor-pointer transition-transform duration-200 active:scale-[0.99]"
        >
          Get detailed quote
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-xs text-muted-foreground text-center">
          * Indicative estimate only. Final premium depends on individual assessment.
        </p>
      </div>
    </div>
  );
}
