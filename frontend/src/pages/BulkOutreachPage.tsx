import { addDays, differenceInCalendarDays, format } from "date-fns";
import { useState } from "react";
import { Send, MessageCircle, Mail, CheckSquare, Square, Users, Copy, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";

type ClientRow = {
  id: string;
  name: string;
  product: string;
  policyNumber: string;
  endDate: Date;
  email: string;
  phone: string;
};

const DEMO_CLIENTS: ClientRow[] = [
  { id: "c1", name: "Marie Dupont", product: "Motor — Comprehensive", policyNumber: "MOT-2024-8841", endDate: addDays(new Date(), 7), email: "marie.d@example.mu", phone: "2305551001" },
  { id: "c2", name: "Ahmed Boolell", product: "Home — Building", policyNumber: "HOM-2023-1120", endDate: addDays(new Date(), 12), email: "ahmed.b@example.mu", phone: "2305551002" },
  { id: "c3", name: "Priya Devi", product: "Health — Group", policyNumber: "HLT-2024-0432", endDate: addDays(new Date(), 18), email: "priya.d@example.mu", phone: "2305551003" },
  { id: "c4", name: "Jean-Pierre R.", product: "Business — Liability", policyNumber: "BUS-2024-3310", endDate: addDays(new Date(), 22), email: "jp.r@example.mu", phone: "2305551004" },
  { id: "c5", name: "Sophie Chen", product: "Life — Term", policyNumber: "LIF-2022-0891", endDate: addDays(new Date(), 28), email: "sophie.c@example.mu", phone: "2305551005" },
];

type Channel = "whatsapp" | "email";

function buildWhatsAppMessage(client: ClientRow): string {
  const days = differenceInCalendarDays(client.endDate, new Date());
  return `Hi ${client.name.split(" ")[0]}, this is a reminder from Sindicom Brokers. Your ${client.product} policy (${client.policyNumber}) is due for renewal on ${format(client.endDate, "dd MMM yyyy")} — in ${days} day${days !== 1 ? "s" : ""}. Please contact us to renew. Thank you.`;
}

function buildEmailDraft(client: ClientRow): string {
  const days = differenceInCalendarDays(client.endDate, new Date());
  return `Subject: Renewal reminder — ${client.product} (${client.policyNumber})\n\nDear ${client.name},\n\nYour ${client.product} policy (${client.policyNumber}) is due for renewal on ${format(client.endDate, "dd MMM yyyy")}, in ${days} day${days !== 1 ? "s" : ""}.\n\nPlease contact your advisor at Sindicom Brokers to discuss renewal options.\n\nKind regards,\nSindicom Brokers Ltd`;
}

export function BulkOutreachPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = DEMO_CLIENTS.filter(
    (c) => differenceInCalendarDays(c.endDate, new Date()) <= daysFilter,
  );

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((c) => c.id)));
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedClients = filtered.filter((c) => selected.has(c.id));

  const handleSendAll = () => {
    if (selectedClients.length === 0) return;
    if (channel === "whatsapp") {
      selectedClients.forEach((c) => {
        const msg = encodeURIComponent(buildWhatsAppMessage(c));
        window.open(`https://wa.me/${c.phone}?text=${msg}`, "_blank", "noopener");
      });
      toast.success(`Opened ${selectedClients.length} WhatsApp conversation${selectedClients.length !== 1 ? "s" : ""}`);
    } else {
      const drafts = selectedClients.map(buildEmailDraft).join("\n\n---\n\n");
      void navigator.clipboard.writeText(drafts).then(() => {
        toast.success(`${selectedClients.length} email draft${selectedClients.length !== 1 ? "s" : ""} copied to clipboard`);
      });
    }
  };

  const handleCopyOne = (client: ClientRow) => {
    const text = channel === "whatsapp" ? buildWhatsAppMessage(client) : buildEmailDraft(client);
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(client.id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Broker tools</p>
        <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Bulk outreach</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select clients with upcoming renewals and generate personalised reminders in one step.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {([30, 14, 7] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDaysFilter(d)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${daysFilter === d ? "bg-primary-600 text-white" : "text-muted-foreground hover:text-surface-foreground"}`}
            >
              ≤ {d} days
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setChannel("whatsapp")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${channel === "whatsapp" ? "bg-[#25D366] text-white" : "text-muted-foreground hover:text-surface-foreground"}`}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setChannel("email")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${channel === "email" ? "bg-primary-600 text-white" : "text-muted-foreground hover:text-surface-foreground"}`}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden /> Email
          </button>
        </div>

        <span className="text-xs text-muted-foreground">{filtered.length} client{filtered.length !== 1 ? "s" : ""} in range</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-3 border-b border-border/80 bg-muted/20 px-4 py-3">
          <button type="button" onClick={toggleAll} className="text-muted-foreground hover:text-surface-foreground transition-colors">
            {selected.size === filtered.length && filtered.length > 0
              ? <CheckSquare className="h-4 w-4 text-primary-600" aria-hidden />
              : <Square className="h-4 w-4" aria-hidden />}
            <span className="sr-only">Select all</span>
          </button>
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <Users className="inline h-3.5 w-3.5 mr-1" aria-hidden />
            {selected.size} selected
          </span>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={handleSendAll}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            {channel === "whatsapp" ? "Open WhatsApp" : "Copy drafts"} ({selected.size})
          </button>
        </div>

        <ul className="divide-y divide-border/70">
          {filtered.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-muted-foreground">No renewals in this range.</li>
          ) : (
            filtered.map((c) => {
              const days = differenceInCalendarDays(c.endDate, new Date());
              const urgent = days <= 7;
              return (
                <li key={c.id} className={`flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/20 ${selected.has(c.id) ? "bg-primary-50/60 dark:bg-primary-950/20" : ""}`}>
                  <button type="button" onClick={() => toggle(c.id)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary-600">
                    {selected.has(c.id)
                      ? <CheckSquare className="h-4 w-4 text-primary-600" aria-hidden />
                      : <Square className="h-4 w-4" aria-hidden />}
                    <span className="sr-only">Select {c.name}</span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <p className="text-sm font-semibold text-surface-foreground">{c.name}</p>
                      <span className={`text-xs font-bold ${urgent ? "text-danger-600 dark:text-danger-400" : "text-warning-600 dark:text-warning-400"}`}>
                        {days}d
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.product} · {c.policyNumber} · due {format(c.endDate, "dd MMM yyyy")}</p>
                    {channel === "whatsapp" ? (
                      <p className="mt-1.5 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                        {buildWhatsAppMessage(c)}
                      </p>
                    ) : (
                      <pre className="mt-1.5 whitespace-pre-wrap rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground font-sans">
                        {buildEmailDraft(c)}
                      </pre>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyOne(c)}
                    className="shrink-0 rounded-lg border border-border bg-surface p-1.5 text-muted-foreground hover:text-surface-foreground transition-colors"
                    aria-label={`Copy message for ${c.name}`}
                  >
                    {copied === c.id ? <CheckCheck className="h-3.5 w-3.5 text-accent-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
