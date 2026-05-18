import { supabase } from "./supabase";
import { db } from "./db";

export interface UploadResult {
  path: string;
  /** Unused for private buckets; use `createDocumentSignedUrl` from `documentStorage.ts`. */
  url: string;
  size: number;
  mimeType: string;
}

export type DocumentPurpose = "claim" | "renewal" | "id_proof" | "policy" | "other";

export interface SaveDocumentOptions {
  existingDocumentId?: string;
  documentPurpose?: DocumentPurpose;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/tiff"];
const MAX_SIZE_MB = 25;

export function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${file.name}: Unsupported file type. Use PDF, JPG, PNG, or TIFF.`;
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `${file.name}: File exceeds ${MAX_SIZE_MB}MB limit.`;
  }
  return null;
}

function sanitizeExtension(fileName: string, mimeType: string): string {
  const raw = (fileName.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (["pdf", "jpg", "jpeg", "png", "tif", "tiff"].includes(raw)) {
    if (raw === "jpg" || raw === "jpeg") return "jpeg";
    if (raw === "tif" || raw === "tiff") return "tiff";
    return raw;
  }
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpeg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("tiff") || mimeType.includes("tif")) return "tiff";
  return "bin";
}

export async function uploadDocument(
  file: File,
  clientId: string,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const ext = sanitizeExtension(file.name, file.type);
  const safeRandom =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const path = `documents/${clientId}/${Date.now()}_${safeRandom}.${ext}`;

  onProgress?.(10);

  const { error } = await supabase.storage.from("documents").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  onProgress?.(100);

  return { path, url: "", size: file.size, mimeType: file.type };
}

export async function saveDocumentRecord(
  clientId: string,
  uploadedBy: string,
  file: File,
  uploadResult: UploadResult,
  options?: SaveDocumentOptions
): Promise<{ id: string }> {
  const purpose = options?.documentPurpose ?? "other";

  if (options?.existingDocumentId) {
    const { data: existing, error: exErr } = await db.documents()
      .select("version, file_name")
      .eq("id", options.existingDocumentId)
      .single();

    if (exErr || !existing) throw new Error("Could not load document to replace.");

    const newVersion = ((existing as { version?: number }).version ?? 1) + 1;
    const logicalName = (existing as { file_name: string }).file_name;

    const { data, error } = await db.documents()
      .insert({
        client_id: clientId,
        file_name: logicalName,
        file_path: uploadResult.path,
        file_size: uploadResult.size,
        mime_type: uploadResult.mimeType,
        status: "uploaded",
        uploaded_by: uploadedBy,
        version: newVersion,
        document_purpose: purpose,
      })
      .select("id")
      .single();

    if (error) throw new Error((error as { message: string }).message);
    return { id: (data as { id: string }).id };
  }

  const { data, error } = await db.documents()
    .insert({
      client_id: clientId,
      file_name: file.name,
      file_path: uploadResult.path,
      file_size: uploadResult.size,
      mime_type: uploadResult.mimeType,
      status: "uploaded",
      uploaded_by: uploadedBy,
      document_purpose: purpose,
    })
    .select("id")
    .single();

  if (error) throw new Error((error as { message: string }).message);
  return { id: (data as { id: string }).id };
}

export async function listClientDocumentsForReplace(clientId: string): Promise<
  { id: string; file_name: string; version: number; created_at: string }[]
> {
  const { data, error } = await db
    .documents()
    .select("id, file_name, version, created_at")
    .eq("client_id", clientId)
    .order("file_name", { ascending: true })
    .order("version", { ascending: false })
    .limit(100);

  if (error) throw new Error((error as { message: string }).message);
  return (data ?? []) as { id: string; file_name: string; version: number; created_at: string }[];
}

export async function getDocumentVersions(originalName: string, clientId: string) {
  const { data, error } = await db
    .documents()
    .select("*")
    .eq("client_id", clientId)
    .eq("file_name", originalName)
    .order("version", { ascending: false });

  if (error) throw new Error((error as { message: string }).message);
  return data;
}

export function simulateOcr(mimeType: string): { confidence: number; data: Record<string, string> } {
  const isImage = mimeType.startsWith("image/");
  const confidence = isImage
    ? Math.floor(Math.random() * 20) + 75
    : Math.floor(Math.random() * 15) + 82;

  return {
    confidence,
    data: {
      policy_number: `POL-${Math.floor(Math.random() * 900000) + 100000}`,
      insured_name: "Extracted from document",
      coverage_type: "Motor Insurance",
      premium: `MUR ${(Math.random() * 40000 + 5000).toFixed(2)}`,
      start_date: new Date().toISOString().split("T")[0] ?? "",
      end_date: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0] ?? "",
      insurer: "Sun Insurance Co. Ltd",
    },
  };
}
