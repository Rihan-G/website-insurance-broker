import { useState } from "react";
import { MessageCircle, Users, CheckCircle, ExternalLink, Zap } from "lucide-react";
import toast from "react-hot-toast";

const templates = [
  {
    id: "renewal",
    name: "Policy Renewal Reminder",
    preview: "Hi [Name], your [Product] policy expires on [Date]. Click here to renew: [Link]",
    variables: ["Name", "Product", "Date", "Link"],
  },
  {
    id: "payment",
    name: "Payment Due",
    preview: "Dear [Name], your insurance premium of MUR [Amount] is due on [Date]. Pay here: [Link]",
    variables: ["Name", "Amount", "Date", "Link"],
  },
  {
    id: "welcome",
    name: "Welcome Message",
    preview: "Welcome to SecureBroker, [Name]! Your policy [PolicyNo] is now active. Contact us: +230 XXXX XXXX",
    variables: ["Name", "PolicyNo"],
  },
  {
    id: "document",
    name: "Document Request",
    preview: "Hi [Name], we need [DocumentType] to complete your [Product] application. Please upload: [Link]",
    variables: ["Name", "DocumentType", "Product", "Link"],
  },
  {
    id: "receipt",
    name: "Payment Confirmed",
    preview: "Payment received! MUR [Amount] for [Product] policy [PolicyNo]. Receipt: [ReceiptLink]",
    variables: ["Amount", "Product", "PolicyNo", "ReceiptLink"],
  },
];

const mockLog = [
  { id: "1", client: "Marie Dupont", phone: "+230 5729 1234", template: "Policy Renewal Reminder", status: "delivered", sentAt: "2025-01-15 10:32" },
  { id: "2", client: "Jean-Pierre R.", phone: "+230 5834 5678", template: "Payment Due", status: "sent", sentAt: "2025-01-15 09:15" },
  { id: "3", client: "Priya Devi", phone: "+230 5912 3456", template: "Document Request", status: "failed", sentAt: "2025-01-14 16:45" },
];

const statusStyles: Record<string, string> = {
  delivered: "bg-accent-50 text-accent-600",
  sent: "bg-primary-50 text-primary-600",
  failed: "bg-danger-50 text-danger-600",
  queued: "bg-warning-50 text-warning-600",
};

export function WhatsAppPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [recipient, setRecipient] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"compose" | "log" | "setup">("compose");

  const preview = selectedTemplate
    ? selectedTemplate.preview.replace(/\[(\w+)\]/g, (_, key) => variables[key] || `[${key}]`)
    : "";

  const handleSend = async () => {
    if (!selectedTemplate || !recipient) {
      toast.error("Select a template and enter a recipient.");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    toast.success(`WhatsApp message sent to ${recipient}.`);
    setRecipient("");
    setVariables({});
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">WhatsApp Integration</h2>
          <p className="text-muted-foreground">Send automated messages via WhatsApp Business API</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
          <span className="text-xs font-medium text-accent-700">WhatsApp Business API ready</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
        {(["compose", "log", "setup"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize cursor-pointer transition-colors duration-200 ${
              tab === t ? "bg-surface text-surface-foreground shadow-sm" : "text-muted-foreground hover:text-surface-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "compose" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-3">Message Template</label>
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t); setVariables({}); }}
                    className={`w-full text-left rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                      selectedTemplate?.id === t.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-border hover:border-primary-300 hover:bg-primary-50/30"
                    }`}
                  >
                    <p className="font-medium text-surface-foreground">{t.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{t.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <div>
                <label className="block text-sm font-medium text-surface-foreground mb-3">Fill Variables</label>
                <div className="space-y-3">
                  {selectedTemplate.variables.map((v) => (
                    <div key={v}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">[{v}]</label>
                      <input
                        type="text"
                        value={variables[v] ?? ""}
                        onChange={(e) => setVariables((p) => ({ ...p, [v]: e.target.value }))}
                        placeholder={`Enter ${v}…`}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-surface-foreground">
                  {bulkMode ? "Recipients (one per line)" : "Recipient Phone / Email"}
                </label>
                <button
                  onClick={() => setBulkMode(!bulkMode)}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline cursor-pointer"
                >
                  <Users className="h-3.5 w-3.5" />
                  {bulkMode ? "Single" : "Bulk"}
                </button>
              </div>
              {bulkMode ? (
                <textarea
                  rows={4}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+230 5729 1234&#10;+230 5834 5678"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none resize-none font-mono"
                />
              ) : (
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="+230 5XXX XXXX or email@example.com"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                />
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !selectedTemplate || !recipient}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-semibold text-white hover:bg-[#1ebe5d] disabled:opacity-50 cursor-pointer transition-colors duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              {sending ? "Sending…" : bulkMode ? "Send Bulk Message" : "Send WhatsApp"}
            </button>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold text-surface-foreground mb-4">Message Preview</h3>
            <div className="rounded-2xl bg-[#e5ddd5] p-4 min-h-48">
              {preview ? (
                <div className="max-w-64 ml-auto rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{preview}</p>
                  <p className="mt-2 text-right text-xs text-gray-400">10:32 ✓✓</p>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-center text-muted-foreground">
                  <div>
                    <MessageCircle className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">Select a template to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "log" && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Client</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Phone</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Template</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Status</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLog.map((l) => (
                  <tr key={l.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-medium text-surface-foreground">{l.client}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{l.phone}</td>
                    <td className="px-6 py-4 text-surface-foreground">{l.template}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[l.status] ?? ""}`}>{l.status}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{l.sentAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "setup" && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-5">
            <h3 className="font-semibold text-surface-foreground">WhatsApp Business API Configuration</h3>
            <div className="rounded-lg bg-primary-50 border border-primary-200 p-4 text-sm text-primary-800">
              <Zap className="inline h-4 w-4 mr-1" />
              Connect via the official <strong>WhatsApp Business API</strong> or a BSP partner (e.g. Twilio, 360dialog, Vonage).
            </div>
            {[
              { label: "Phone Number ID", placeholder: "1234567890XXXX", type: "text" },
              { label: "WhatsApp Business Account ID", placeholder: "WABA_XXXXXXXX", type: "text" },
              { label: "Access Token", placeholder: "EAAxxxxx…", type: "password" },
              { label: "Webhook Verify Token", placeholder: "my-secure-verify-token", type: "text" },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-sm font-medium text-surface-foreground mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none font-mono" />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200">
                <CheckCircle className="h-4 w-4" />
                Save & Test Connection
              </button>
              <a href="https://developers.facebook.com/docs/whatsapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors duration-200">
                <ExternalLink className="h-4 w-4" />
                WhatsApp API Docs
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <h3 className="font-semibold text-surface-foreground">Automation Rules</h3>
            {[
              { label: "Send renewal reminder", desc: "30 days before policy expiry", enabled: true },
              { label: "Payment confirmation", desc: "Immediately after payment", enabled: true },
              { label: "Welcome message", desc: "When new client is created", enabled: false },
              { label: "Document request", desc: "When document is rejected", enabled: true },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors duration-150">
                <div>
                  <p className="text-sm font-medium text-surface-foreground">{rule.label}</p>
                  <p className="text-xs text-muted-foreground">{rule.desc}</p>
                </div>
                <div className={`h-5 w-10 rounded-full flex items-center px-0.5 ${rule.enabled ? "bg-accent-500" : "bg-gray-300"}`}>
                  <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${rule.enabled ? "translate-x-5" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
