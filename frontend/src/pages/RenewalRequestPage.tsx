import { useState } from "react";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { RefreshCw, CheckCircle2, ChevronDown, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

type Policy = { id: string; policyNumber: string; product: string; insurer: string; endDate: Date; premium: number };

const DEMO_POLICIES: Policy[] = [
  { id: "p1", policyNumber: "MOT-2024-8841", product: "Motor — Comprehensive", insurer: "MUA Ltd", endDate: addDays(new Date(), 12), premium: 18500 },
  { id: "p2", policyNumber: "HOM-2023-1120", product: "Home — Building & Contents", insurer: "Swan Insurance", endDate: addDays(new Date(), 34), premium: 12800 },
  { id: "p3", policyNumber: "HLT-2024-0432", product: "Health — Premium Plan", insurer: "Jubilee Insurance", endDate: addDays(new Date(), 58), premium: 28000 },
];

type RenewalType = "same" | "review" | "cancel";
type Status = "idle" | "submitted";

export function RenewalRequestPage() {
  const [selectedId, setSelectedId] = useState(DEMO_POLICIES[0]!.id);
  const [renewalType, setRenewalType] = useState<RenewalType>("same");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const policy = DEMO_POLICIES.find((p) => p.id === selectedId) ?? DEMO_POLICIES[0]!;
  const days = differenceInCalendarDays(policy.endDate, new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitted");
    toast.success("Renewal request sent to your broker");
  };

  if (status === "submitted") {
    return (
      <div className="min-w-0">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-950/40">
            <CheckCircle2 className="h-8 w-8 text-accent-600 dark:text-accent-400" aria-hidden />
          </div>
          <h2 className="text-xl font-bold text-surface-foreground">Request submitted</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your broker will review your renewal request for <strong>{policy.policyNumber}</strong> and contact you within 2 business days.
          </p>
          <button
            type="button"
            onClick={() => { setStatus("idle"); setNote(""); setRenewalType("same"); }}
            className="mt-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-surface-foreground hover:bg-muted/40 transition-colors"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">My policies</p>
        <h1 className="mt-1 text-2xl font-bold text-surface-foreground">Request renewal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tell your broker how you'd like to renew — they'll handle the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        {/* Policy picker */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-surface-foreground mb-2">Which policy?</label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="h-10 w-full appearance-none rounded-xl border border-border bg-background pl-4 pr-10 text-sm text-surface-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {DEMO_POLICIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.policyNumber} — {p.product}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            </div>
          </div>

          {/* Policy summary card */}
          <div className={`rounded-xl border px-4 py-3 text-sm ${days <= 14 ? "border-warning-300 bg-warning-50 dark:border-warning-700/40 dark:bg-warning-950/20" : "border-border bg-muted/20"}`}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-surface-foreground">{policy.insurer}</p>
              <span className={`text-xs font-bold ${days <= 14 ? "text-warning-700 dark:text-warning-300" : "text-muted-foreground"}`}>
                {days} days left
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5">{policy.product}</p>
            <p className="text-muted-foreground mt-0.5">Expires {format(policy.endDate, "dd MMM yyyy")} · MUR {policy.premium.toLocaleString()} p.a.</p>
          </div>
        </div>

        {/* Renewal intent */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <p className="text-sm font-semibold text-surface-foreground">What would you like to do?</p>
          {(
            [
              { value: "same", label: "Renew on the same terms", desc: "Keep the same cover, insurer, and premium where possible." },
              { value: "review", label: "Review my cover first", desc: "I'd like my broker to suggest improvements or alternatives." },
              { value: "cancel", label: "Do not renew", desc: "Cancel this policy when it expires." },
            ] as { value: RenewalType; label: string; desc: string }[]
          ).map((opt) => (
            <label key={opt.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${renewalType === opt.value ? "border-primary-400 bg-primary-50/60 dark:border-primary-600 dark:bg-primary-950/20" : "border-border hover:bg-muted/20"}`}>
              <input
                type="radio"
                name="renewalType"
                value={opt.value}
                checked={renewalType === opt.value}
                onChange={() => setRenewalType(opt.value)}
                className="mt-0.5 accent-primary-600"
              />
              <div>
                <p className="text-sm font-semibold text-surface-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Optional note */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-surface-foreground">
            <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden />
            Add a note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="E.g. I've bought a new car and need to update the vehicle details…"
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-surface-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Submit renewal request
        </button>
      </form>
    </div>
  );
}
