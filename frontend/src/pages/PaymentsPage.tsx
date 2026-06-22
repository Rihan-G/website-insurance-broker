import { useState, useEffect } from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { CreditCard, Plus, Copy, CheckCircle, Clock, XCircle, Download, ExternalLink, RefreshCw } from "lucide-react";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { logAudit } from "../lib/auditService";
import { generateReceipt } from "../lib/pdfService";
import { exportToCsv, formatPaymentsForExport } from "../lib/exportService";
import { COMPANY_NAME, PAYMENTS_BASE_URL, CONTACT_PHONE_DISPLAY } from "../lib/branding";
import toast from "react-hot-toast";

interface Payment {
  id: string;
  client_id: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  payment_link: string | null;
  link_expires_at: string | null;
  paid_at: string | null;
  description: string | null;
  created_at: string;
  client?: { full_name: string; email: string };
}

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  paid: CheckCircle,
  pending: Clock,
  failed: XCircle,
  expired: XCircle,
  refunded: RefreshCw,
};

const statusStyles: Record<string, string> = {
  paid: "bg-accent-50 text-accent-600",
  pending: "bg-warning-50 text-warning-600",
  failed: "bg-danger-50 text-danger-600",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-primary-50 text-primary-700",
};

const gatewayLabels: Record<string, string> = {
  mcb_juice: "MCB Juice",
  mips: "MIPS",
  sbm: "SBM Gateway",
  paypal: "PayPal",
  dpo: "DPO Pay",
};

export function PaymentsPage() {
  usePageMeta({ title: "Payments — Sindicom Portal" });
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientEmail: "",
    amount: "",
    currency: "MUR",
    gateway: "mcb_juice",
    description: "",
    expiryDays: "7",
  });

  const isAdminOrBroker = profile?.role === "admin" || profile?.role === "broker";

  const fetchPayments = async () => {
    if (!user) return;
    setLoading(true);
    const query = isAdminOrBroker
      ? db.payments().select("*, client:profiles!payments_client_id_fkey(full_name, email)").order("created_at", { ascending: false }).limit(100)
      : db.payments().select("*, client:profiles!payments_client_id_fkey(full_name, email)").eq("client_id", user.id).order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error) setPayments((data as unknown as Payment[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-poll pending payments every 30 seconds to update their status
  useEffect(() => {
    const hasPending = payments.some((p) => p.status === "pending");
    if (!hasPending) return;
    const interval = setInterval(() => {
      // Simulate gateway callback: randomly mark a pending payment as paid
      setPayments((prev) =>
        prev.map((p) => {
          if (p.status !== "pending") return p;
          const isExpired = p.link_expires_at && new Date(p.link_expires_at) < new Date();
          if (isExpired) return { ...p, status: "expired" };
          return p;
        })
      );
      // In production this would call: db.payments().select().eq("status", "pending") + gateway status API
    }, 30000);
    return () => clearInterval(interval);
  }, [payments]);

  const createPaymentLink = async () => {
    if (!user) return;
    if (!form.clientEmail || !form.amount) {
      toast.error("Client email and amount are required.");
      return;
    }

    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be a positive number.");
      return;
    }
    if (parsedAmount > 10_000_000) {
      toast.error("Amount exceeds the maximum allowed (MUR 10,000,000).");
      return;
    }

    setCreating(true);
    try {
      const { data: clientData } = await db.profiles().select("id").eq("email", form.clientEmail).single();
      if (!clientData) { toast.error("Client not found."); setCreating(false); return; }

      const expiresAt = new Date(Date.now() + Number(form.expiryDays) * 86400000).toISOString();
      // Use a cryptographically secure token — never Math.random() for payment links
      const secureToken = crypto.randomUUID().replace(/-/g, "");
      const paymentLink = `${PAYMENTS_BASE_URL}/${secureToken}`;

      const { data: payment, error } = await db.payments().insert({
        client_id: (clientData as { id: string }).id,
        amount: parsedAmount,
        currency: form.currency,
        gateway: form.gateway,
        description: form.description || "Insurance Premium Payment",
        payment_link: paymentLink,
        link_expires_at: expiresAt,
        created_by: user.id,
      }).select().single();

      if (error) throw error;
      await logAudit(user.id, "payment.created", "payment", (payment as { id: string }).id, { amount: form.amount, gateway: form.gateway });

      toast.success("Payment link created.");
      setShowForm(false);
      setForm({ clientEmail: "", amount: "", currency: "MUR", gateway: "mcb_juice", description: "", expiryDays: "7" });
      fetchPayments();
    } catch {
      toast.error("Failed to create payment link.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied!");
  };

  const downloadReceipt = (p: Payment) => {
    const epoch = new Date(p.created_at).getTime();
    void generateReceipt({
      receiptNumber: `REC-${epoch.toString(36).toUpperCase().slice(-8)}`,
      clientName: p.client?.full_name ?? "Client",
      clientEmail: p.client?.email ?? "",
      policyNumber: "POL-000000",
      productType: p.description ?? "Insurance Premium",
      insurer: "Various",
      amount: p.amount,
      currency: p.currency,
      gateway: p.gateway,
      paidAt: p.paid_at ?? p.created_at,
      brokerName: COMPANY_NAME,
      brokerPhone: CONTACT_PHONE_DISPLAY,
    })
      .then(() => toast.success("Receipt downloaded."))
      .catch(() => toast.error("Could not generate receipt."));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-foreground">Payments</h2>
          <p className="text-muted-foreground">Manage payment links and track transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { exportToCsv(formatPaymentsForExport(payments), "payments"); toast.success("Exported."); }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted cursor-pointer transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {isAdminOrBroker && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              New Payment Link
            </button>
          )}
        </div>
      </div>

      {/* Gateways info banner */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { name: "MCB Juice", desc: "Recommended · 500K+ users", tag: "Best for locals", color: "border-accent-200 bg-accent-50" },
          { name: "MIPS", desc: "Cards + QR + wallets", tag: "Multi-channel", color: "border-primary-200 bg-primary-50" },
          { name: "SBM Gateway", desc: "Corporate-oriented", tag: "For businesses", color: "border-warning-200 bg-warning-50" },
        ].map((g) => (
          <div key={g.name} className={`rounded-xl border p-4 ${g.color}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-surface-foreground">{g.name}</p>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-surface-foreground">{g.tag}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted text-left">
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Client</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Amount</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Gateway</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Status</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Expires</th>
                  <th className="px-6 py-3 font-semibold text-surface-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => {
                  const Icon = statusIcons[p.status] ?? Clock;
                  return (
                    <tr key={p.id} className="hover:bg-primary-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <p className="font-medium text-surface-foreground">{p.client?.full_name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{p.client?.email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-surface-foreground">
                        {p.currency} {p.amount.toLocaleString("en-MU", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{gatewayLabels[p.gateway] ?? p.gateway}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[p.status] ?? ""}`}>
                          <Icon className="h-3 w-3" />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {p.link_expires_at ? new Date(p.link_expires_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {p.payment_link && (
                            <>
                              <button onClick={() => copyLink(p.payment_link!, p.id)} aria-label="Copy payment link" className="rounded-lg p-2 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
                                {copiedId === p.id ? <CheckCircle className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                              <a href={p.payment_link} target="_blank" rel="noopener noreferrer" aria-label="Open payment link in new tab" className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors duration-200">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </>
                          )}
                          {p.status === "paid" && (
                            <button onClick={() => downloadReceipt(p)} aria-label="Download receipt" className="rounded-lg p-2 text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200">
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div className="py-12 text-center">
                <CreditCard className="mx-auto h-10 w-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground">No payments yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create payment form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-surface-foreground">Create Payment Link</h3>
            {[
              { label: "Client Email", key: "clientEmail", type: "email", placeholder: "client@email.com" },
              { label: "Amount", key: "amount", type: "number", placeholder: "5000.00" },
              { label: "Description", key: "description", type: "text", placeholder: "Motor insurance premium" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-surface-foreground mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-foreground mb-1.5">Currency</label>
                <select aria-label="Select currency" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none">
                  <option>MUR</option><option>USD</option><option>GBP</option><option>EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-foreground mb-1.5">Gateway</label>
                <select aria-label="Select payment gateway" value={form.gateway} onChange={(e) => setForm((p) => ({ ...p, gateway: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none">
                  <option value="mcb_juice">MCB Juice</option>
                  <option value="mips">MIPS</option>
                  <option value="sbm">SBM</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-foreground mb-1.5">Link Expiry (days)</label>
              <input type="number" aria-label="Link expiry in days" placeholder="7" min="1" max="30" value={form.expiryDays} onChange={(e) => setForm((p) => ({ ...p, expiryDays: e.target.value }))} className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted cursor-pointer transition-colors duration-200">Cancel</button>
              <button onClick={createPaymentLink} disabled={creating} className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer transition-colors duration-200">
                {creating ? "Creating…" : "Create Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
