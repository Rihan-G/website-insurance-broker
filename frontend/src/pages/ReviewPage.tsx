import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle, MessageSquare, Eye, RotateCcw, Filter, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../lib/auditService";
import { exportToCsv, formatDocumentsForExport } from "../lib/exportService";
import toast from "react-hot-toast";

interface ReviewDoc {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  ocr_confidence: number | null;
  ocr_data: Record<string, string> | null;
  version: number;
  created_at: string;
  client?: { full_name: string; email: string };
}

const statusColors: Record<string, string> = {
  uploaded: "bg-primary-100 text-primary-700 dark:bg-primary-950/55 dark:text-primary-200",
  processing: "bg-warning-50 text-warning-600 dark:bg-warning-950/35 dark:text-warning-300",
  reviewed: "bg-purple-100 text-purple-700 dark:bg-purple-950/45 dark:text-purple-200",
  approved: "bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300",
  rejected: "bg-danger-50 text-danger-600 dark:bg-danger-950/35 dark:text-danger-300",
};

export function ReviewPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<ReviewDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("uploaded");
  const [selectedDoc, setSelectedDoc] = useState<ReviewDoc | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    setLoading(true);
    let query = supabase
      .from("documents")
      .select("*, client:profiles!documents_client_id_fkey(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load documents.");
    } else {
      setDocs((data as unknown as ReviewDoc[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (docId: string, newStatus: "approved" | "rejected" | "reviewed") => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { error } = await db.documents()
        .update({ status: newStatus })
        .eq("id", docId);

      if (error) throw error;

      if (reviewComment.trim()) {
        await db.documentReviews().insert({
          document_id: docId,
          reviewer_id: user.id,
          status: newStatus === "reviewed" ? "needs_revision" : newStatus,
          comment: reviewComment.trim(),
        });
      }

      await logAudit(
        user.id,
        newStatus === "approved" ? "document.approved" : newStatus === "rejected" ? "document.rejected" : "document.reviewed",
        "document",
        docId,
        { comment: reviewComment.trim() || undefined }
      );

      toast.success(`Document marked as ${newStatus}.`);
      setSelectedDoc(null);
      setReviewComment("");
      fetchDocs();
    } catch {
      toast.error("Failed to update document status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    const exportData = formatDocumentsForExport(
      docs.map((d) => ({
        ...d,
        client: d.client?.full_name,
      }))
    );
    exportToCsv(exportData, "document_review");
    toast.success("Exported to CSV.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Document Review</h2>
          <p className="text-muted-foreground">Manually review OCR-processed documents</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {["all", "uploaded", "processing", "reviewed", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize cursor-pointer transition-colors duration-200 ${
              statusFilter === s
                ? "bg-primary-600 text-white"
                : "bg-muted text-muted-foreground hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-950/55 dark:hover:text-primary-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Document</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Client</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Status</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">OCR Score</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Version</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Date</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-primary-50/50 dark:hover:bg-muted/40 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary-50 p-2 shrink-0 dark:bg-primary-950/50">
                          <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-surface-foreground">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-surface-foreground">{doc.client?.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{doc.client?.email ?? ""}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[doc.status] ?? "bg-muted text-muted-foreground"}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.ocr_confidence !== null ? (
                        <div className="flex items-center gap-2">
                          <progress
                            className={`thin-progress thin-progress--sm ${
                              doc.ocr_confidence >= 80
                                ? "thin-progress--success"
                                : doc.ocr_confidence >= 60
                                  ? "thin-progress--warning"
                                  : "thin-progress--danger"
                            }`}
                            max={100}
                            value={doc.ocr_confidence}
                            aria-label={`OCR confidence ${doc.ocr_confidence} percent`}
                          />
                          <span className="text-xs text-muted-foreground">{doc.ocr_confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">v{doc.version}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100 cursor-pointer transition-colors duration-200 dark:bg-primary-950/50 dark:text-primary-200 dark:hover:bg-primary-900/60"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {docs.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">No documents match this filter.</p>
            )}
          </div>
        </div>
      )}

      {/* Review slide-over */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-surface-foreground">{selectedDoc.file_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedDoc.client?.full_name} · v{selectedDoc.version}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColors[selectedDoc.status] ?? ""}`}>
                {selectedDoc.status}
              </span>
            </div>

            {selectedDoc.ocr_data && (
              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">OCR Extracted Data</p>
                <div className="space-y-1.5 text-sm">
                  {Object.entries(selectedDoc.ocr_data).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="min-w-32 font-medium capitalize text-surface-foreground">{k.replace(/_/g, " ")}:</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">
                <MessageSquare className="inline h-4 w-4 mr-1" />
                Review Comment (optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a note for this review…"
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-surface-foreground placeholder-muted-foreground focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateStatus(selectedDoc.id, "approved")}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => updateStatus(selectedDoc.id, "rejected")}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={() => updateStatus(selectedDoc.id, "reviewed")}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-surface-foreground hover:bg-muted disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                Needs Revision
              </button>
              <button
                onClick={() => { setSelectedDoc(null); setReviewComment(""); }}
                className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
