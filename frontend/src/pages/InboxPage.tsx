import { useState, useEffect, useRef } from "react";
import { Send, Mail, MailOpen, Paperclip, RefreshCw, MessageSquarePlus } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  message_type: string;
  created_at: string;
  sender?: { full_name: string; role: string };
}

export function InboxPage() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [compose, setCompose] = useState({ subject: "", body: "", recipientEmail: "" });
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    const query = tab === "inbox"
      ? db.inboxMessages().select("*, sender:profiles!inbox_messages_sender_id_fkey(full_name, role)").eq("recipient_id", user.id).order("created_at", { ascending: false })
      : db.inboxMessages().select("*, sender:profiles!inbox_messages_sender_id_fkey(full_name, role)").eq("sender_id", user.id).order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error) setMessages((data as unknown as Message[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime new messages
    if (user) {
      channelRef.current = supabase
        .channel(`inbox:${user.id}`)
        .on("postgres_changes" as never, { event: "INSERT", schema: "public", table: "inbox_messages", filter: `recipient_id=eq.${user.id}` }, () => {
          fetchMessages();
          toast("New message received!", { icon: "✉️" });
        })
        .subscribe();
    }

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [user, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const markRead = async (msg: Message) => {
    setSelected(msg);
    if (!msg.is_read && msg.recipient_id === user?.id) {
      await db.inboxMessages().update({ is_read: true }).eq("id", msg.id);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
    }
  };

  const sendMessage = async () => {
    if (!user || !compose.subject.trim() || !compose.body.trim()) {
      toast.error("Subject and body are required.");
      return;
    }

    setSending(true);
    try {
      const { data: recipient } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", compose.recipientEmail.trim())
        .single();

      if (!recipient) {
        toast.error("Recipient not found.");
        return;
      }

      const { error } = await db.inboxMessages().insert({
        sender_id: user.id,
        recipient_id: (recipient as { id: string }).id,
        subject: compose.subject.trim(),
        body: compose.body.trim(),
      });

      if (error) throw error;

      toast.success("Message sent.");
      setComposing(false);
      setCompose({ subject: "", body: "", recipientEmail: "" });
      if (tab === "sent") fetchMessages();
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read && m.recipient_id === user?.id).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Secure Inbox</h2>
          <p className="text-muted-foreground">
            Private messages between brokers and clients
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMessages}
            aria-label="Refresh messages"
            className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
        {(["inbox", "sent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelected(null); }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize cursor-pointer transition-colors duration-200 ${
              tab === t ? "bg-surface text-surface-foreground shadow-sm" : "text-muted-foreground hover:text-surface-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Message list */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-surface overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => markRead(msg)}
                  className={`w-full text-left px-4 py-4 hover:bg-primary-50/50 cursor-pointer transition-colors duration-150 ${selected?.id === msg.id ? "bg-primary-50/80" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {tab === "inbox" && (
                      msg.is_read
                        ? <MailOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        : <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${!msg.is_read && tab === "inbox" ? "font-semibold text-surface-foreground" : "font-medium text-surface-foreground"}`}>
                        {msg.sender?.full_name ?? profile?.full_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{msg.subject}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface">
          {selected ? (
            <div className="p-6 space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold text-surface-foreground">{selected.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  From: <span className="font-medium text-surface-foreground">{selected.sender?.full_name}</span>
                  {" · "}
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-surface-foreground whitespace-pre-wrap leading-relaxed">{selected.body}</p>
              <div className="pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setComposing(true);
                    setCompose((prev) => ({ ...prev, subject: `Re: ${selected.subject}` }));
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                >
                  <Send className="h-4 w-4" />
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center text-muted-foreground p-8">
              <div className="text-center">
                <Mail className="mx-auto h-10 w-10 mb-3 opacity-40" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-surface-foreground">New Message</h3>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To (email)</label>
              <input
                type="email"
                value={compose.recipientEmail}
                onChange={(e) => setCompose((p) => ({ ...p, recipientEmail: e.target.value }))}
                placeholder="client@email.com"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Subject</label>
              <input
                type="text"
                value={compose.subject}
                onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Your policy renewal…"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Message</label>
              <textarea
                rows={5}
                value={compose.body}
                onChange={(e) => setCompose((p) => ({ ...p, body: e.target.value }))}
                placeholder="Write your message here…"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
                title="Attach file (coming soon)"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setComposing(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
