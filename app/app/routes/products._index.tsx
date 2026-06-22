import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { marketingProducts } from "~/lib/marketingProducts";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/products._index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Insurance Products — ${COMPANY_NAME}` },
    { name: "description", content: "Motor, home, life, health, travel, and business insurance placed through FSC-licensed brokers in Mauritius." },
  ];
}

export default function ProductsIndex() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Insurance products</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Compare lines of business and speak to a broker for firm terms from leading Mauritian insurers.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marketingProducts.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.slug}
                to={`/products/${p.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
              >
                <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" aria-hidden />
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{p.name}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{p.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 dark:text-blue-400">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingLayout>
  );
}
