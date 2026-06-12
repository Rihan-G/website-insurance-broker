import { FormEvent, useMemo, useState } from "react";
import { Bot, Sparkles, Loader2, Send } from "lucide-react";
import { hasAiApiKeys } from "../../lib/aiConfig";
import { chatViaOpenRouter } from "../../lib/openRouterChat";

/**
 * Lightweight homepage AI assistant (client-side for quick verification).
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
    return "Add VITE_OPENROUTER_API_KEY to enable replies";
  }, [loading, aiReady]);

  async function askAssistant(message: string): Promise<string> {
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
    const openAiKey = import.meta.env.VITE_OPENAI_API_KEY?.trim() || import.meta.env.VITE_AI_API_KEY?.trim();

    if (openRouterKey) {
      return chatViaOpenRouter(openRouterKey, message);
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
      className="pointer-events-auto fixed z-[35] max-lg:left-4 max-lg:right-4 max-lg:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-8 lg:right-8 lg:left-auto lg:w-full lg:max-w-md"
      role="region"
      aria-label="Insurance assistant"
    >
      <div className="rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-start gap-2.5">
          <div
            className="relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-md ring-2 ring-primary-400/30"
            aria-hidden
          >
            <Bot className="h-5 w-5 text-white" strokeWidth={2} />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-200 drop-shadow-sm" strokeWidth={2} />
          </div>

          <form className="min-w-0 flex-1 space-y-2" onSubmit={onSubmit}>
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
                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm font-medium text-surface-foreground caret-primary-600 placeholder:text-muted-foreground shadow-inner outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-70 dark:caret-primary-300"
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

            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{statusText}</p>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-2 text-xs leading-snug text-danger-700 dark:border-danger-700 dark:bg-danger-950/35 dark:text-danger-300"
              >
                {error}
              </p>
            )}

            {reply && !error && (
              <p className="rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-2 text-sm leading-snug text-surface-foreground dark:border-primary-800 dark:bg-primary-900/40">
                {reply}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
