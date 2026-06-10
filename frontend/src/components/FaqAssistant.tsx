import { useMemo, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { homeFaqItems } from "../pages/home/homeFaqData";
import { CONTACT_EMAIL, CONTACT_PHONE_TEL } from "../lib/branding";

function scoreMatch(query: string, q: string, a: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = `${q} ${a}`.toLowerCase();
  return terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
}

export function FaqAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const answer = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    const ranked = homeFaqItems
      .map((item) => ({ item, score: scoreMatch(q, item.q, item.a) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.item ?? null;
  }, [query]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 lg:bottom-6"
        aria-expanded={open}
        aria-label={open ? "Close FAQ assistant" : "Open FAQ assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-[90] w-[min(100vw-2rem,22rem)] rounded-2xl border border-border bg-surface p-4 shadow-2xl lg:bottom-24">
          <h3 className="text-sm font-bold text-surface-foreground">FAQ assistant</h3>
          <p className="mt-1 text-xs text-muted-foreground">Answers from our FAQ only — for quotes, speak to a broker.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. licensed, secure, quote"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button type="button" className="rounded-lg bg-primary-600 p-2 text-white" aria-label="Search FAQ">
              <Send className="h-4 w-4" />
            </button>
          </div>
          {query.trim() && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
              {answer ? (
                <>
                  <p className="font-semibold text-surface-foreground">{answer.q}</p>
                  <p className="mt-1 text-muted-foreground">{answer.a}</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No FAQ match. Email{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary-600 underline">
                    {CONTACT_EMAIL}
                  </a>{" "}
                  or call{" "}
                  <a href={`tel:${CONTACT_PHONE_TEL}`} className="text-primary-600 underline">
                    us
                  </a>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
