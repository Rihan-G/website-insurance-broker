import { Check, FileWarning, LayoutDashboard, Sparkles, Users } from "lucide-react";
import { AnimatedSection } from "./HomeAnimatedPrimitives";

/** Enterprise-style “SaaS” preview band — static content written for all visitors (clients & staff share this homepage). */
export function HomePlatformPreview() {
  return (
    <section id="platform" className="home-section-soft border-y border-primary-100 py-24 lg:py-32 dark:border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">Platform</span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            One calm place for policies, renewals, and claims
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you are insuring your family or your business, you get the same secure portal experience: clear updates, fewer surprises,
            and advisors when you need a human.
          </p>
        </AnimatedSection>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {[
            {
              icon: LayoutDashboard,
              title: "Renewals & cover in view",
              desc: "See what is active, what is coming due, and what needs a signature, without digging through email threads.",
              tone: "from-primary-600/90 to-primary-800",
              features: [
                "Single timeline for renewals and tasks",
                "Status on signatures & outstanding items",
                "Motor, home, travel, and business in one login",
              ],
            },
            {
              icon: FileWarning,
              title: "Guided claims support",
              desc: "Structured first steps after an incident, with space to add photos or documents so nothing important is missed.",
              tone: "from-amber-600/90 to-orange-800",
              features: [
                "Checklist-style first steps after a loss",
                "Slots for photos, police reports, estimates",
                "Your broker picks up with clear next actions",
              ],
            },
            {
              icon: Users,
              title: "Advice when it matters",
              desc: "Licensed brokers explain trade-offs in plain language: online tools speed things up, people close the loop.",
              tone: "from-emerald-600/90 to-teal-900",
              features: [
                "Plain-language comparisons before you bind",
                "Phone, email, or WhatsApp (where you opt in)",
                "Same team from quote through renewal",
              ],
            },
          ].map((card, i) => (
            <AnimatedSection
              key={card.title}
              className={`stagger-${i + 1} ${i === 0 ? "lg:col-span-7" : i === 1 ? "lg:col-span-5" : "lg:col-span-12"}`}
              animation="animate-fade-in"
            >
              <div className="home-feature-card group relative h-full overflow-hidden rounded-2xl border border-primary-200/70 bg-surface p-7 shadow-sm transition-[transform,box-shadow] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-xl dark:border-border dark:bg-surface">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-15 ${card.tone}`}
                />
                <div className="relative flex h-full flex-col">
                  <div className="inline-flex w-fit rounded-xl bg-muted/80 p-3 ring-1 ring-border dark:bg-slate-800/80">
                    <card.icon className="h-6 w-6 text-primary-600 dark:text-primary-300" aria-hidden />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-surface-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
                  <ul className="mt-5 flex-1 space-y-2 border-t border-border/80 pt-4 dark:border-white/10">
                    {card.features.map((line) => (
                      <li key={line} className="flex gap-2 text-sm text-surface-foreground/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="mt-12" animation="animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-900 p-6 text-primary-50 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_80%_60%,rgba(74,222,128,0.1),transparent_40%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-300/90">Built around you</p>
                <p className="mt-2 text-xl font-bold text-white sm:text-2xl">Client features you actually use</p>
                <p className="mt-3 text-sm leading-relaxed text-primary-200/90">
                  No internal ledgers on this page, just the kinds of tools policyholders get once they are onboarded: clarity, reminders, and
                  a safe place for paperwork.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-primary-100/95">
                  {[
                    "256-bit TLS in the browser; files sent through your private area, not random email threads.",
                    "Gentle reminders before renewals or instalments so lapses are less likely.",
                    "Download schedules and certificates whenever you need a copy for the bank or employer.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold text-primary-100">At a glance</span>
                  <Sparkles className="h-5 w-5 text-accent-300" aria-hidden />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { title: "Secure inbox", body: "Uploads land in your file; only you and your broker see them." },
                    { title: "Clear statuses", body: "See what is waiting on you, the insurer, or your advisor." },
                    { title: "Payment clarity", body: "Upcoming due dates and confirmations, without firm-wide totals." },
                    { title: "Human escalation", body: "One tap to message your advisor when something is unclear." },
                  ].map((r) => (
                    <div key={r.title} className="rounded-lg bg-slate-950/50 px-3 py-2.5 ring-1 ring-white/5">
                      <p className="text-xs font-bold uppercase tracking-wide text-primary-200">{r.title}</p>
                      <p className="mt-1 text-sm leading-snug text-primary-50/95">{r.body}</p>
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
