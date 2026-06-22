import { Link, redirect } from "react-router";
import { CheckCircle } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { getProductBySlug } from "~/lib/marketingProducts";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/products.$slug";

export async function loader({ params }: Route.LoaderArgs) {
  const product = params.slug ? getProductBySlug(params.slug) : undefined;
  if (!product) throw redirect("/products");
  return { product };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data) return [{ title: `Products — ${COMPANY_NAME}` }];
  return [
    { title: `${data.product.name} — ${COMPANY_NAME}` },
    { name: "description", content: data.product.summary },
  ];
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const Icon = product.icon;

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <Link to="/products" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← All products
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/50">
            <Icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{product.tagline}</p>
          </div>
        </div>
        <p className="mt-8 text-gray-600 dark:text-gray-400">{product.summary}</p>
        <ul className="mt-8 space-y-3">
          {product.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-sm text-gray-900 dark:text-white">
              <CheckCircle className="h-5 w-5 shrink-0 text-green-600" aria-hidden />
              {h}
            </li>
          ))}
        </ul>
        {product.faq && product.faq.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Common questions</h2>
            <dl className="mt-4 space-y-4">
              {product.faq.map((f) => (
                <div key={f.q} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <dt className="font-semibold text-gray-900 dark:text-white">{f.q}</dt>
                  <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <Link to="/#quote" className="mt-12 inline-flex rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700">
          Get a quote
        </Link>
      </div>
    </MarketingLayout>
  );
}
