import { useState, useEffect } from "react";
import { usePageMeta } from "../hooks/usePageMeta";
import { Link } from "react-router-dom";
import { FileText, CreditCard, MessageSquare, RefreshCw, Calendar, CalendarPlus, CheckCircle, Clock, AlertTriangle, ChevronRight, Download, FileWarning, FolderOpen, Gift, Users2, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { generatePolicyCertificate } from "../lib/pdfService";
import { downloadPolicyRenewalReminder } from "../lib/icsExport";
import { differenceInDays, format } from "date-fns";
import toast from "react-hot-toast";
import { ClaimsTimeline } from "../components/ClaimsTimeline";
import { RenewalCountdown } from "../components/RenewalCountdown";

interface Policy {
  id: string;
  policy_number: string;
  insurer: string;
  product_type: string;
  premium: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  paid_at: string | null;
}

interface ClaimIntakeRow {
  id: string;
  status: string;
  policy_number: string | null;
  created_at: string;
}

interface DocumentRow {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

interface QuoteRow {
  id: string;
  product_type: string;
  estimated_premium: number | null;
  status: string;
  created_at: string;
}

interface ReferralRow {
  id: string;
  referred_email: string;
  referred_name: string;
  code: string;
  status: "pending" | "contacted" | "converted";
  created_at: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-accent-50 text-accent-600",
  pending: "bg-warning-50 text-warning-600",
  expired: "bg-danger-50 text-danger-600",
  cancelled: "bg-muted text-muted-foreground",
};

export function ClientPortalPage() {
  usePageMeta({ title: "My Policies — Sindicom Portal" });
  const { user, profile, demoAuthActive } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [claimIntakes, setClaimIntakes] = useState<ClaimIntakeRow[]>([]);
  const [recentDocs, setRecentDocs] = useState<DocumentRow[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [referralForm, setReferralForm] = useState({ name: "", email: "" });
  const [submittingReferral, setSubmittingReferral] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      const [{ data: pols }, { data: pays }, { count }, { data: claims }, { data: docs }, { data: quotes }] = await Promise.all([
        supabase.from("policies").select("*").eq("client_id", user.id).order("end_date", { ascending: true }),
        db.payments().select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(50),
        db.inboxMessages().select("id", { count: "exact", head: true }).eq("recipient_id", user.id).eq("is_read", false),
        db
          .claimIntakes()
          .select("id, status, policy_number, created_at")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        db
          .documents()
          .select("id, file_name, status, created_at")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        db
          .quotes()
          .select("id, product_type, estimated_premium, status, created_at")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      setPolicies((pols as Policy[]) ?? []);
      setPayments((pays as Payment[]) ?? []);
      setClaimIntakes((claims as ClaimIntakeRow[]) ?? []);
      setRecentDocs((docs as DocumentRow[]) ?? []);
      setSavedQuotes((quotes as QuoteRow[]) ?? []);
      setUnreadMessages(count ?? 0);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  useEffect(() => {
    void loadReferrals();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadReferrals = async () => {
    if (!user) return;
    const { data } = await db.referrals().select("*").eq("referrer_id", user.id).order("created_at", { ascending: false });
    setReferrals((data as ReferralRow[]) ?? []);
  };

  const submitReferral = async () => {
    if (!user || !referralForm.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    setSubmittingReferral(true);
    const { error } = await db.referrals().insert({
      referrer_id: user.id,
      referred_email: referralForm.email.trim(),
      referred_name: referralForm.name.trim(),
    });
    setSubmittingReferral(false);
    if (error) {
      toast.error(error.message ?? "Failed to submit referral.");
      return;
    }
    setReferralForm({ name: "", email: "" });
    toast.success("Referral submitted — we'll be in touch!");
    void loadReferrals();
  };

  const downloadCertificate = (p: Policy) => {
    void generatePolicyCertificate({
      policyNumber: p.policy_number,
      clientName: profile?.full_name ?? "Client",
      clientEmail: profile?.email ?? "",
      clientPhone: profile?.phone ?? "",
      productType: p.product_type,
      insurer: p.insurer,
      premium: p.premium,
      startDate: p.start_date,
      endDate: p.end_date,
      coverageDetails: ["Third-party liability", "Comprehensive cover", "Roadside assistance"],
    })
      .then(() => toast.success("Certificate downloaded."))
      .catch(() => toast.error("Could not generate certificate."));
  };

  const now = new Date();
  const activePolicies = policies.filter((p) => p.status === "active");
  const expiringSoon = policies.filter((p) => {
    const d = differenceInDays(new Date(p.end_date), now);
    return d >= 0 && d <= 30;
  });

  const amountDueLive = payments
    .filter((p) => !["paid", "refunded", "cancelled"].includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
  const amountDue = demoAuthActive && amountDueLive === 0 ? 12840 : amountDueLive;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-foreground">
          Welcome back, {profile?.full_name?.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground">Your insurance portfolio at a glance</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Policies", value: activePolicies.length, icon: FileText, color: "bg-primary-100 text-primary-600 dark:bg-primary-950/55 dark:text-primary-300" },
          { label: "Expiring Soon", value: expiringSoon.length, icon: AlertTriangle, color: expiringSoon.length > 0 ? "bg-warning-50 text-warning-600 dark:bg-warning-950/35 dark:text-warning-300" : "bg-muted text-muted-foreground dark:bg-muted/60" },
          { label: "Unread Messages", value: unreadMessages, icon: MessageSquare, color: unreadMessages > 0 ? "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300" : "bg-muted text-muted-foreground dark:bg-muted/60" },
          { label: "Total Premium", value: `MUR ${activePolicies.reduce((s, p) => s + p.premium, 0).toLocaleString()}`, icon: CreditCard, color: "bg-accent-50 text-accent-600 dark:bg-accent-950/45 dark:text-accent-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-surface-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-warning-200/90 bg-warning-50/90 p-5 dark:border-warning-800/50 dark:bg-warning-950/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-warning-900 dark:text-warning-100">Amount due</h3>
            <p className="mt-1 text-sm text-muted-foreground dark:text-warning-200/80">
              Unpaid or in-flight invoices linked to your profile.
              {demoAuthActive && amountDueLive === 0 && " Demo sample balance while no live rows are returned."}
            </p>
          </div>
          <p className="text-3xl font-extrabold tabular-nums text-warning-900 dark:text-warning-100">
            MUR {amountDue.toLocaleString()}
          </p>
        </div>
        {amountDue === 0 && (
          <p className="mt-3 text-sm font-medium text-accent-700 dark:text-accent-300">You have no outstanding balance in the fetched payment list.</p>
        )}
      </div>

      {/* Claims, documents & saved quotes */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-surface-foreground flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-orange-600 dark:text-orange-400 shrink-0" aria-hidden />
              Claims
            </h3>
            <Link to="/dashboard/claims" className="text-xs text-primary-600 hover:underline dark:text-primary-400">
              FNOL
            </Link>
          </div>
          {claimIntakes.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No claim intakes yet.{" "}
              <Link to="/dashboard/claims" className="text-primary-600 hover:underline dark:text-primary-400">
                Submit a claim
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {claimIntakes.map((c, i) => (
                <div key={c.id} className="px-4 py-4">
                  <p className="text-sm font-medium text-surface-foreground">
                    {c.policy_number || "Claim"} · {format(new Date(c.created_at), "dd MMM yyyy")}
                  </p>
                  {i === 0 ? (
                    <div className="mt-3">
                      <ClaimsTimeline status={c.status} createdAt={c.created_at} />
                    </div>
                  ) : (
                    <p className="mt-1 text-xs capitalize text-muted-foreground">{c.status.replace(/_/g, " ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-surface-foreground flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary-600 dark:text-primary-400 shrink-0" aria-hidden />
              Documents
            </h3>
            <Link to="/dashboard/documents" className="text-xs text-primary-600 hover:underline dark:text-primary-400">
              View all
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No uploads yet.{" "}
              <Link to="/dashboard/upload" className="text-primary-600 hover:underline dark:text-primary-400">
                Upload
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentDocs.map((d) => (
                <li key={d.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-surface-foreground truncate">{d.file_name}</p>
                  <span className="text-xs capitalize text-muted-foreground shrink-0">{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-surface-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-accent-600 dark:text-accent-400 shrink-0" aria-hidden />
              Saved quotes
            </h3>
            <Link to="/dashboard/quotes" className="text-xs text-primary-600 hover:underline dark:text-primary-400">
              Calculator
            </Link>
          </div>
          {savedQuotes.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No saved quotes.{" "}
              <Link to="/dashboard/quotes" className="text-primary-600 hover:underline dark:text-primary-400">
                Run the calculator
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {savedQuotes.map((q) => (
                <li key={q.id} className="px-4 py-3">
                  <p className="text-sm font-medium text-surface-foreground capitalize">{q.product_type}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {q.estimated_premium != null ? `MUR ${Number(q.estimated_premium).toLocaleString()} est.` : "Estimate —"}{" "}
                    · {format(new Date(q.created_at), "dd MMM yyyy")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Expiry alerts */}
      {expiringSoon.length > 0 && (
        <div className="rounded-xl border-2 border-warning-200 bg-warning-50 p-5 dark:border-warning-700/45 dark:bg-warning-950/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
            <h3 className="font-semibold text-warning-800 dark:text-warning-200">{expiringSoon.length} polic{expiringSoon.length === 1 ? "y" : "ies"} expiring within 30 days</h3>
          </div>
          <div className="space-y-2">
            {expiringSoon.map((p) => {
              const daysLeft = differenceInDays(new Date(p.end_date), now);
              return (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/70 dark:bg-surface/90 px-4 py-3 border border-warning-100/80 dark:border-warning-800/30">
                  <div>
                    <p className="text-sm font-medium text-surface-foreground">{p.product_type} · {p.policy_number}</p>
                    <p className="text-xs text-muted-foreground">Expires {format(new Date(p.end_date), "dd MMM yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-warning-700 dark:text-warning-300">{daysLeft}d left</span>
                    <Link to="/dashboard/inbox" className="text-xs text-primary-600 hover:underline dark:text-primary-400">Contact broker</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Get a Quote", desc: "Motor, Home, Life & more", to: "/dashboard/quotes", icon: RefreshCw, color: "bg-primary-600 hover:bg-primary-700" },
          { label: "Claims", desc: "Intake & status", to: "/dashboard/claims", icon: FileWarning, color: "bg-orange-600 hover:bg-orange-700" },
          { label: "Inbox", desc: `${unreadMessages} unread`, to: "/dashboard/inbox", icon: MessageSquare, color: "bg-accent-600 hover:bg-accent-700" },
          { label: "Payments", desc: "View & pay invoices", to: "/dashboard/payments", icon: CreditCard, color: "bg-primary-700 hover:bg-primary-800" },
          { label: "Upload Document", desc: "Claims, renewals, ID", to: "/dashboard/upload", icon: FileText, color: "bg-warning-600 hover:bg-warning-700" },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className={`${a.color} rounded-xl p-5 text-white flex items-center gap-4 transition-colors duration-200`}
          >
            <div className="rounded-lg bg-white/20 p-2">
              <a.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{a.label}</p>
              <p className="text-xs opacity-80">{a.desc}</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
          </Link>
        ))}
      </div>

      {/* Refer a Friend */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <div className="rounded-lg bg-accent-50 p-1.5 dark:bg-accent-950/40">
            <Gift className="h-4 w-4 text-accent-600 dark:text-accent-400" aria-hidden />
          </div>
          <h3 className="font-semibold text-surface-foreground">Refer a Friend</h3>
          <span className="ml-auto text-xs text-muted-foreground">Help someone you know get covered</span>
        </div>
        <div className="p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              placeholder="Their name (optional)"
              value={referralForm.name}
              onChange={(e) => setReferralForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Their email address"
              value={referralForm.email}
              onChange={(e) => setReferralForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void submitReferral()}
              disabled={submittingReferral || !referralForm.email.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden />
              {submittingReferral ? "Sending…" : "Refer"}
            </button>
          </div>
          {referrals.length > 0 && (
            <div className="mt-4 divide-y divide-border rounded-lg border border-border">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Users2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-surface-foreground truncate">{r.referred_name || r.referred_email}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.referred_email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    r.status === "converted"
                      ? "bg-accent-50 text-accent-700 dark:bg-accent-950/30 dark:text-accent-300"
                      : r.status === "contacted"
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Policies */}
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">My Policies</h3>
            <span className="text-xs text-muted-foreground">{policies.length} total</span>
          </div>
          {policies.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No policies yet. Get a quote to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {policies.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-surface-foreground">{p.product_type}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[p.status] ?? ""}`}>{p.status}</span>
                      {p.status === "active" && <RenewalCountdown endDate={p.end_date} />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.policy_number} · {p.insurer}</p>
                    <p className="text-xs text-muted-foreground">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {format(new Date(p.end_date), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-sm font-semibold text-surface-foreground">MUR {p.premium.toLocaleString()}</p>
                    <button onClick={() => downloadCertificate(p)} className="flex items-center gap-1 text-xs text-primary-600 hover:underline cursor-pointer">
                      <Download className="h-3 w-3" />
                      Certificate
                    </button>
                    {p.status === "active" && (
                      <button onClick={() => downloadPolicyRenewalReminder(p)} className="flex items-center gap-1 text-xs text-primary-600 hover:underline cursor-pointer">
                        <CalendarPlus className="h-3 w-3" />
                        Remind me
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payments */}
        <div className="rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="font-semibold text-surface-foreground">Recent Payments</h3>
            <Link to="/dashboard/payments" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {payments.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <CreditCard className="mx-auto h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No payment history yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className={`rounded-lg p-2 shrink-0 ${p.status === "paid" ? "bg-accent-50" : "bg-warning-50"}`}>
                    {p.status === "paid" ? <CheckCircle className="h-4 w-4 text-accent-600" /> : <Clock className="h-4 w-4 text-warning-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-foreground truncate">{p.description ?? "Insurance Premium"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-surface-foreground">{p.currency} {p.amount.toLocaleString()}</p>
                    <p className={`text-xs font-medium capitalize ${p.status === "paid" ? "text-accent-600" : "text-warning-600"}`}>{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
