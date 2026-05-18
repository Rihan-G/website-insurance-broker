import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ShieldCheck, RefreshCw, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadDocument, saveDocumentRecord, simulateOcr, validateFile } from "../lib/uploadService";
import { logAudit } from "../lib/auditService";
import { DEMO_CLIENT_ROWS } from "../lib/demoClients";
import { formatBytes } from "../lib/documentsDisplay";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  ocrConfidence?: number;
  isNewVersion?: boolean;
  mimeType?: string;
  sizeBytes?: number;
  targetClientId?: string;
}

export function UploadPage() {
  const { user, profile, demoAuthActive } = useAuth();
  const role = profile?.role;
  const isStaff = role === "admin" || role === "broker";
  const isClientUser = role === "client";

  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [staffTargetId, setStaffTargetId] = useState("");
  const [staffOptions, setStaffOptions] = useState<Array<{ id: string; name: string }>>([]);

  const resolvedClientId = useMemo(() => {
    if (!user?.id) return "anonymous";
    if (isClientUser) return user.id;
    if (isStaff && staffTargetId) return staffTargetId;
    return user.id;
  }, [user?.id, isClientUser, isStaff, staffTargetId]);

  useEffect(() => {
    if (!user?.id) return;
    if (isClientUser) {
      setStaffTargetId(user.id);
      setStaffOptions([]);
      return;
    }
    if (!isStaff) {
      setStaffTargetId(user.id);
      setStaffOptions([]);
      return;
    }

    if (demoAuthActive) {
      const opts = DEMO_CLIENT_ROWS.map((c) => ({ id: c.id, name: c.name }));
      setStaffOptions(opts);
      setStaffTargetId((prev) => (opts.some((o) => o.id === prev) ? prev : opts[0]?.id ?? user.id));
      return;
    }

    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "client")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error || !data?.length) {
        setStaffOptions([]);
        setStaffTargetId(user.id);
        return;
      }
      const rows = data as Array<{ id: string; full_name: string }>;
      const opts = rows.map((r) => ({ id: r.id, name: r.full_name?.trim() || r.id.slice(0, 8) }));
      setStaffOptions(opts);
      setStaffTargetId((prev) => (opts.some((o) => o.id === prev) ? prev : opts[0]!.id));
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isStaff, isClientUser, demoAuthActive]);

  const updateUpload = useCallback((id: string, patch: Partial<UploadProgress>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const id = `${file.name}_${Date.now()}`;
      const validation = validateFile(file);

      if (validation) {
        setUploads((prev) => [
          ...prev,
          {
            id,
            fileName: file.name,
            progress: 0,
            status: "error",
            error: validation,
            mimeType: file.type,
            sizeBytes: file.size,
            targetClientId: resolvedClientId,
          },
        ]);
        return;
      }

      setUploads((prev) => [
        ...prev,
        {
          id,
          fileName: file.name,
          progress: 0,
          status: "uploading",
          mimeType: file.type,
          sizeBytes: file.size,
          targetClientId: resolvedClientId,
        },
      ]);

      try {
        const clientForPath = resolvedClientId;
        const uploadedBy = user?.id ?? "anonymous";
        const uploadResult = await uploadDocument(file, clientForPath, (pct) =>
          updateUpload(id, { progress: pct })
        );

        updateUpload(id, { status: "processing", progress: 100 });

        await new Promise((r) => setTimeout(r, 1800));
        const ocr = simulateOcr(file.type);

        await saveDocumentRecord(clientForPath, uploadedBy, file, uploadResult);

        if (user) {
          await logAudit(user.id, "document.uploaded", "document", file.name, {
            size: file.size,
            mime: file.type,
            ocr_confidence: ocr.confidence,
            client_id: clientForPath,
          });
        }

        updateUpload(id, { status: "complete", ocrConfidence: ocr.confidence });
        toast.success(`${file.name} uploaded and processed.`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        updateUpload(id, { status: "error", error: msg });
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      }
    },
    [user, updateUpload, resolvedClientId]
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
        <p className="text-muted-foreground">Upload client documents for OCR processing and secure storage</p>
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-4 sm:p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-surface-foreground">What is being uploaded</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>The original file (name, size, and MIME type shown per row below).</li>
          <li>
            Storage path prefix{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs text-surface-foreground">documents/{resolvedClientId}/…</code>{" "}
            so the document is owned by that client profile in Supabase.
          </li>
          <li>A metadata row in the <code className="text-xs">documents</code> table plus audit log entry for compliance.</li>
          <li>Simulated OCR confidence scores for supported types (demo / offline behaviour).</li>
        </ul>
      </div>
      {isStaff && user && (
        <div
          className="rounded-xl border border-border bg-surface p-4 sm:p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-950/50">
              <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-surface-foreground">Client folder</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Files are stored under <code className="rounded bg-muted px-1 py-0.5 text-[10px]">documents/&lt;client_id&gt;/…</code>. Choose the client you are uploading for.
                </p>
              </div>
              <label htmlFor="upload-target-client" className="sr-only">
                Client for upload
              </label>
              <select
                id="upload-target-client"
                value={staffTargetId}
                onChange={(e) => setStaffTargetId(e.target.value)}
                className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none"
              >
                {staffOptions.length === 0 ? (
                  <option value={user.id}>Your broker workspace (no client profiles yet)</option>
                ) : (
                  staffOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
          dragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40"
            : "border-border bg-surface hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-950/25"
        }`}
      >
        <div className={`mx-auto mb-4 inline-flex rounded-full p-4 ${dragActive ? "bg-primary-100 dark:bg-primary-900/50" : "bg-muted"}`}>
          <Upload className={`h-8 w-8 ${dragActive ? "text-primary-600 dark:text-primary-400" : "text-muted-foreground"}`} />
        </div>
        <p className="text-lg font-semibold text-surface-foreground">Drop files here or click to browse</p>
        <p className="mt-2 text-sm text-muted-foreground">PDF, JPG, PNG up to 25MB — Insurance documents, claims, policies</p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-600 font-medium dark:text-accent-400">
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
                <div className="mt-0.5 rounded-lg bg-primary-50 p-2 shrink-0 dark:bg-primary-950/50">
                  <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-surface-foreground truncate">{upload.fileName}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      {statusIcon(upload)}
                      {upload.status === "uploading" && (
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">{Math.round(upload.progress)}%</span>
                      )}
                      {upload.status === "processing" && (
                        <span className="text-xs font-medium text-warning-600 dark:text-warning-400">OCR processing…</span>
                      )}
                      {upload.status === "complete" && upload.ocrConfidence !== undefined && (
                        <span className={`text-xs font-medium ${upload.ocrConfidence >= 80 ? "text-accent-600 dark:text-accent-400" : upload.ocrConfidence >= 60 ? "text-warning-600 dark:text-warning-400" : "text-danger-600 dark:text-danger-400"}`}>
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
                  {(upload.mimeType || upload.sizeBytes != null || upload.targetClientId) && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {upload.mimeType && <span className="text-surface-foreground/90">MIME: {upload.mimeType}</span>}
                      {upload.sizeBytes != null && (
                        <span className="ml-2 text-surface-foreground/90">Size: {formatBytes(upload.sizeBytes)}</span>
                      )}
                      {upload.targetClientId && (
                        <span className="ml-2 block sm:inline sm:ml-2">
                          Storage folder: <code className="rounded bg-muted px-1 py-0.5 text-[10px]">documents/{upload.targetClientId}/</code>
                        </span>
                      )}
                    </p>
                  )}
                  {upload.status === "uploading" && (
                    <progress
                      className="thin-progress mt-2"
                      max={100}
                      value={upload.progress}
                      aria-label={`Upload progress ${upload.progress}%`}
                    />
                  )}
                  {upload.status === "error" && (
                    <p className="mt-1 text-xs text-danger-600 dark:text-danger-400">{upload.error}</p>
                  )}
                  {upload.isNewVersion && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
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
              className="rounded-lg border border-border p-4 hover:border-primary-300 hover:bg-primary-50/30 dark:hover:border-primary-600 dark:hover:bg-primary-950/30 cursor-pointer transition-all duration-200"
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
