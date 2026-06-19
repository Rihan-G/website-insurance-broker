import { useState, useRef } from "react";
import { FileText, Upload, Download, Trash2, Search, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

type RateSheet = {
  id: string;
  insurer: string;
  product: string;
  version: string;
  uploadedAt: Date;
  uploadedBy: string;
  fileSize: string;
  fileName: string;
};

const DEMO_SHEETS: RateSheet[] = [
  { id: "s1", insurer: "MUA Ltd", product: "Motor", version: "2024-Q4", uploadedAt: new Date(2024, 9, 1), uploadedBy: "Jean Admin", fileSize: "1.2 MB", fileName: "MUA_Motor_2024Q4.pdf" },
  { id: "s2", insurer: "Swan Insurance", product: "Home", version: "2024-Q3", uploadedAt: new Date(2024, 6, 1), uploadedBy: "Jean Admin", fileSize: "890 KB", fileName: "Swan_Home_2024Q3.pdf" },
  { id: "s3", insurer: "Jubilee Insurance", product: "Health", version: "2025-Q1", uploadedAt: new Date(2025, 0, 15), uploadedBy: "Marie Broker", fileSize: "2.1 MB", fileName: "Jubilee_Health_2025Q1.pdf" },
  { id: "s4", insurer: "Mauritius Union", product: "Business", version: "2024-H2", uploadedAt: new Date(2024, 6, 1), uploadedBy: "Marie Broker", fileSize: "3.4 MB", fileName: "MU_Business_2024H2.pdf" },
  { id: "s5", insurer: "New India Assurance", product: "Travel", version: "2024-Annual", uploadedAt: new Date(2024, 0, 5), uploadedBy: "Jean Admin", fileSize: "560 KB", fileName: "NIA_Travel_2024Annual.pdf" },
];

const INSURERS = ["All", "MUA Ltd", "Swan Insurance", "Jubilee Insurance", "Mauritius Union", "New India Assurance", "Sicom", "Eagle Insurance", "Allianz"];

export function RateSheetsPage() {
  const [sheets, setSheets] = useState<RateSheet[]>(DEMO_SHEETS);
  const [search, setSearch] = useState("");
  const [filterInsurer, setFilterInsurer] = useState("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = sheets.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || s.insurer.toLowerCase().includes(q) || s.product.toLowerCase().includes(q) || s.version.toLowerCase().includes(q);
    const matchesInsurer = filterInsurer === "All" || s.insurer === filterInsurer;
    return matchesSearch && matchesInsurer;
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newSheet: RateSheet = {
      id: `uploaded-${Date.now()}`,
      insurer: "Unknown",
      product: "General",
      version: format(new Date(), "yyyy-MM"),
      uploadedAt: new Date(),
      uploadedBy: "You",
      fileSize: file.size < 1024 * 1024 ? `${Math.round(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      fileName: file.name,
    };
    setSheets((prev) => [newSheet, ...prev]);
    toast.success(`${file.name} uploaded`);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = (id: string, name: string) => {
    setSheets((prev) => prev.filter((s) => s.id !== id));
    toast.success(`${name} removed`);
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Broker tools</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Rate sheet repository</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload and version insurer rate sheets. Visible to staff only.</p>
        </div>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors">
          <Upload className="h-4 w-4" aria-hidden />
          Upload rate sheet
          <input ref={fileRef} type="file" accept=".pdf,.xlsx,.csv" className="sr-only" onChange={handleUpload} />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="Search insurer, product, version…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <select
          value={filterInsurer}
          onChange={(e) => setFilterInsurer(e.target.value)}
          className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {INSURERS.map((ins) => <option key={ins}>{ins}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border/80 bg-muted/20 px-4 py-3">
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{visible.length} sheet{visible.length !== 1 ? "s" : ""}</p>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-semibold text-surface-foreground">No rate sheets found</p>
            <p className="text-xs text-muted-foreground">Upload a PDF or spreadsheet to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {visible.map((s) => (
              <li key={s.id} className="flex items-start gap-4 px-4 py-4 hover:bg-muted/20 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-bold text-surface-foreground">{s.insurer}</p>
                    <span className="rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:border-primary-700/40 dark:bg-primary-950/30 dark:text-primary-300">
                      {s.product}
                    </span>
                    <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      v{s.version}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{s.fileName} · {s.fileSize}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                    <Calendar className="h-3 w-3" aria-hidden />
                    {format(s.uploadedAt, "dd MMM yyyy")} by {s.uploadedBy}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toast("Download coming once Supabase Storage is connected", { icon: "📥" })}
                    className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-primary-600 transition-colors"
                    aria-label={`Download ${s.fileName}`}
                  >
                    <Download className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id, s.fileName)}
                    className="rounded-lg border border-border bg-surface p-2 text-muted-foreground hover:text-danger-600 transition-colors"
                    aria-label={`Delete ${s.fileName}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
