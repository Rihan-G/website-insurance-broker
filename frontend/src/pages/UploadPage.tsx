import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadDocument, saveDocumentRecord, simulateOcr, validateFile } from "../lib/uploadService";
import { logAudit } from "../lib/auditService";
import toast from "react-hot-toast";

interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  ocrConfidence?: number;
  isNewVersion?: boolean;
}

export function UploadPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setUploads((prev) => [...prev, { id, fileName: file.name, progress: 0, status: "uploading" }]);

      try {
        if (!user?.id) {
          updateUpload(id, { status: "error", error: "Sign in to upload documents to your folder." });
          toast.error("You must be signed in to upload.");
          return;
        }

        // Row and storage path use this UUID; RLS ensures clients only write their own `client_id`.
        const clientId = user.id;
        const uploadResult = await uploadDocument(file, clientId, (pct) =>
          updateUpload(id, { progress: pct })
        );

        updateUpload(id, { status: "processing", progress: 100 });

        // Simulate OCR processing delay
        await new Promise((r) => setTimeout(r, 1800));
        const ocr = simulateOcr(file.type);

        await saveDocumentRecord(clientId, user.id, file, uploadResult);

        if (user) {
          await logAudit(user.id, "document.uploaded", "document", file.name, {
            size: file.size,
            mime: file.type,
            ocr_confidence: ocr.confidence,
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
    [user, updateUpload]
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

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
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
            Files are saved to your private folder and registered on your account only. They are not visible to other clients.
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
                        <span className="text-xs font-medium text-warning-600">OCR processing…</span>
                      )}
                      {upload.status === "complete" && upload.ocrConfidence !== undefined && (
                        <span className={`text-xs font-medium ${upload.ocrConfidence >= 80 ? "text-accent-600" : upload.ocrConfidence >= 60 ? "text-warning-600" : "text-danger-600"}`}>
                          {upload.ocrConfidence}% confidence
                        </span>
                      )}
                      <button
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
                  {upload.status === "error" && (
                    <p className="mt-1 text-xs text-danger-600">{upload.error}</p>
                  )}
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
