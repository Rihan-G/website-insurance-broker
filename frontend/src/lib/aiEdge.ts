import { supabase } from "./supabase";

export type AiConfigScope = "broker" | "client";

export interface AiStatusResponse {
  brokerKeyConfigured: boolean;
  clientKeyConfigured: boolean;
}

export interface AiPingResponse {
  ok: boolean;
  message?: string;
  upstreamStatus?: number;
  scope?: AiConfigScope;
}

/** Whether Edge Functions are likely deployed (real project URL, not local placeholder). */
export function aiEdgeLikelyAvailable(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  return Boolean(url) && !url.includes("localhost:54321");
}

export async function fetchAiKeyStatus(): Promise<{ data: AiStatusResponse | null; error: Error | null }> {
  const { data, error } = await supabase.functions.invoke<AiStatusResponse>("ai-config", {
    body: { action: "status" },
  });
  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}

export async function pingAiProvider(scope: AiConfigScope): Promise<{ data: AiPingResponse | null; error: Error | null }> {
  const { data, error } = await supabase.functions.invoke<AiPingResponse>("ai-config", {
    body: { action: "ping", scope },
  });
  if (error) return { data: null, error: new Error(error.message) };
  return { data, error: null };
}
