import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Send, MessageSquare, Plus, Database } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/db";
import { StatusPill } from "../components/StatusPill";

type ThreadRow = {
  id: string;
  subject: string;
  policyRef: string;
  lastAt: Date;
  unread: number;
  preview: string;
  clientId: string;
};

type MsgRow = {
  id: string;
  from: string;
  body: string;
  at: Date;
  mine: boolean;
};

const MOCK_THREADS: ThreadRow[] = [
  {
    id: "mock-t1",
    subject: "Motor renewal — MUA",
    policyRef: "MOT-2024-8841",
    lastAt: new Date(Date.now() - 1000 * 60 * 45),
    unread: 1,
    preview: "We received your NCB certificate…",
    clientId: "",
  },
];

const MOCK_MSGS: MsgRow[] = [
  { id: "m1", from: "Broker", body: "Good afternoon — we received your NCB certificate.", at: new Date(Date.now() - 1000 * 60 * 120), mine: false },
  { id: "m2", from: "You", body: "Thanks — let me know if anything else is needed.", at: new Date(Date.now() - 1000 * 60 * 90), mine: true },
];

const MESSAGE_SNIPPETS = [
  "Please confirm the bank details on file before we issue the renewal debit.",
  "We still need a copy of your NCB letter dated within the last 12 months.",
  "Your renewal quote is ready — reply if you would like us to bind cover today.",
  "Payment was received — thank you. We will email the schedule within one business day.",
];

export function SecureMessagesPage() {
  const { user, profile, session, demoAuthActive } = useAuth();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<MsgRow[]>([]);
  const [draft, setDraft] = useState("");
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [policies, setPolicies] = useState<Array<{ id: string; policy_number: string; client_id: string }>>([]);
  const [newPolicyId, setNewPolicyId] = useState<string>("");

  const loadThreads = useCallback(async () => {
    if (!user) {
      setThreads([]);
      setLoading(false);
      return;
    }
    if (demoAuthActive || !session) {
      setThreads(MOCK_THREADS);
      setActive(MOCK_THREADS[0]?.id ?? null);
      setLive(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = db.secureThreads().select("id, subject, client_id, updated_at, policy_id, policies(policy_number)").order("updated_at", { ascending: false });
    const { data, error } = profile?.role === "client" ? await q.eq("client_id", user.id) : await q;
    if (error || !data) {
      setThreads(MOCK_THREADS);
      setActive(MOCK_THREADS[0]?.id ?? null);
      setLive(false);
      setLoading(false);
      if (error) toast.error("Could not load threads — demo data.");
      return;
    }
    const mapped: ThreadRow[] = (data as Array<Record<string, unknown>>).map((t) => {
      const pol = t.policies as { policy_number?: string } | null;
      return {
        id: t.id as string,
        subject: t.subject as string,
        policyRef: pol?.policy_number ?? "—",
        lastAt: new Date(t.updated_at as string),
        unread: 0,
        preview: "",
        clientId: t.client_id as string,
      };
    });
    setThreads(mapped);
    setActive(mapped[0]?.id ?? null);
    setLive(true);
    setLoading(false);
  }, [user, profile?.role, session, demoAuthActive]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!user || demoAuthActive || !session) return;
    const uid = user.id;
    const q = db.policies().select("id, policy_number, client_id").order("policy_number");
    void (profile?.role === "client" ? q.eq("client_id", uid) : q).then((res: { data: unknown }) => {
      const data = res.data as Array<{ id: string; policy_number: string; client_id: string }> | null | undefined;
      if (data?.length) {
        setPolicies(data);
        setNewPolicyId(data[0]!.id);
      }
    });
  }, [user, profile?.role, session, demoAuthActive]);

  const loadMessages = useCallback(async () => {
    if (!active || demoAuthActive || !session) {
      setMessages(active?.startsWith("mock") ? MOCK_MSGS : []);
      return;
    }
    const uid = user?.id;
    if (!uid) {
      setMessages([]);
      return;
    }
    const { data, error } = await db
      .secureMessages()
      .select("id, body, created_at, sender_id, sender:profiles!secure_messages_sender_id_fkey(full_name)")
      .eq("thread_id", active)
      .order("created_at", { ascending: true });
    if (error || !data) {
      setMessages([]);
      return;
    }
    setMessages(
      (data as Array<Record<string, unknown>>).map((m) => {
        const snd = m.sender as { full_name?: string } | null;
        const sid = m.sender_id as string;
        return {
          id: m.id as string,
          from: sid === uid ? "You" : snd?.full_name ?? "User",
          body: m.body as string,
          at: new Date(m.created_at as string),
          mine: sid === uid,
        };
      }),
    );
  }, [active, user?.id, session, demoAuthActive]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const thread = useMemo(() => threads.find((t) => t.id === active) ?? threads[0], [threads, active]);

  const send = async () => {
    if (!draft.trim() || !user || !active) return;
    if (demoAuthActive || !session) {
      toast.success("Message queued (demo).");
      setDraft("");
      return;
    }
    const { error } = await db.secureMessages().insert({ thread_id: active, sender_id: user.id, body: draft.trim() });
    if (error) toast.error(error.message);
    else {
      toast.success("Sent.");
      setDraft("");
      void loadMessages();
      void loadThreads();
    }
  };

  const createThread = async () => {
    if (!user || !newSubject.trim() || !newBody.trim()) {
      toast.error("Subject and first message are required.");
      return;
    }
    const clientId =
      profile?.role === "client"
        ? user.id
        : (policies.find((p) => p.id === newPolicyId)?.client_id ?? "");
    if (!clientId) {
      toast.error("Choose a policy so we know which client owns the thread.");
      return;
    }
    if (demoAuthActive || !session) {
      toast.success("Thread created (demo).");
      setShowNew(false);
      return;
    }
    const pid = newPolicyId || null;
    const { data: ins, error } = await db
      .secureThreads()
      .insert({ client_id: clientId, subject: newSubject.trim(), policy_id: pid })
      .select("id")
      .single();
    if (error || !ins) {
      toast.error(error?.message ?? "Failed to create thread");
      return;
    }
    const tid = (ins as { id: string }).id;
    await db.secureMessages().insert({ thread_id: tid, sender_id: user.id, body: newBody.trim() });
    toast.success("Thread started.");
    setNewSubject("");
    setNewBody("");
    setShowNew(false);
    await loadThreads();
    setActive(tid);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-600/90 dark:text-primary-400/90">Encrypted threads</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-surface-foreground sm:text-3xl">Secure messaging</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Backed by <code className="text-xs">secure_threads</code> and <code className="text-xs">secure_messages</code>. Demo login uses local mock threads.
          </p>
        </div>
        <StatusPill
          tone={live ? "success" : "neutral"}
          icon={<Database className="h-3.5 w-3.5" aria-hidden />}
          label={loading ? "Loading…" : live ? "Live data" : "Demo / offline"}
        />
      </div>

      {showNew && (
        <div className="dashboard-panel rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-surface-foreground">New thread</h3>
          <input
            className="w-full rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          {policies.length > 0 && (
            <select className="w-full rounded-xl border border-border px-3 py-2 text-sm" value={newPolicyId} onChange={(e) => setNewPolicyId(e.target.value)}>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.policy_number}
                </option>
              ))}
            </select>
          )}
          <textarea className="w-full rounded-xl border border-border px-3 py-2 text-sm min-h-[80px]" placeholder="First message" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-sm" onClick={() => setShowNew(false)}>
              Cancel
            </button>
            <button type="button" className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white" onClick={() => void createThread()}>
              Create
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="dashboard-panel w-full shrink-0 rounded-2xl lg:max-w-xs">
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-surface-foreground">Threads</h3>
            <button type="button" className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-2 py-1 text-xs font-semibold text-white" onClick={() => setShowNew((s) => !s)}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New
            </button>
          </div>
          <ul className="max-h-[min(60vh,28rem)] divide-y divide-border/80 overflow-y-auto">
            {threads.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                <p>No threads yet.</p>
                <p className="mt-1 text-xs">Start a secure thread to keep claim and renewal context in one place.</p>
              </li>
            ) : threads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition-colors ${
                    t.id === active ? "bg-primary-50/80 dark:bg-primary-950/40" : "hover:bg-muted/50"
                  }`}
                >
                  <span className="font-semibold text-surface-foreground">{t.subject}</span>
                  <span className="text-xs text-muted-foreground">{t.policyRef}</span>
                  <span className="flex items-center justify-between text-[11px] text-muted-foreground">
                    {format(t.lastAt, "MMM d, HH:mm")}
                    {t.unread > 0 && <span className="rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{t.unread}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="dashboard-panel flex min-h-[min(70vh,32rem)] flex-1 flex-col rounded-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-6">
            <div>
              <h3 className="font-semibold text-surface-foreground">{thread?.subject ?? "—"}</h3>
              <p className="text-xs text-muted-foreground">{thread?.policyRef}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-accent-200/80 bg-accent-50/90 px-2.5 py-1 text-[11px] font-semibold text-accent-800 dark:border-accent-700/50 dark:bg-accent-950/40 dark:text-accent-200">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              TLS + at-rest
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
                No messages yet. Send the first secure message to begin this thread.
              </div>
            ) : messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[75%] ${
                  m.mine ? "ml-auto bg-primary-600 text-white" : "mr-auto border border-border bg-muted/40 text-surface-foreground dark:bg-muted/25"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/15 text-[10px] font-bold text-current">
                    {m.from.charAt(0).toUpperCase()}
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{m.from}</p>
                </div>
                <p className="mt-1 leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[10px] ${m.mine ? "text-primary-100" : "text-muted-foreground"}`}>{format(m.at, "HH:mm")}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-border/80 p-3 sm:p-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Quick phrases (tap to append)</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {MESSAGE_SNIPPETS.map((snippet) => (
                <button
                  key={snippet}
                  type="button"
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-left text-xs text-surface-foreground hover:bg-muted"
                  onClick={() => setDraft((d) => (d ? `${d.trim()}\n\n${snippet}` : snippet))}
                >
                  {snippet.slice(0, 42)}
                  {snippet.length > 42 ? "…" : ""}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  className="w-full rounded-xl border border-border/90 bg-surface py-2.5 pl-10 pr-3 text-sm text-surface-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 focus:outline-none"
                  placeholder="Type a secure reply…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), void send())}
                />
              </div>
              <button type="button" onClick={() => void send()} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
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
