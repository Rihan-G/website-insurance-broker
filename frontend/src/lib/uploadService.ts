import { supabase } from "./supabase";
import { db } from "./db";

export interface UploadResult {
  path: string;
  url: string;
  size: number;
  mimeType: string;
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

export async function uploadDocument(
  file: File,
  clientId: string,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const ext = file.name.split(".").pop();
  const path = `documents/${clientId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  // Supabase Storage doesn't expose granular progress, so we fake a pre/post split
  onProgress?.(10);

  const { error } = await supabase.storage.from("documents").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  onProgress?.(90);

  const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);

  onProgress?.(100);

  return { path, url: urlData.publicUrl, size: file.size, mimeType: file.type };
}

export async function saveDocumentRecord(
  clientId: string,
  uploadedBy: string,
  file: File,
  uploadResult: UploadResult,
  existingDocumentId?: string
) {
  if (existingDocumentId) {
    // New version of an existing document
    const { data: existing } = await db.documents()
      .select("version")
      .eq("id", existingDocumentId)
      .single();

    const newVersion = ((existing as { version?: number })?.version ?? 1) + 1;

    const { data, error } = await db.documents()
      .insert({
        client_id: clientId,
        file_name: file.name,
        file_path: uploadResult.path,
        file_size: uploadResult.size,
        mime_type: uploadResult.mimeType,
        status: "uploaded",
        uploaded_by: uploadedBy,
        version: newVersion,
      })
      .select()
      .single();

    if (error) throw new Error((error as { message: string }).message);
    return data;
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
    })
    .select()
    .single();

  if (error) throw new Error((error as { message: string }).message);
  return data;
}

export async function getDocumentVersions(originalName: string, clientId: string) {
  const { data, error } = await db.documents()
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
