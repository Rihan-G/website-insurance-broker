import { X, Download, FileText } from "lucide-react";
import type { InsuranceTemplate } from "../lib/insuranceTemplates";
import { insuranceTemplateDownloadUrl } from "../lib/insuranceTemplates";

export function TemplatePreviewModal({
  template,
  onClose,
}: {
  template: InsuranceTemplate;
  onClose: () => void;
}) {
  const href = insuranceTemplateDownloadUrl(template.fileName);
  const isExcel = template.fileName.endsWith(".xlsx");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-label={`Preview ${template.title}`}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <FileText className="h-8 w-8 text-primary-600" aria-hidden />
            <div>
              <h2 className="text-lg font-bold text-surface-foreground">{template.title}</h2>
              <p className="text-sm text-muted-foreground">{template.productLine}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{template.description}</p>
        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          {isExcel
            ? "Excel workbook — download to open in Microsoft Excel or LibreOffice."
            : "Word document — download to open in Microsoft Word. In-browser preview for .doc files is not available."}
          <p className="mt-2 font-mono text-xs">{template.fileName}</p>
        </div>
        <a
          href={href}
          download={template.fileName}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Download className="h-4 w-4" /> Download template
        </a>
      </div>
    </div>
  );
}
