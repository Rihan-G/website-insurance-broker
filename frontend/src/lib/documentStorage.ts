import { supabase } from "./supabase";

const BUCKET = "documents";

const DEFAULT_TTL_SECONDS = 60 * 60;

/** Signed URL for private bucket downloads / preview (requires matching storage RLS policies). */
export async function createDocumentSignedUrl(filePath: string, expiresIn = DEFAULT_TTL_SECONDS): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("No signed URL returned");
  return data.signedUrl;
}

export async function openDocumentInNewTab(filePath: string): Promise<void> {
  const url = await createDocumentSignedUrl(filePath);
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function triggerDocumentDownload(filePath: string, downloadName: string): Promise<void> {
  const url = await createDocumentSignedUrl(filePath);
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadName;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
