import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Filter, Download, Eye, FileText, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { BrokerTemplateDownloads } from "../components/BrokerTemplateDownloads";
import { useAuth } from "../context/AuthContext";
import {
  DOCUMENT_STATUS_BADGE_CLASS,
  formatBytes,
  labelFromMime,
} from "../lib/documentsDisplay";
import { openDocumentInNewTab, triggerDocumentDownload } from "../lib/documentStorage";
import { exportToCsv } from "../lib/exportService";
import { supabase } from "../lib/supabase";
import { DEMO_IDS } from "../lib/demoAuth";

interface DocumentRow {
  id: string;
  /** Storage object path inside bucket `documents` (undefined in demo/mock rows). */
  filePath?: string | null;
  fileName: string;
  client: string;
  type: string;
  status: "uploaded" | "processing" | "reviewed" | "approved" | "rejected";
  uploadedAt: string;
  size: string;
  confidence: number | null;
}

/** Demo rows: `demoVisibleForClientUserId` limits portal clients to their own folder (staff see all). */
type MockDocumentSource = DocumentRow & { demoVisibleForClientUserId?: string };

const MOCK_DOCUMENT_SOURCES: MockDocumentSource[] = [
  {
    id: "dc-1",
    fileName: "motor_policy_2025.pdf",
    client: "Demo Client",
    type: "Motor Insurance",
    status: "approved",
    uploadedAt: "2025-01-15",
    size: "2.4 MB",
    confidence: 98,
    demoVisibleForClientUserId: DEMO_IDS.CLIENT,
  },
  {
    id: "dc-2",
    fileName: "claims_photos.zip",
    client: "Demo Client",
    type: "Motor Insurance",
    status: "processing",
    uploadedAt: "2025-01-14",
    size: "8.1 MB",
    confidence: 71,
    demoVisibleForClientUserId: DEMO_IDS.CLIENT,
  },
  {
    id: "dc-3",
    fileName: "noc_letter.pdf",
    client: "Demo Client",
    type: "Motor Insurance",
    status: "uploaded",
    uploadedAt: "2025-01-13",
    size: "420 KB",
    confidence: null,
    demoVisibleForClientUserId: DEMO_IDS.CLIENT,
  },
  { id: "s-1", fileName: "motor_policy_2025.pdf", client: "Marie Dupont", type: "Motor Insurance", status: "approved", uploadedAt: "2025-01-15", size: "2.4 MB", confidence: 98 },
  { id: "s-2", fileName: "home_valuation.pdf", client: "Jean-Pierre Ramgoolam", type: "Home Insurance", status: "processing", uploadedAt: "2025-01-15", size: "5.1 MB", confidence: 87 },
  { id: "s-3", fileName: "life_application.pdf", client: "Priya Devi", type: "Life Insurance", status: "reviewed", uploadedAt: "2025-01-14", size: "1.8 MB", confidence: 94 },
  { id: "s-4", fileName: "health_claim_form.pdf", client: "Ahmed Boolell", type: "Health Insurance", status: "uploaded", uploadedAt: "2025-01-14", size: "3.2 MB", confidence: null },
  { id: "s-5", fileName: "travel_docs.pdf", client: "Sophie Chen", type: "Travel Insurance", status: "rejected", uploadedAt: "2025-01-13", size: "892 KB", confidence: 42 },
  { id: "s-6", fileName: "renewal_notice.pdf", client: "Ravi Patel", type: "Motor Insurance", status: "approved", uploadedAt: "2025-01-13", size: "1.1 MB", confidence: 96 },
];

function stripMockMeta(row: MockDocumentSource): DocumentRow {
  const { demoVisibleForClientUserId: _scope, ...rest } = row;
  void _scope;
  return rest;
}

export function DocumentsPage() {
  const { user, demoAuthActive, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [liveRows, setLiveRows] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [storageActionId, setStorageActionId] = useState<string | null>(null);

  useEffect(() => {
    if (demoAuthActive) {
      setLiveRows([]);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      let q = supabase
        .from("documents")
        .select(
          `
          id,
          file_path,
          file_name,
          file_size,
          mime_type,
          status,
          ocr_confidence,
          created_at,
          client:profiles!documents_client_id_fkey ( full_name )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (profile?.role === "client" && user?.id) {
        q = q.eq("client_id", user.id);
      }

      const { data, error } = await q;
      setLoading(false);
      if (cancelled) return;
      if (error) {
        setLiveRows([]);
        toast.error("Could not load documents.");
        return;
      }

      type Row = {
        id: string;
        file_path: string;
        file_name: string;
        file_size: number;
        mime_type: string;
        status: DocumentRow["status"];
        ocr_confidence: number | null;
        created_at: string;
        client: { full_name: string } | null;
      };

      setLiveRows(
        ((data ?? []) as Row[]).map((r) => ({
          id: r.id,
          filePath: r.file_path,
          fileName: r.file_name,
          client: profile?.role === "client" ? "You" : (r.client?.full_name ?? "Client"),
          type: labelFromMime(r.mime_type),
          status: r.status,
          uploadedAt: r.created_at.slice(0, 10),
          size: formatBytes(r.file_size),
          confidence: r.ocr_confidence,
        })),
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [demoAuthActive, profile?.role, user?.id]);

  const rows = useMemo(() => {
    if (!demoAuthActive) return liveRows;
    const role = profile?.role;
    const uid = user?.id;
    if (role === "client" && uid) {
      return MOCK_DOCUMENT_SOURCES.filter((d) => d.demoVisibleForClientUserId === uid).map(stripMockMeta);
    }
    return MOCK_DOCUMENT_SOURCES.map(stripMockMeta);
  }, [demoAuthActive, profile?.role, user?.id, liveRows]);

  const filtered = useMemo(
    () =>
      rows.filter((doc) => {
        const matchesSearch =
          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [rows, searchTerm, statusFilter],
  );

  const handleExportCsv = useCallback(() => {
    if (filtered.length === 0) {
      toast.error("No rows to export. Adjust filters or wait for documents to load.");
      return;
    }
    exportToCsv(
      filtered.map((d) => ({
        File: d.fileName,
        "Storage Path": d.filePath ?? "",
        Client: d.client,
        Type: d.type,
        Status: d.status,
        OCR: d.confidence === null ? "Pending" : String(d.confidence),
        Uploaded: d.uploadedAt,
        Size: d.size,
      })),
      "documents",
    );
    toast.success("CSV downloaded.");
  }, [filtered]);

  const handleView = useCallback(
    async (doc: DocumentRow) => {
      if (demoAuthActive || !doc.filePath) {
        toast.error(demoAuthActive ? "Demo mode — no Storage file." : "This row has no file path.");
        return;
      }
      setStorageActionId(doc.id);
      try {
        await openDocumentInNewTab(doc.filePath);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not open file.");
      } finally {
        setStorageActionId(null);
      }
    },
    [demoAuthActive],
  );

  const handleDownloadRow = useCallback(
    async (doc: DocumentRow) => {
      if (demoAuthActive || !doc.filePath) {
        toast.error(demoAuthActive ? "Demo mode — no Storage file." : "This row has no file path.");
        return;
      }
      setStorageActionId(doc.id);
      try {
        await triggerDocumentDownload(doc.filePath, doc.fileName);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not download file.");
      } finally {
        setStorageActionId(null);
      }
    },
    [demoAuthActive],
  );

  const showBrokerTemplates = profile?.role === "admin" || profile?.role === "broker";

  return (
    <div className="space-y-6">
      {showBrokerTemplates && <BrokerTemplateDownloads />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Documents</h2>
          <p className="text-muted-foreground">
            {demoAuthActive ? "Demo sample list" : loading ? "Loading from Supabase…" : "Manage client documents and OCR results"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          aria-label="Export visible documents as CSV"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50"
          disabled={loading || filtered.length === 0}
        >
          <Download className="h-4 w-4 shrink-0" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search documents or clients"
            placeholder="Search documents or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none transition-colors duration-200"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            aria-label="Filter by document status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="uploaded">Uploaded</option>
            <option value="processing">Processing</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left">
                <th className="px-6 py-3 font-semibold text-surface-foreground">Document</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Client</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Type</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Status</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">OCR Score</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Date</th>
                <th className="px-6 py-3 font-semibold text-surface-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-primary-50/50 dark:hover:bg-muted/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-950/50">
                        <FileText className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-surface-foreground">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-foreground">{doc.client}</td>
                  <td className="px-6 py-4 text-muted-foreground">{doc.type}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DOCUMENT_STATUS_BADGE_CLASS[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.confidence !== null ? (
                      <div className="flex items-center gap-2">
                        <progress
                          className={`thin-progress thin-progress--sm ${
                            doc.confidence >= 80
                              ? "thin-progress--success"
                              : doc.confidence >= 60
                                ? "thin-progress--warning"
                                : "thin-progress--danger"
                          }`}
                          max={100}
                          value={doc.confidence}
                          aria-label={`OCR confidence ${doc.confidence} percent`}
                        />
                        <span className="text-xs font-medium text-muted-foreground w-8">{doc.confidence}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{doc.uploadedAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`View ${doc.fileName}`}
                        disabled={demoAuthActive || !doc.filePath || storageActionId === doc.id}
                        onClick={() => void handleView(doc)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-surface-foreground cursor-pointer transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Download ${doc.fileName}`}
                        disabled={demoAuthActive || !doc.filePath || storageActionId === doc.id}
                        onClick={() => void handleDownloadRow(doc)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-surface-foreground cursor-pointer transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground">
            No documents found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
