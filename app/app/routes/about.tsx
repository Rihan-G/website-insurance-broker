import { Link } from "react-router";
import { Award, ShieldCheck, Users } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { marketingAboutCopy, marketingProducts } from "~/lib/marketingProducts";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/about";

export function meta(_: Route.MetaArgs) {
  return [
    { title: `About — ${COMPANY_NAME}` },
    { name: "description", content: marketingAboutCopy.intro },
  ];
}

export default function About() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{marketingAboutCopy.headline}</h1>
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">{marketingAboutCopy.intro}</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {marketingAboutCopy.values.map((v) => (
            <div key={v.title} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden />
              <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">{v.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{v.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <Award className="h-10 w-10 text-green-600" aria-hidden />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">FSC Mauritius</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Licensed insurance broker — regulatory oversight and client protection frameworks apply.</p>
            </div>
          </div>
        </div>
        <div className="mt-16">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Users className="h-7 w-7" aria-hidden /> What we place
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {marketingProducts.map((p) => (
              <li key={p.slug}>
                <Link to={`/products/${p.slug}`} className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-12 text-center">
          <Link to="/#quote" className="inline-flex rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700">
            Get a quote
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
