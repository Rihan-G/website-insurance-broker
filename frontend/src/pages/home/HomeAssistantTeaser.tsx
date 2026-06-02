import { FormEvent, useMemo, useState } from "react";
import { Bot, Sparkles, Loader2, Send } from "lucide-react";
import { hasAiApiKeys } from "../../lib/aiConfig";

/**
 * Lightweight homepage AI assistant.
 * This runs client-side for quick verification in non-production contexts.
 */
export function HomeAssistantTeaser() {
  const aiReady = hasAiApiKeys();
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const statusText = useMemo(() => {
    if (loading) return "Thinking...";
    if (aiReady) return "AI assistant online";
    return "Add AI key to enable replies";
  }, [loading, aiReady]);

  async function askAssistant(message: string): Promise<string> {
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim() || import.meta.env.VITE_AI_API_KEY?.trim();

    if (openRouterKey) {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are SecureBroker's homepage assistant. Give concise insurance guidance for Mauritius users and suggest contacting a licensed broker for policy binding decisions.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.4,
          max_tokens: 220,
        }),
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(`OpenRouter request failed (${res.status}): ${raw.slice(0, 160)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim() || "I could not generate a reply. Please try again.";
    }

    if (openAiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are SecureBroker's homepage assistant. Give concise insurance guidance for Mauritius users and suggest contacting a licensed broker for policy binding decisions.",
            },
            { role: "user", content: message },
          ],
          temperature: 0.4,
          max_tokens: 220,
        }),
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(`OpenAI request failed (${res.status}): ${raw.slice(0, 160)}`);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim() || "I could not generate a reply. Please try again.";
    }

    throw new Error("No AI key configured. Add VITE_OPENROUTER_API_KEY or VITE_OPENAI_API_KEY.");
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = prompt.trim();
    if (!message) return;

    setError("");
    setReply("");
    setLoading(true);
    try {
      const text = await askAssistant(message);
      setReply(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="pointer-events-auto fixed z-[35] max-lg:left-4 max-lg:right-4 max-lg:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:right-8 lg:left-auto lg:max-w-md"
      role="region"
      aria-label="Insurance assistant"
    >
      <div className="rounded-2xl border border-border/90 bg-surface/95 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-2.5">
          <div
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md ring-2 ring-violet-400/30 dark:from-violet-500 dark:to-indigo-500 dark:ring-violet-300/25"
            aria-hidden
          >
            <Bot className="h-5 w-5 text-white" strokeWidth={2} />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-200 drop-shadow-sm" strokeWidth={2} />
          </div>

          <form className="min-w-0 flex-1" onSubmit={onSubmit}>
            <label htmlFor="home-assistant-input" className="sr-only">
              Ask the insurance assistant
            </label>
            <div className="flex items-center gap-2">
              <input
                id="home-assistant-input"
                name="assistant-query"
                type="text"
                autoComplete="off"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about cover, renewals, or claims..."
                title={aiReady ? "Ask a quick question" : "Add AI API key to enable replies"}
                className="h-10 w-full min-w-0 rounded-xl border border-border/80 bg-muted/50 px-3 text-sm text-surface-foreground placeholder:text-muted-foreground/80 outline-none ring-primary-500/20 focus-visible:ring-2 dark:border-white/10 dark:bg-slate-900/80 dark:text-primary-50 dark:placeholder:text-primary-300/70"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send assistant message"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              </button>
            </div>

            <div className="mt-1">
              <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground dark:text-primary-400/90">
                {statusText}
              </p>
              {error && <p className="mt-0.5 line-clamp-2 text-[11px] text-danger-600 dark:text-danger-300">{error}</p>}
              {reply && !error && (
                <p className="mt-0.5 line-clamp-3 text-[11px] text-surface-foreground dark:text-primary-50">{reply}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
