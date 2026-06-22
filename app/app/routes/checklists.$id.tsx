import { useState, useEffect } from "react";
import { Link, redirect } from "react-router";
import { CheckSquare, Square, Download } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { documentChecklists, loadChecklistProgress, saveChecklistProgress } from "~/lib/documentChecklists";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/checklists.$id";

export async function loader({ params }: Route.LoaderArgs) {
  const checklist = params.id ? documentChecklists.find((c) => c.id === params.id) : undefined;
  if (!checklist) throw redirect("/checklists");
  return { checklist };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: `Document Checklist — ${COMPANY_NAME}` },
    { name: "description", content: data?.checklist.description ?? "Track documents needed for insurance placement." },
  ];
}

export default function ChecklistDetail({ loaderData }: Route.ComponentProps) {
  const { checklist } = loaderData;
  const [done, setDone] = useState<Set<string>>(() => loadChecklistProgress(checklist.id));

  useEffect(() => {
    saveChecklistProgress(checklist.id, done);
  }, [checklist.id, done]);

  const pct = checklist.items.length ? Math.round((done.size / checklist.items.length) * 100) : 0;

  const toggle = (itemId: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  };

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <Link to="/checklists" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← All checklists
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{checklist.title}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{checklist.description}</p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">{pct}% complete — saved on this device</p>
        <ul className="mt-8 space-y-3">
          {checklist.items.map((item) => {
            const checked = done.has(item.id);
            return (
              <li key={item.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <button type="button" onClick={() => toggle(item.id)} className="mt-0.5 shrink-0 text-blue-600" aria-pressed={checked}>
                  {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-gray-400" />}
                </button>
                <div className="min-w-0 flex-1">
                  <span className={checked ? "text-gray-400 line-through" : "text-gray-900 dark:text-white"}>{item.label}</span>
                  {item.templateUrl && (
                    <a href={item.templateUrl} download className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                      <Download className="h-3.5 w-3.5" /> Download template
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </MarketingLayout>
  );
}
