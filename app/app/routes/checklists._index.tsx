import { Link } from "react-router";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { documentChecklists } from "~/lib/documentChecklists";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/checklists._index";

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Document Checklists — ${COMPANY_NAME}` },
    { name: "description", content: "Interactive checklists for motor, travel, and claims documentation." },
  ];
}

export default function ChecklistsIndex() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Document checklists</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Tick items as you gather them. Progress saves in your browser.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {documentChecklists.map((c) => (
            <Link
              key={c.id}
              to={`/checklists/${c.id}`}
              className="rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{c.productLine}</p>
              <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{c.title}</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{c.description}</p>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">{c.items.length} items</p>
            </Link>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
