import { Download, FileText } from "lucide-react";
import {
  insuranceTemplateCategoryLabel,
  insuranceTemplateDownloadUrl,
  insuranceTemplates,
  type InsuranceTemplateCategory,
} from "../lib/insuranceTemplates";

const categoryOrder: InsuranceTemplateCategory[] = [
  "placing",
  "fleet",
  "cancellation",
  "letterhead",
];

export function BrokerTemplateDownloads() {
  return (
    <section
      className="mb-8 rounded-2xl border border-border bg-surface p-5 shadow-sm"
      aria-labelledby="broker-templates-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="broker-templates-heading" className="text-lg font-bold text-surface-foreground">
            Broker Word templates
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download your insurance letterheads and forms. Copy files from your Word folder into{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">frontend/public/templates/</code> to update
            what appears here.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {categoryOrder.map((category) => {
          const items = insuranceTemplates.filter((t) => t.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {insuranceTemplateCategoryLabel[category]}
              </h3>
              <ul className="mt-2 space-y-2">
                {items.map((template) => (
                  <TemplateRow key={template.id} template={template} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TemplateRow({ template }: { template: (typeof insuranceTemplates)[number] }) {
  const href = insuranceTemplateDownloadUrl(template.fileName);
  return (
    <li>
      <a
        href={href}
        download={template.fileName}
        className="group flex items-start gap-3 rounded-xl border border-border bg-background/60 px-3 py-2.5 transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:hover:border-primary-700 dark:hover:bg-primary-950/30"
      >
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-surface-foreground group-hover:text-primary-800 dark:group-hover:text-primary-100">
            {template.title}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-primary-700/90 dark:text-primary-300/90">
            {template.productLine}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">{template.description}</span>
        </span>
        <Download className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary-600" aria-hidden />
      </a>
    </li>
  );
}
