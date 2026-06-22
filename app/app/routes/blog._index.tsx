import { Link } from "react-router";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { blogArticles } from "~/lib/blogArticles";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/blog._index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Insights — ${COMPANY_NAME}` },
    { name: "description", content: "Insurance tips for Mauritius households and businesses." },
  ];
}

export default function BlogIndex() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Insights</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Practical guidance from our brokers — not formal advice.</p>
        <div className="mt-10 space-y-6">
          {blogArticles.map((a) => (
            <article key={a.slug} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{a.category}</p>
              <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                <Link to={`/blog/${a.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">{a.title}</Link>
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a.excerpt}</p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </article>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
