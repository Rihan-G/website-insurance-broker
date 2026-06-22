import { useState } from "react";
import { Link } from "react-router";
import { Calculator, ChevronDown, ArrowRight } from "lucide-react";

type Policy = "motor" | "home" | "life" | "health";

const anchors: Record<Policy, Array<{ cov: number; monthly: number }>> = {
  motor: [{ cov: 250_000, monthly: 3200 }, { cov: 500_000, monthly: 5400 }, { cov: 1_000_000, monthly: 8700 }],
  home:  [{ cov: 250_000, monthly: 2100 }, { cov: 500_000, monthly: 3800 }, { cov: 1_000_000, monthly: 6500 }],
  life:  [{ cov: 250_000, monthly: 1800 }, { cov: 500_000, monthly: 3200 }, { cov: 1_000_000, monthly: 5900 }],
  health:[{ cov: 250_000, monthly: 2800 }, { cov: 500_000, monthly: 4600 }, { cov: 1_000_000, monthly: 7200 }],
};

function estimate(policy: Policy, coverageMur: number): number {
  const pts = anchors[policy];
  if (coverageMur <= 0) return 0;
  const first = pts[0]!;
  if (coverageMur <= first.cov) return (first.monthly / first.cov) * coverageMur;
  for (let i = 1; i < pts.length; i++) {
    const cur = pts[i]!;
    if (coverageMur <= cur.cov) {
      const prev = pts[i - 1]!;
      return prev.monthly + ((coverageMur - prev.cov) / (cur.cov - prev.cov)) * (cur.monthly - prev.monthly);
    }
  }
  const last = pts[pts.length - 1]!;
  return last.monthly * (coverageMur / last.cov);
}

const policyOptions: Array<{ value: Policy; label: string }> = [
  { value: "motor", label: "Motor" },
  { value: "home", label: "Home" },
  { value: "life", label: "Life" },
  { value: "health", label: "Health" },
];

export function HomeQuoteCalculator() {
  const [policy, setPolicy] = useState<Policy>("motor");
  const [coverage, setCoverage] = useState(500_000);
  const monthly = Math.round(estimate(policy, coverage));
  const annual = monthly * 12;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-blue-100 dark:bg-blue-950 p-2.5">
          <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick estimate</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Indicative only — your broker confirms exact terms</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Insurance type</label>
          <div className="relative">
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value as Policy)}
              className="h-11 w-full appearance-none rounded-xl border border-gray-300 bg-white pl-4 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {policyOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Coverage amount</label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              MUR {coverage.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={50_000}
            max={2_000_000}
            step={50_000}
            value={coverage}
            onChange={(e) => setCoverage(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>MUR 50K</span><span>MUR 2M</span>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">Estimated premium</p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                MUR {monthly.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">per month</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-700 dark:text-gray-300">MUR {annual.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">per year</p>
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          Get a detailed quote <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          No obligation · Free · No spam
        </p>
      </div>
    </div>
  );
}
