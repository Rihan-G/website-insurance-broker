import { supabase } from "./supabase";

export function documentIngestLikelyAvailable(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  return Boolean(url) && !url.includes("localhost:54321");
}

export type IngestResult =
  | { ok: true; ocr_confidence?: number }
  | { ok: false; error: string; rateLimited?: boolean };

export async function invokeDocumentIngest(documentId: string): Promise<IngestResult> {
  if (!documentIngestLikelyAvailable()) {
    return { ok: false, error: "Server processing is unavailable in this environment (deploy Edge function document-ingest)." };
  }

  const { data, error } = await supabase.functions.invoke<{
    ok?: boolean;
    reason?: string;
    ocr_confidence?: number;
    error?: string;
  }>("document-ingest", { body: { documentId } });

  if (error) {
    const rateLimited = error.message.includes("429") || error.message.includes("Too many");
    return { ok: false, error: error.message, rateLimited };
  }

  if (data && typeof data === "object" && data.ok === false && data.reason) {
    return { ok: false, error: data.reason };
  }

  if (data && typeof data === "object" && data.error) {
    return { ok: false, error: String(data.error) };
  }

  return { ok: true, ocr_confidence: typeof data?.ocr_confidence === "number" ? data.ocr_confidence : undefined };
}
