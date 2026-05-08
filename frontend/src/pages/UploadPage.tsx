import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import type { UploadProgress } from "../types";

export function UploadPage() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((fileName: string) => {
    const upload: UploadProgress = { fileName, progress: 0, status: "uploading" };
    setUploads((prev) => [...prev, upload]);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === fileName ? { ...u, progress: 100, status: "processing" } : u
          )
        );
        setTimeout(() => {
          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === fileName ? { ...u, status: "complete" } : u
            )
          );
        }, 2000);
      } else {
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === fileName ? { ...u, progress: Math.min(progress, 99) } : u
          )
        );
      }
    }, 300);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => simulateUpload(file.name));
    },
    [simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeUpload = (fileName: string) => {
    setUploads((prev) => prev.filter((u) => u.fileName !== fileName));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">Upload Documents</h2>
        <p className="text-muted-foreground">
          Upload client documents for OCR processing and secure storage
        </p>
      </div>

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
        <p className="text-lg font-semibold text-surface-foreground">
          Drop files here or click to browse
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          PDF, JPG, PNG up to 25MB — Insurance documents, claims, policies
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent-600 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          Files are encrypted during upload and at rest
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {uploads.length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Upload Progress</h3>
          </div>
          <div className="divide-y divide-border">
            {uploads.map((upload) => (
              <div key={upload.fileName} className="flex items-center gap-4 px-6 py-4">
                <div className="rounded-lg bg-primary-50 p-2 shrink-0">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-surface-foreground truncate">
                      {upload.fileName}
                    </p>
                    <div className="ml-4 flex items-center gap-2">
                      {upload.status === "uploading" && (
                        <span className="text-xs font-medium text-primary-600">
                          {Math.round(upload.progress)}%
                        </span>
                      )}
                      {upload.status === "processing" && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-warning-600">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Processing OCR...
                        </span>
                      )}
                      {upload.status === "complete" && (
                        <CheckCircle className="h-5 w-5 text-accent-500" />
                      )}
                      {upload.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-danger-500" />
                      )}
                      <button
                        onClick={() => removeUpload(upload.fileName)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-surface-foreground cursor-pointer transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {upload.status === "uploading" && (
                    <div className="mt-2 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary-500 transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div key={item.type} className="rounded-lg border border-border p-4 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all duration-200">
              <p className="font-medium text-surface-foreground">{item.type}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
