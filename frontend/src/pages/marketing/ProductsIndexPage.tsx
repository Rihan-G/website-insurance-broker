import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { marketingProducts } from "../../lib/marketingProducts";
import { COMPANY_NAME } from "../../lib/branding";

export function ProductsIndexPage() {
  return (
    <MarketingPageLayout
      meta={{
        title: `Insurance Products — ${COMPANY_NAME}`,
        description: "Motor, home, life, health, travel, and business insurance placed through FSC-licensed brokers in Mauritius.",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">Insurance products</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Compare lines of business and speak to a broker for firm terms from leading Mauritian insurers.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marketingProducts.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:hover:border-primary-700"
              >
                <Icon className="h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden />
                <h2 className="mt-4 text-xl font-bold text-surface-foreground">{p.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 dark:text-primary-400">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
