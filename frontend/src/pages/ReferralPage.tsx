import { useState } from "react";
import { Gift, Copy, CheckCheck, Users, TrendingUp, Plus, X } from "lucide-react";
import { subDays, format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { usePageMeta } from "../hooks/usePageMeta";

type ReferralStatus = "pending" | "contacted" | "converted";

type Referral = {
  id: string;
  referredName: string;
  referredEmail: string;
  status: ReferralStatus;
  createdAt: Date;
  reward?: number;
};

const DEMO_REFERRALS: Referral[] = [
  { id: "r1", referredName: "Sophie Chen", referredEmail: "sophie.chen@example.com", status: "converted", createdAt: subDays(new Date(), 42), reward: 500 },
  { id: "r2", referredName: "Marc Labelle", referredEmail: "marc.l@example.com", status: "contacted", createdAt: subDays(new Date(), 18) },
  { id: "r3", referredName: "Priya Gounden", referredEmail: "priya.g@example.com", status: "pending", createdAt: subDays(new Date(), 5) },
];

const statusConfig: Record<ReferralStatus, { label: string; cls: string }> = {
  pending:   { label: "Pending",   cls: "bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-950/30 dark:text-warning-300 dark:border-warning-700/40" },
  contacted: { label: "Contacted", cls: "bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/30 dark:text-primary-300 dark:border-primary-700/40" },
  converted: { label: "Converted", cls: "bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-950/30 dark:text-accent-300 dark:border-accent-700/40" },
};

export function ReferralPage() {
  usePageMeta({ title: "Referrals — Sindicom Portal", description: "Refer friends and family to earn rewards on every converted policy." });
  const { profile } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>(DEMO_REFERRALS);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const referralCode = `SIND-${(profile?.id ?? "DEMO").slice(0, 6).toUpperCase()}`;
  const referralLink = `https://sindicombrokers.mu/?ref=${referralCode}`;

  const totalEarned = referrals.filter((r) => r.status === "converted").reduce((s, r) => s + (r.reward ?? 0), 0);
  const converted   = referrals.filter((r) => r.status === "converted").length;

  const copyLink = () => {
    void navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Referral link copied!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { toast.error("Name and email are required."); return; }
    setReferrals((prev) => [
      { id: `r${Date.now()}`, referredName: name.trim(), referredEmail: email.trim(), status: "pending", createdAt: new Date() },
      ...prev,
    ]);
    toast.success(`Referral sent to ${name}!`);
    setName(""); setEmail(""); setShowForm(false);
  };

  return (
    <div className="min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">Rewards</p>
          <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Refer a friend</h1>
          <p className="mt-1 text-sm text-muted-foreground">Earn MUR 500 for every contact who takes out a policy.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden /> New referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total referrals", value: referrals.length, icon: Users, bg: "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300" },
          { label: "Converted",       value: converted,         icon: TrendingUp, bg: "bg-accent-50 text-accent-600 dark:bg-accent-950/40 dark:text-accent-300" },
          { label: "Rewards earned",  value: `MUR ${totalEarned.toLocaleString()}`, icon: Gift, bg: "bg-warning-50 text-warning-600 dark:bg-warning-950/40 dark:text-warning-300" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-xl font-bold text-surface-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm font-semibold text-surface-foreground mb-3">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-surface-foreground">{referralLink}</code>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted transition-colors"
          >
            {copied ? <CheckCheck className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Your code: <span className="font-mono font-semibold text-surface-foreground">{referralCode}</span></p>
      </div>

      {/* New referral form */}
      {showForm && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/40 p-5 dark:border-primary-800/40 dark:bg-primary-950/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-surface-foreground">Add a referral</p>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jean@example.com" className="h-10 w-full rounded-xl border border-border bg-surface px-4 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
              <Gift className="h-4 w-4" aria-hidden /> Send referral
            </button>
          </form>
        </div>
      )}

      {/* Referral list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border/80 bg-muted/20 px-5 py-3">
          <Gift className="h-4 w-4 text-muted-foreground" aria-hidden />
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{referrals.length} referral{referrals.length !== 1 ? "s" : ""}</p>
        </div>
        {referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Gift className="h-10 w-10 text-muted-foreground/40" aria-hidden />
            <p className="text-sm font-semibold text-surface-foreground">No referrals yet</p>
            <p className="text-xs text-muted-foreground">Share your link or add a contact to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {referrals.map((r) => {
              const cfg = statusConfig[r.status];
              return (
                <li key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                    {r.referredName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-surface-foreground">{r.referredName}</p>
                    <p className="text-xs text-muted-foreground">{r.referredEmail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    {r.reward && <p className="mt-1 text-xs font-bold text-accent-600 dark:text-accent-400">+MUR {r.reward}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(r.createdAt, "dd MMM yyyy")}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
