import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
            u.fileName === fileName
              ? { ...u, progress: 100, status: "processing" }
              : u
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
        <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
        <p className="text-gray-500">
          Upload client documents for OCR processing and storage
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          dragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 bg-white hover:border-primary-400 hover:bg-gray-50"
        }`}
      >
        <Upload className={`mx-auto h-12 w-12 ${dragActive ? "text-primary-500" : "text-gray-400"}`} />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-sm text-gray-500">
          PDF, JPG, PNG up to 25MB — Insurance documents, claims, policies
        </p>
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
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold text-gray-900">Upload Progress</h3>
          </div>
          <div className="divide-y">
            {uploads.map((upload) => (
              <div key={upload.fileName} className="flex items-center gap-4 px-6 py-4">
                <FileText className="h-8 w-8 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.fileName}
                    </p>
                    <div className="ml-4 flex items-center gap-2">
                      {upload.status === "uploading" && (
                        <span className="text-xs text-gray-500">
                          {Math.round(upload.progress)}%
                        </span>
                      )}
                      {upload.status === "processing" && (
                        <span className="flex items-center gap-1 text-xs text-yellow-600">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing OCR...
                        </span>
                      )}
                      {upload.status === "complete" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {upload.status === "error" && (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <button
                        onClick={() => removeUpload(upload.fileName)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {upload.status === "uploading" && (
                    <div className="mt-2 h-1.5 rounded-full bg-gray-100">
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

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Supported Document Types</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { type: "Motor Insurance", desc: "Policy documents, claims, valuations" },
            { type: "Home Insurance", desc: "Property valuations, coverage docs" },
            { type: "Life Insurance", desc: "Applications, medical reports" },
            { type: "Health Insurance", desc: "Claim forms, medical records" },
            { type: "Travel Insurance", desc: "Travel docs, itineraries" },
            { type: "Business Insurance", desc: "Commercial policies, liability docs" },
          ].map((item) => (
            <div key={item.type} className="rounded-lg border p-4">
              <p className="font-medium text-gray-900">{item.type}</p>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
