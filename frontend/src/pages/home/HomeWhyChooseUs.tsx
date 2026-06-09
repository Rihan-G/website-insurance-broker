import { AnimatedSection } from "./HomeAnimatedPrimitives";
import { whyChooseUs } from "./homeMarketingData";

/** Asymmetric feature list (not an identical icon-card grid). */
export function HomeWhyChooseUs() {
  return (
    <section className="home-section-tint relative overflow-hidden border-y border-primary-100 py-20 lg:py-28 dark:border-primary-900/40">
      <div className="pointer-events-none absolute inset-0 dot-grid-light opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="max-w-2xl">
          <p className="ui-eyebrow text-primary-700 dark:text-primary-300">Why clients stay</p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-primary-950 dark:text-white sm:text-4xl">
            Licensed advice with a modern client experience
          </h2>
          <p className="mt-4 max-w-prose text-muted-foreground">
            Clear communication, secure document handling, and proactive reminders, without losing the human broker relationship.
          </p>
        </AnimatedSection>

        <ol className="mt-14 space-y-4">
          {whyChooseUs.map((item, i) => (
            <li key={item.title}>
              <AnimatedSection className={`stagger-${i + 1}`} animation="animate-slide-left">
                <div
                  className={`home-feature-row flex flex-col gap-5 rounded-2xl border border-primary-200/80 bg-white p-6 shadow-sm dark:border-primary-800/50 dark:bg-slate-900/80 sm:flex-row sm:items-center ${
                    i % 2 === 1 ? "sm:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex shrink-0 items-center gap-4 sm:w-48">
                    <span className="text-3xl font-black tabular-nums text-primary-200 dark:text-primary-700">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${item.tone} p-3 text-white shadow-md`}>
                      <item.icon className="h-6 w-6" aria-hidden />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-surface-foreground">{item.title}</h3>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
