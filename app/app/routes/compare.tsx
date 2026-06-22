import { useState } from "react";
import { Link } from "react-router";
import { Check, X } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { coverageComparisons } from "~/lib/coverageComparison";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/compare";

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Compare Cover — ${COMPANY_NAME}` },
    { name: "description", content: "Side-by-side comparison of common motor and home insurance options in Mauritius." },
  ];
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-green-600" aria-label="Included" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-gray-400" aria-label="Not included" />;
  return <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{value}</span>;
}

export default function Compare() {
  const defaultSet = coverageComparisons[0]!;
  const [setId, setSetId] = useState(defaultSet.id);
  const set = coverageComparisons.find((c) => c.id === setId) ?? defaultSet;
  const featureLabels = set.plans[0]?.features ?? [];

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Compare cover types</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{set.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {coverageComparisons.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSetId(c.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                setId === c.id ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">Feature</th>
                {set.plans.map((p) => (
                  <th key={p.id} className="px-6 py-4 text-center font-semibold text-gray-700 dark:text-gray-300">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {featureLabels.map((f, i) => (
                <tr key={f.label} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{f.label}</td>
                  {set.plans.map((p) => (
                    <td key={p.id} className="px-6 py-3 text-center">
                      <FeatureCell value={p.features[i]?.included ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800/40 dark:bg-blue-950/20">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Need a firm quote?</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">This comparison is indicative. Insurer wordings vary. Speak to a broker for exact terms.</p>
          <Link to="/login" className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Get a quote
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
