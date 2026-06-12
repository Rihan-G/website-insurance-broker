// Supabase Edge Function: proxies the homepage AI assistant to Anthropic's Claude API
// so the API key stays server-side. Deploy with:
//   supabase functions deploy ai-assistant
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
import Anthropic from "npm:@anthropic-ai/sdk@^0.32.1";

const SYSTEM_PROMPT =
  "You are SecureBroker's homepage assistant. Give concise insurance guidance for Mauritius users and suggest contacting a licensed broker for policy binding decisions.";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_MESSAGE_LENGTH = 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let message: string;
  try {
    const body = await req.json();
    message = typeof body?.message === "string" ? body.message.trim() : "";
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!message) {
    return jsonResponse({ error: "Message is required" }, 400);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return jsonResponse({ error: "AI assistant is not configured." }, 503);
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 220,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: message.slice(0, MAX_MESSAGE_LENGTH) }],
    });

    const text = response.content.find((block) => block.type === "text")?.text?.trim();
    return jsonResponse({ reply: text || "I could not generate a reply. Please try again." });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Assistant request failed.";
    return jsonResponse({ error: detail }, 502);
  }
});
