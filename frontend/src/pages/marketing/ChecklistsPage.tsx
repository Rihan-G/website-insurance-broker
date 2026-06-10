import { Link, useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckSquare, Download, Square } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import {
  documentChecklists,
  loadChecklistProgress,
  saveChecklistProgress,
} from "../../lib/documentChecklists";
import { COMPANY_NAME } from "../../lib/branding";

function ChecklistDetail({ id }: { id: string }) {
  const checklist = documentChecklists.find((c) => c.id === id);
  const [done, setDone] = useState<Set<string>>(() => loadChecklistProgress(id));

  useEffect(() => {
    saveChecklistProgress(id, done);
  }, [id, done]);

  if (!checklist) return <Navigate to="/checklists" replace />;

  const toggle = (itemId: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const pct = checklist.items.length ? Math.round((done.size / checklist.items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
      <Link to="/checklists" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
        ← All checklists
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-surface-foreground">{checklist.title}</h1>
      <p className="mt-2 text-muted-foreground">{checklist.description}</p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{pct}% complete — saved on this device</p>
      <ul className="mt-8 space-y-3">
        {checklist.items.map((item) => {
          const checked = done.has(item.id);
          return (
            <li key={item.id} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
              <button type="button" onClick={() => toggle(item.id)} className="mt-0.5 shrink-0 text-primary-600" aria-pressed={checked}>
                {checked ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="min-w-0 flex-1">
                <span className={checked ? "text-muted-foreground line-through" : "text-surface-foreground"}>{item.label}</span>
                {item.templateUrl && (
                  <a href={item.templateUrl} download className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                    <Download className="h-3.5 w-3.5" /> Download template
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ChecklistsPage() {
  const { id } = useParams<{ id?: string }>();

  if (id) {
    return (
      <MarketingPageLayout
        meta={{
          title: `Document Checklist — ${COMPANY_NAME}`,
          description: "Track documents needed for insurance placement and claims.",
        }}
      >
        <ChecklistDetail id={id} />
      </MarketingPageLayout>
    );
  }

  return (
    <MarketingPageLayout
      meta={{
        title: `Document Checklists — ${COMPANY_NAME}`,
        description: "Interactive checklists for motor, travel, and claims documentation.",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">Document checklists</h1>
        <p className="mt-4 text-muted-foreground">Tick items as you gather them. Progress saves in your browser.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {documentChecklists.map((c) => (
            <Link
              key={c.id}
              to={`/checklists/${c.id}`}
              className="rounded-xl border border-border bg-surface p-6 hover:border-primary-300 dark:hover:border-primary-700"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">{c.productLine}</p>
              <h2 className="mt-2 text-lg font-bold text-surface-foreground">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.items.length} items</p>
            </Link>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
