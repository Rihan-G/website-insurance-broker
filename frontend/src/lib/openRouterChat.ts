const SYSTEM_PROMPT =
  "You are SecureBroker's homepage assistant. Give concise insurance guidance for Mauritius users and suggest contacting a licensed broker for policy binding decisions.";

/** Models that usually work on free / restricted OpenRouter accounts (tried in order). */
const DEFAULT_OPENROUTER_MODELS = [
  "google/gemini-2.0-flash-lite-001",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen-2.5-7b-instruct",
] as const;

function openRouterHeaders(apiKey: string): Record<string, string> {
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://securebroker.local";

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": origin,
    "X-Title": "SecureBroker Insurance Portal",
  };
}

function modelsToTry(): string[] {
  const custom = import.meta.env.VITE_OPENROUTER_MODEL?.trim();
  if (custom) return [custom, ...DEFAULT_OPENROUTER_MODELS.filter((m) => m !== custom)];
  return [...DEFAULT_OPENROUTER_MODELS];
}

function parseApiError(raw: string, status: number): string {
  try {
    const json = JSON.parse(raw) as { error?: { message?: string } };
    const msg = json.error?.message;
    if (msg) {
      if (/no allowed providers/i.test(msg)) {
        return "OpenRouter has no provider enabled for that model. Set VITE_OPENROUTER_MODEL to a free model (e.g. google/gemini-2.0-flash-lite-001) in OpenRouter dashboard → Settings → Providers.";
      }
      return `OpenRouter (${status}): ${msg}`;
    }
  } catch {
    /* use raw slice */
  }
  return `OpenRouter request failed (${status}): ${raw.slice(0, 200)}`;
}

async function requestModel(
  apiKey: string,
  model: string,
  message: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number; raw: string; retryable: boolean }> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: openRouterHeaders(apiKey),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 220,
      provider: { allow_fallbacks: true },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    const retryable =
      res.status === 404 ||
      res.status === 402 ||
      /no allowed providers|provider/i.test(raw);
    return { ok: false, status: res.status, raw, retryable };
  }

  const data = JSON.parse(raw) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) return { ok: false, status: 502, raw: "Empty model response", retryable: true };
  return { ok: true, text };
}

/** Call OpenRouter with model fallbacks when the account blocks certain providers. */
export async function chatViaOpenRouter(apiKey: string, message: string): Promise<string> {
  const models = modelsToTry();
  let lastError = "OpenRouter request failed.";

  for (const model of models) {
    const result = await requestModel(apiKey, model, message);
    if (result.ok) return result.text;
    lastError = parseApiError(result.raw, result.status);
    if (!result.retryable) break;
  }

  throw new Error(lastError);
}
