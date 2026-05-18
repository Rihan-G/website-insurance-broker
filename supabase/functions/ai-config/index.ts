/**
 * AI configuration helper — keys live ONLY in Supabase Edge secrets (never VITE_*).
 *
 * Suggested secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
 *   AI_API_KEY_BROKER   — staff workflows (quotes, OCR assist, document review)
 *   AI_API_KEY_CLIENT   — client-safe tier (FAQs, policy explanations, lower limits)
 *
 * Optional:
 *   OPENAI_BASE_URL     — default https://api.openai.com/v1 (Azure/OpenRouter-compatible base)
 *
 * Provider: OpenAI-compatible `/v1/models` ping; swap URL + headers if you use Anthropic-only
 * (then replace the ping block with their health endpoint).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ProfileRow = { role: "admin" | "broker" | "client" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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
  const { data: profileRow, error: profErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profErr || !profileRow) {
    return new Response(JSON.stringify({ error: "Profile not found" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const role = (profileRow as ProfileRow).role;

  let body: { action?: string; scope?: string } = {};
  if (req.method === "POST") {
    try {
      body = (await req.json()) as typeof body;
    } catch {
      body = {};
    }
  }

  const action = body.action;
  const scope = body.scope === "client" ? "client" : "broker";

  if (action === "status") {
    if (!["admin", "broker"].includes(role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const brokerKeyConfigured = Boolean(Deno.env.get("AI_API_KEY_BROKER"));
    const clientKeyConfigured = Boolean(Deno.env.get("AI_API_KEY_CLIENT"));
    return new Response(JSON.stringify({ brokerKeyConfigured, clientKeyConfigured }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "ping") {
    if (scope === "broker") {
      if (!["admin", "broker"].includes(role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      if (!["admin", "client"].includes(role)) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const apiKey = scope === "client" ? Deno.env.get("AI_API_KEY_CLIENT") : Deno.env.get("AI_API_KEY_BROKER");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: `No AI_API_KEY_${scope === "client" ? "CLIENT" : "BROKER"} in Edge Function secrets.`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const base = (Deno.env.get("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await fetch(`${base}/models`, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return new Response(
      JSON.stringify({
        ok: res.ok,
        upstreamStatus: res.status,
        scope,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ error: "Use action \"status\" or \"ping\"" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
