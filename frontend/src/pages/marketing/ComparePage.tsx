import { useState } from "react";
import { Check, X, Minus } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { coverageComparisons } from "../../lib/coverageComparison";
import { COMPANY_NAME } from "../../lib/branding";
import { Link } from "react-router-dom";

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-accent-600" aria-label="Included" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-muted-foreground/50" aria-label="Not included" />;
  return <span className="text-xs font-medium text-muted-foreground">{value}</span>;
}

export function ComparePage() {
  const defaultSet = coverageComparisons[0]!;
  const [setId, setSetId] = useState(defaultSet.id);
  const set = coverageComparisons.find((c) => c.id === setId) ?? defaultSet;
  const featureLabels = set.plans[0]?.features ?? [];

  return (
    <MarketingPageLayout
      meta={{
        title: `Compare Cover — ${COMPANY_NAME}`,
        description: "Side-by-side comparison of common motor and home insurance options in Mauritius.",
      }}
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">Compare cover types</h1>
        <p className="mt-4 text-muted-foreground">{set.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {coverageComparisons.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSetId(c.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                setId === c.id ? "bg-primary-600 text-white" : "border border-border bg-surface"
              }`}
            >
              {(c.title.split("—")[0] ?? c.title).trim()}
            </button>
          ))}
        </div>
        <div className="mt-10 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th scope="col" className="p-4 font-semibold text-surface-foreground">Feature</th>
                {set.plans.map((p) => (
                  <th key={p.id} scope="col" className="p-4 font-semibold text-surface-foreground">
                    {p.name}
                    <p className="mt-1 text-xs font-normal text-muted-foreground">{p.bestFor}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureLabels.map((feature, fi) => (
                <tr key={feature.label} className="border-b border-border last:border-0">
                  <td className="p-4 text-surface-foreground">{feature.label}</td>
                  {set.plans.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      <FeatureCell value={p.features[fi]?.included ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
          <Minus className="h-4 w-4 shrink-0" />
          Indicative only — insurer policy wordings prevail. Request a firm quote for your risk.
        </p>
        <Link to="/#quote" className="btn-marketing mt-8 inline-flex rounded-xl px-8 py-3 text-sm font-bold text-white">
          Get a quote
        </Link>
      </div>
    </MarketingPageLayout>
  );
}
