import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, CreditCard, MessageSquare, RefreshCw, Calendar, CheckCircle, Clock, AlertTriangle, ChevronRight, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { db } from "../lib/db";
import { useAuth } from "../context/AuthContext";
import { generatePolicyCertificate } from "../lib/pdfService";
import { differenceInDays, format } from "date-fns";
import toast from "react-hot-toast";

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

const statusStyles: Record<string, string> = {
  active: "bg-accent-50 text-accent-600",
  pending: "bg-warning-50 text-warning-600",
  expired: "bg-danger-50 text-danger-600",
  cancelled: "bg-muted text-muted-foreground",
};

export function ClientPortalPage() {
  const { user, profile } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      const [{ data: pols }, { data: pays }, { count }] = await Promise.all([
        supabase.from("policies").select("*").eq("client_id", user.id).order("end_date", { ascending: true }),
        db.payments().select("*").eq("client_id", user.id).order("created_at", { ascending: false }).limit(5),
        db.inboxMessages().select("id", { count: "exact", head: true }).eq("recipient_id", user.id).eq("is_read", false),
      ]);
      setPolicies((pols as Policy[]) ?? []);
      setPayments((pays as Payment[]) ?? []);
      setUnreadMessages(count ?? 0);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const downloadCertificate = (p: Policy) => {
    generatePolicyCertificate({
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
    });
    toast.success("Certificate downloaded.");
  };

  const now = new Date();
  const activePolicies = policies.filter((p) => p.status === "active");
  const expiringSoon = policies.filter((p) => {
    const d = differenceInDays(new Date(p.end_date), now);
    return d >= 0 && d <= 30;
  });

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
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Get a Quote", desc: "Motor, Home, Life & more", to: "/dashboard/quotes", icon: RefreshCw, color: "bg-primary-600 hover:bg-primary-700" },
          { label: "Inbox", desc: `${unreadMessages} unread`, to: "/dashboard/inbox", icon: MessageSquare, color: "bg-accent-600 hover:bg-accent-700" },
          { label: "Payments", desc: "View & pay invoices", to: "/dashboard/payments", icon: CreditCard, color: "bg-purple-600 hover:bg-purple-700" },
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
              {policies.map((p) => {
                const daysLeft = differenceInDays(new Date(p.end_date), now);
                return (
                  <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-surface-foreground">{p.product_type}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[p.status] ?? ""}`}>{p.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.policy_number} · {p.insurer}</p>
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {format(new Date(p.end_date), "dd MMM yyyy")}
                        {daysLeft >= 0 && daysLeft <= 30 && <span className="ml-1 text-warning-600 font-medium">({daysLeft}d left)</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-surface-foreground">MUR {p.premium.toLocaleString()}</p>
                      <button onClick={() => downloadCertificate(p)} className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 hover:underline cursor-pointer">
                        <Download className="h-3 w-3" />
                        Certificate
                      </button>
                    </div>
                  </div>
                );
              })}
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
              {payments.map((p) => (
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
