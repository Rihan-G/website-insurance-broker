import { CreditCard, FileWarning, LayoutDashboard, PieChart, Users } from "lucide-react";
import { AnimatedSection } from "./HomeAnimatedPrimitives";

/** Enterprise-style “SaaS” preview band — static content for marketing trust. */
export function HomePlatformPreview() {
  return (
    <section id="platform" className="border-y border-border bg-gradient-to-b from-slate-50 to-white py-24 lg:py-32 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Platform</span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            A broker workspace your clients can feel
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Claims tracking, policy documents, and renewals in one place — the same portal experience your team uses behind the scenes,
            presented here as a polished product surface.
          </p>
        </AnimatedSection>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: LayoutDashboard,
              title: "Operations overview",
              desc: "Pipeline status, renewals, and staff workload at a glance.",
              tone: "from-primary-600/90 to-primary-800",
            },
            {
              icon: FileWarning,
              title: "Claims & FNOL",
              desc: "Structured intakes, attachments, and SLA-friendly follow-ups.",
              tone: "from-amber-600/90 to-orange-800",
            },
            {
              icon: Users,
              title: "Client & policy records",
              desc: "Households, vehicles, and endorsements with a clean audit trail.",
              tone: "from-emerald-600/90 to-teal-900",
            },
          ].map((card, i) => (
            <AnimatedSection key={card.title} className={`stagger-${i + 1}`} animation="animate-scale-in">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/80">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-15 ${card.tone}`}
                />
                <div className="relative flex h-full flex-col">
                  <div className="inline-flex w-fit rounded-xl bg-muted/80 p-3 ring-1 ring-border dark:bg-slate-800/80">
                    <card.icon className="h-6 w-6 text-primary-600 dark:text-primary-300" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-surface-foreground">{card.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                    <PieChart className="h-4 w-4" aria-hidden />
                    Preview layout
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-12" animation="animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-900 p-6 text-primary-50 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(74,222,128,0.1),transparent_40%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-300/90">Payments & compliance</p>
                <p className="mt-2 text-xl font-bold text-white sm:text-2xl">Reconcile premiums without spreadsheet chaos</p>
                <p className="mt-3 text-sm leading-relaxed text-primary-200/90">
                  Status chips, reminders, and export-friendly views help brokers stay audit-ready while clients see only what matters to
                  them.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-primary-100">This month</span>
                  <CreditCard className="h-5 w-5 text-accent-300" aria-hidden />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { l: "Collected", v: "₨ 1.24M", chip: "On track" },
                    { l: "Outstanding", v: "₨ 186k", chip: "Follow up" },
                    { l: "Failed attempts", v: "3", chip: "Retry" },
                  ].map((r) => (
                    <div key={r.l} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/50 px-3 py-2 ring-1 ring-white/5">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-primary-300/90">{r.l}</p>
                        <p className="text-sm font-bold text-white">{r.v}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-100">
                        {r.chip}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
