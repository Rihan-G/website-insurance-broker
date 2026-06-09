import { AnimatedSection } from "./HomeAnimatedPrimitives";
import { whyChooseUs } from "./homeMarketingData";

export function HomeWhyChooseUs() {
  return (
    <section className="home-section-tint relative overflow-hidden border-y border-primary-100 py-20 lg:py-28 dark:border-primary-900/40">
      <div className="pointer-events-none absolute inset-0 dot-grid-light opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
            Why clients stay
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
            Licensed advice with a modern client experience
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Clear communication, secure document handling, and proactive reminders—without losing the human broker relationship.
          </p>
        </AnimatedSection>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, i) => (
            <AnimatedSection key={item.title} className={`stagger-${i + 1}`} animation="animate-scale-in">
              <div className="home-feature-card group h-full rounded-2xl border border-primary-200/80 bg-white/90 p-6 shadow-sm dark:border-primary-800/50 dark:bg-slate-900/80">
                <div className={`home-icon-bob inline-flex rounded-xl bg-gradient-to-br ${item.tone} p-3 text-white shadow-md`}>
                  <item.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-surface-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
