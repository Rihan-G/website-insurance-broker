import { useMemo, useState } from "react";
import { Lock, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Thread {
  id: string;
  title: string;
  policyRef: string;
  lastAt: Date;
  unread: number;
  preview: string;
}

interface ChatMessage {
  id: string;
  from: "You" | "Broker";
  body: string;
  at: Date;
}

const THREADS: Thread[] = [
  {
    id: "t1",
    title: "Motor renewal — MUA",
    policyRef: "MOT-2024-8841",
    lastAt: new Date(Date.now() - 1000 * 60 * 45),
    unread: 1,
    preview: "We received your NCB certificate…",
  },
  {
    id: "t2",
    title: "Home claim query",
    policyRef: "HOM-2023-1202",
    lastAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    unread: 0,
    preview: "Please upload photos of the damaged gate.",
  },
];

const MOCK_CHAT: Record<string, ChatMessage[]> = {
  t1: [
    { id: "m1", from: "Broker", body: "Good afternoon — we received your NCB certificate.", at: new Date(Date.now() - 1000 * 60 * 120) },
    { id: "m2", from: "You", body: "Thanks — let me know if anything else is needed.", at: new Date(Date.now() - 1000 * 60 * 90) },
    { id: "m3", from: "Broker", body: "All set on our side. Renewal quote follows tomorrow.", at: new Date(Date.now() - 1000 * 60 * 45) },
  ],
  t2: [
    { id: "m1", from: "Broker", body: "Please upload clear photos of the damaged gate (wide + close-up).", at: new Date(Date.now() - 1000 * 60 * 60 * 26) },
  ],
};

export function SecureMessagesPage() {
  const [active, setActive] = useState(THREADS[0]!.id);
  const [draft, setDraft] = useState("");

  const thread = useMemo(() => THREADS.find((t) => t.id === active) ?? THREADS[0]!, [active]);
  const messages = MOCK_CHAT[active] ?? [];

  const send = () => {
    if (!draft.trim()) return;
    toast.success("Message queued — end-to-end encryption would apply in production (demo).");
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Encrypted threads</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Secure messaging</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Policy-scoped threads with audit trail. Shown with demo content; wire to your messaging backend when ready.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="dashboard-panel w-full shrink-0 rounded-2xl lg:max-w-xs">
          <div className="border-b border-border/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-surface-foreground">Threads</h3>
          </div>
          <ul className="max-h-[min(60vh,28rem)] divide-y divide-border/80 overflow-y-auto">
            {THREADS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition-colors ${
                    t.id === active ? "bg-primary-50/80 dark:bg-primary-950/40" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="font-semibold text-surface-foreground">{t.title}</span>
                  <span className="text-xs text-muted-foreground">{t.policyRef}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{t.preview}</span>
                  <span className="flex items-center justify-between text-[11px] text-muted-foreground">
                    {format(t.lastAt, "MMM d, HH:mm")}
                    {t.unread > 0 && (
                      <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{t.unread}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="dashboard-panel flex min-h-[min(70vh,32rem)] flex-1 flex-col rounded-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-6">
            <div>
              <h3 className="font-semibold text-surface-foreground">{thread.title}</h3>
              <p className="text-xs text-muted-foreground">{thread.policyRef}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-accent-200/80 bg-accent-50/90 px-2.5 py-1 text-[11px] font-semibold text-accent-800 dark:border-accent-700/50 dark:bg-accent-950/40 dark:text-accent-200">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              TLS + at-rest
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[75%] ${
                  m.from === "You"
                    ? "ml-auto bg-primary-600 text-white"
                    : "mr-auto border border-border bg-muted/40 text-surface-foreground dark:bg-muted/25"
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{m.from}</p>
                <p className="mt-1 leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[10px] ${m.from === "You" ? "text-primary-100" : "text-muted-foreground"}`}>{format(m.at, "HH:mm")}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border/80 p-3 sm:p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  className="w-full rounded-xl border border-border/90 bg-surface py-2.5 pl-10 pr-3 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none"
                  placeholder="Type a secure reply…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                />
              </div>
              <button type="button" onClick={send} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                <Send className="h-4 w-4" aria-hidden />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
