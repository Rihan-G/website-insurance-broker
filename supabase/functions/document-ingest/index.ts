/**
 * Post-upload processing: server-side magic-byte check, optional virus webhook stub,
 * rate limit, structured logs, persist ocr_data / status (service role).
 *
 * Client flow: upload file + insert documents row, then invoke with { documentId }.
 *
 * Optional secrets:
 *   VIRUS_SCAN_WEBHOOK_URL — POST JSON { sha256, documentId, byteLength } if set (integration stub)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_CLIENT = 25;
const RATE_MAX_STAFF = 60;

type ProfileRow = { role: "admin" | "broker" | "client" };

type DocRow = {
  id: string;
  client_id: string;
  uploaded_by: string;
  file_path: string;
  mime_type: string;
  file_name: string;
  file_size: number;
};

function logEvent(payload: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), source: "document-ingest", ...payload }));
}

function verifyMagicBytes(buf: Uint8Array, mimeType: string): { ok: boolean; kind: string } {
  if (buf.length < 4) return { ok: false, kind: "empty" };
  const b0 = buf[0] ?? 0;
  const b1 = buf[1] ?? 0;
  const b2 = buf[2] ?? 0;
  const b3 = buf[3] ?? 0;

  if (b0 === 0x25 && b1 === 0x50 && b2 === 0x44 && b3 === 0x46) {
    return { ok: mimeType.includes("pdf") || mimeType.includes("octet-stream"), kind: "pdf" };
  }
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) {
    return { ok: mimeType.includes("jpeg") || mimeType.includes("jpg") || mimeType.includes("octet-stream"), kind: "jpeg" };
  }
  if (b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47) {
    return { ok: mimeType.includes("png") || mimeType.includes("octet-stream"), kind: "png" };
  }
  const t8 = buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a && buf[3] === 0;
  const tM = buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0 && buf[3] === 0x2a;
  if (t8 || tM) return { ok: mimeType.includes("tiff") || mimeType.includes("tif") || mimeType.includes("octet-stream"), kind: "tiff" };

  return { ok: false, kind: "unknown" };
}

async function sha256Hex(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = performance.now();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase function environment" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authErr,
  } = await authClient.auth.getUser();
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: profileRow } = await admin.from("profiles").select("role").eq("id", user.id).single();
  const role = (profileRow as ProfileRow | null)?.role;
  if (!role) {
    return new Response(JSON.stringify({ error: "Profile not found" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let documentId = "";
  try {
    const body = req.method === "POST" ? ((await req.json()) as { documentId?: string }) : {};
    documentId = typeof body.documentId === "string" ? body.documentId : "";
  } catch {
    documentId = "";
  }
  if (!documentId) {
    return new Response(JSON.stringify({ error: "documentId required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: doc, error: docErr } = await admin
    .from("documents")
    .select("id, client_id, uploaded_by, file_path, mime_type, file_name, file_size")
    .eq("id", documentId)
    .single();

  if (docErr || !doc) {
    logEvent({ event: "document_not_found", documentId, userId: user.id });
    return new Response(JSON.stringify({ error: "Document not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const row = doc as DocRow;
  const allowed =
    row.uploaded_by === user.id ||
    row.client_id === user.id ||
    (role === "admin" || role === "broker");
  if (!allowed) {
    logEvent({ event: "forbidden", documentId, userId: user.id });
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error: rateErr } = await admin
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", user.id)
    .gte("created_at", since);

  if (rateErr) {
    logEvent({ event: "rate_check_error", err: rateErr.message });
  } else {
    const max = role === "client" ? RATE_MAX_CLIENT : RATE_MAX_STAFF;
    if ((count ?? 0) > max) {
      logEvent({ event: "rate_limited", userId: user.id, count, max });
      return new Response(JSON.stringify({ error: "Too many uploads in the last minute. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const { data: bin, error: dlErr } = await admin.storage.from("documents").download(row.file_path);
  if (dlErr || !bin) {
    logEvent({ event: "storage_download_failed", documentId, err: dlErr?.message });
    await admin
      .from("documents")
      .update({
        status: "rejected",
        ocr_data: { error: "storage_download_failed", message: dlErr?.message ?? "unknown" },
      })
      .eq("id", documentId);
    return new Response(JSON.stringify({ error: "Could not read uploaded file from storage" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const full = new Uint8Array(await bin.arrayBuffer());
  const slice = full.slice(0, Math.min(512, full.length));
  const magic = verifyMagicBytes(slice, row.mime_type);
  const hashInput =
    full.byteLength <= 2_000_000
      ? full.buffer.slice(full.byteOffset, full.byteOffset + full.byteLength)
      : full.buffer.slice(full.byteOffset, full.byteOffset + Math.min(full.byteLength, 1_048_576));
  const hash = await sha256Hex(hashInput);
  const hashNote = full.byteLength <= 2_000_000 ? "full" : "partial_1mb";

  const virusUrl = Deno.env.get("VIRUS_SCAN_WEBHOOK_URL");
  if (virusUrl) {
    try {
      await fetch(virusUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sha256: hash,
          sha256_scope: hashNote,
          documentId,
          byteLength: row.file_size,
          fileName: row.file_name,
        }),
      });
    } catch (e) {
      logEvent({ event: "virus_webhook_error", err: String(e) });
    }
  }

  if (!magic.ok) {
    await admin
      .from("documents")
      .update({
        status: "rejected",
        ocr_confidence: 0,
        ocr_data: {
          error: "magic_byte_mismatch",
          detected: magic.kind,
          mime_type: row.mime_type,
          sha256: hash.slice(0, 24),
        },
      })
      .eq("id", documentId);

    logEvent({
      event: "ingest_rejected_magic",
      documentId,
      userId: user.id,
      ms: Math.round(performance.now() - t0),
      kind: magic.kind,
    });

    return new Response(
      JSON.stringify({ ok: false, reason: "File content does not match declared type (server check)." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const confidence = magic.kind === "jpeg" || magic.kind === "png" ? 86 : magic.kind === "pdf" ? 84 : 82;
  const ocr_data = {
    verified_by: "document-ingest",
    magic_kind: magic.kind,
    sha256_head: hash,
    policy_number: `POL-${Math.floor(Math.random() * 900000) + 100000}`,
    insured_name: "Pending manual review",
    coverage_type: "Unclassified",
    note: "Replace with Document AI / Textract in production; this is a server-side placeholder after magic-byte verification.",
  };

  await admin
    .from("documents")
    .update({
      status: "reviewed",
      ocr_confidence: confidence,
      ocr_data,
    })
    .eq("id", documentId);

  logEvent({
    event: "ingest_ok",
    documentId,
    userId: user.id,
    ms: Math.round(performance.now() - t0),
    byteLength: row.file_size,
    kind: magic.kind,
  });

  return new Response(JSON.stringify({ ok: true, ocr_confidence: confidence }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
