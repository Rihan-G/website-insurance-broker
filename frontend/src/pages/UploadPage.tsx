import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ShieldCheck, RefreshCw, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  uploadDocument,
  saveDocumentRecord,
  simulateOcr,
  validateFile,
  listClientDocumentsForReplace,
  type DocumentPurpose,
} from "../lib/uploadService";
import { validateFileMagicBytes } from "../lib/uploadMagic";
import { invokeDocumentIngest, documentIngestLikelyAvailable } from "../lib/documentIngest";
import { logAudit } from "../lib/auditService";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  ocrConfidence?: number;
  isNewVersion?: boolean;
}

const PURPOSE_OPTIONS: { value: DocumentPurpose; label: string }[] = [
  { value: "claim", label: "Claim" },
  { value: "renewal", label: "Renewal" },
  { value: "id_proof", label: "ID / proof" },
  { value: "policy", label: "Policy" },
  { value: "other", label: "Other" },
];

const MAX_PARALLEL_UPLOADS = 4;

export function UploadPage() {
  const { user, profile, demoAuthActive } = useAuth();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const concurrentRef = useRef(0);

  const isStaff = profile?.role === "admin" || profile?.role === "broker";
  const [staffClientId, setStaffClientId] = useState<string>("");
  const [staffClients, setStaffClients] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [purpose, setPurpose] = useState<DocumentPurpose>("other");
  const [replaceDocId, setReplaceDocId] = useState<string>("");
  const [replaceRows, setReplaceRows] = useState<{ id: string; file_name: string; version: number }[]>([]);

  const effectiveClientId = useMemo(() => {
    if (!user?.id) return "";
    if (profile?.role === "client") return user.id;
    return staffClientId;
  }, [user?.id, profile?.role, staffClientId]);

  useEffect(() => {
    if (!isStaff || demoAuthActive) {
      setStaffClients([]);
      return;
    }
    let cancelled = false;
    void supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "client")
      .order("full_name", { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setStaffClients([]);
          return;
        }
        setStaffClients(data as { id: string; full_name: string; email: string }[]);
      });
    return () => {
      cancelled = true;
    };
  }, [isStaff, demoAuthActive]);

  useEffect(() => {
    if (!effectiveClientId || demoAuthActive) {
      setReplaceRows([]);
      setReplaceDocId("");
      return;
    }
    let cancelled = false;
    void listClientDocumentsForReplace(effectiveClientId)
      .then((rows) => {
        if (cancelled) return;
        setReplaceRows(rows.map((r) => ({ id: r.id, file_name: r.file_name, version: r.version })));
      })
      .catch(() => {
        if (!cancelled) setReplaceRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveClientId, demoAuthActive]);

  const updateUpload = useCallback((id: string, patch: Partial<UploadProgress>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const id = `${file.name}_${Date.now()}`;
      const validation = validateFile(file);

      if (validation) {
        setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "error", error: validation }]);
        return;
      }

      if (!user?.id) {
        setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "error", error: "Sign in required." }]);
        toast.error("You must be signed in to upload.");
        return;
      }

      if (isStaff && !staffClientId) {
        setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "error", error: "Select a client first." }]);
        toast.error("Choose which client this upload belongs to.");
        return;
      }

      if (concurrentRef.current >= MAX_PARALLEL_UPLOADS) {
        setUploads((prev) => [
          ...prev,
          {
            id,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: `Too many files at once (max ${MAX_PARALLEL_UPLOADS}).`,
          },
        ]);
        toast.error(`Upload at most ${MAX_PARALLEL_UPLOADS} files in parallel.`);
        return;
      }

      const magicErr = await validateFileMagicBytes(file);
      if (magicErr) {
        setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "error", error: magicErr }]);
        toast.error(magicErr);
        return;
      }

      setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "uploading" }]);
      concurrentRef.current += 1;

      try {
        const clientId = effectiveClientId;
        const uploadResult = await uploadDocument(file, clientId, (pct) => updateUpload(id, { progress: pct }));

        updateUpload(id, { status: "processing", progress: 100 });

        const { id: documentId } = await saveDocumentRecord(clientId, user.id, file, uploadResult, {
          documentPurpose: purpose,
          existingDocumentId: replaceDocId || undefined,
        });

        await logAudit(user.id, "document.uploaded", "document", documentId, {
          purpose,
          replace: Boolean(replaceDocId),
          client_id: clientId,
          size: file.size,
        });

        let confidence: number | undefined;
        if (documentIngestLikelyAvailable()) {
          const ingest = await invokeDocumentIngest(documentId);
          if (!ingest.ok) {
            await logAudit(user.id, "document.ingest_failed", "document", documentId, {
              error: ingest.error,
              rateLimited: ingest.rateLimited ?? false,
            });
            toast.error(ingest.error);
            updateUpload(id, { status: "error", error: ingest.error });
            return;
          }
          confidence = ingest.ocr_confidence;
          await logAudit(user.id, "document.ingest_completed", "document", documentId, {
            ocr_confidence: confidence,
          });
        } else {
          await new Promise((r) => setTimeout(r, 600));
          const ocr = simulateOcr(file.type);
          confidence = ocr.confidence;
          toast("Server ingest skipped (demo URL). Deploy document-ingest for validation.", { icon: "ℹ️" });
        }

        updateUpload(id, {
          status: "complete",
          ocrConfidence: confidence,
          isNewVersion: Boolean(replaceDocId),
        });
        toast.success(`${file.name} uploaded.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        updateUpload(id, { status: "error", error: msg });
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      } finally {
        concurrentRef.current -= 1;
      }
    },
    [user, updateUpload, isStaff, staffClientId, effectiveClientId, purpose, replaceDocId]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach(processFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeUpload = (id: string) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const statusIcon = (u: UploadProgress) => {
    if (u.status === "processing") return <Loader2 className="h-4 w-4 animate-spin text-warning-500" />;
    if (u.status === "complete") return <CheckCircle className="h-5 w-5 text-accent-500" />;
    if (u.status === "error") return <AlertCircle className="h-5 w-5 text-danger-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Upload Documents</h2>
        <p className="text-muted-foreground">
          {isStaff
            ? "Upload into a selected client’s folder. Choose purpose and optional replacement version."
            : "Upload for OCR processing and secure storage under your account."}
        </p>
      </div>

      {!demoAuthActive && isStaff && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-surface-foreground">
            <Users className="h-4 w-4 text-primary-600" />
            Client for this upload
          </label>
          <select
            value={staffClientId}
            onChange={(e) => {
              setStaffClientId(e.target.value);
              setReplaceDocId("");
            }}
            className="w-full max-w-xl rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none"
          >
            <option value="">Select client…</option>
            {staffClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} — {c.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-surface-foreground">What you are uploading</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value as DocumentPurpose)}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none"
          >
            {PURPOSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-foreground">New version of existing file (optional)</label>
          <select
            value={replaceDocId}
            onChange={(e) => setReplaceDocId(e.target.value)}
            disabled={!effectiveClientId || replaceRows.length === 0}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">No — treat as a new file</option>
            {replaceRows.map((r) => (
              <option key={r.id} value={r.id}>
                {r.file_name} (v{r.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
          dragActive
            ? "border-primary-500 bg-primary-50"
            : "border-border bg-surface hover:border-primary-400 hover:bg-primary-50/30"
        }`}
      >
        <div className={`mx-auto mb-4 inline-flex rounded-full p-4 ${dragActive ? "bg-primary-100" : "bg-muted"}`}>
          <Upload className={`h-8 w-8 ${dragActive ? "text-primary-600" : "text-muted-foreground"}`} />
        </div>
        <p className="text-lg font-semibold text-surface-foreground">Drop files here or click to browse</p>
        <p className="mt-2 text-sm text-muted-foreground">PDF, JPG, PNG up to 25MB — Insurance documents, claims, policies</p>
        {user?.id ? (
          <p className="mt-2 text-xs text-muted-foreground max-w-xl mx-auto">
            Files are stored privately per client. MIME type and file header are checked in the browser; when{" "}
            <code className="rounded bg-muted px-1">document-ingest</code> is deployed, Supabase Edge verifies again
            and updates OCR fields.
          </p>
        ) : (
          <p className="mt-2 text-xs text-warning-700 dark:text-warning-400 max-w-xl mx-auto">
            Sign in so uploads are tied to your profile and protected by access rules.
          </p>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-600 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          Files are encrypted during upload and at rest
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          aria-label="Upload insurance documents"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Upload Progress</h3>
            <button
              type="button"
              onClick={() => setUploads((prev) => prev.filter((u) => u.status !== "complete"))}
              className="text-xs text-muted-foreground hover:text-surface-foreground cursor-pointer transition-colors duration-200"
            >
              Clear completed
            </button>
          </div>
          <div className="divide-y divide-border">
            {uploads.map((upload) => (
              <div key={upload.id} className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 rounded-lg bg-primary-50 p-2 shrink-0">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-surface-foreground truncate">{upload.fileName}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusIcon(upload)}
                      {upload.status === "uploading" && (
                        <span className="text-xs font-medium text-primary-600">{Math.round(upload.progress)}%</span>
                      )}
                      {upload.status === "processing" && (
                        <span className="text-xs font-medium text-warning-600">Processing…</span>
                      )}
                      {upload.status === "complete" && upload.ocrConfidence !== undefined && (
                        <span
                          className={`text-xs font-medium ${
                            upload.ocrConfidence >= 80
                              ? "text-accent-600"
                              : upload.ocrConfidence >= 60
                                ? "text-warning-600"
                                : "text-danger-600"
                          }`}
                        >
                          {upload.ocrConfidence}% confidence
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeUpload(upload.id)}
                        aria-label="Remove file"
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {upload.status === "uploading" && (
                    <progress
                      className="thin-progress mt-2"
                      max={100}
                      value={upload.progress}
                      aria-label={`Upload progress ${upload.progress}%`}
                    />
                  )}
                  {upload.status === "error" && <p className="mt-1 text-xs text-danger-600">{upload.error}</p>}
                  {upload.isNewVersion && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary-600">
                      <RefreshCw className="h-3 w-3" />
                      New version saved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported document types */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-semibold text-surface-foreground mb-4">Supported Document Types</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { type: "Motor Insurance", desc: "Policy documents, claims, valuations" },
            { type: "Home Insurance", desc: "Property valuations, coverage docs" },
            { type: "Life Insurance", desc: "Applications, medical reports" },
            { type: "Health Insurance", desc: "Claim forms, medical records" },
            { type: "Travel Insurance", desc: "Travel docs, itineraries" },
            { type: "Business Insurance", desc: "Commercial policies, liability docs" },
          ].map((item) => (
            <div
              key={item.type}
              className="rounded-lg border border-border p-4 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all duration-200"
            >
              <p className="font-medium text-surface-foreground">{item.type}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
