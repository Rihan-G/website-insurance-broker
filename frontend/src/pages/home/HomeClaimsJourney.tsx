import { AnimatedSection } from "./HomeAnimatedPrimitives";
import { claimsJourney } from "./homeMarketingData";

export function HomeClaimsJourney() {
  return (
    <section id="claims" className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-slate-950 py-20 text-white lg:py-28">
      <div className="aurora-bg opacity-80" aria-hidden>
        <div className="aurora-orb-2 aurora-home-claims-1" />
        <div className="aurora-orb-3 aurora-home-claims-2" />
      </div>
      <div className="scan-line scan-line-delayed opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-300">Claims support</span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-4xl">Guided steps when something goes wrong</h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-200/95">
            Report incidents with structure, upload evidence securely, and keep your broker in the loop from first notice to resolution.
          </p>
        </AnimatedSection>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {claimsJourney.map((step, i) => (
            <li key={step.title}>
              <AnimatedSection className={`stagger-${i + 1} h-full`} animation="animate-on-scroll">
                <div className="home-claims-step relative h-full rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/20 text-sm font-bold text-accent-200 ring-1 ring-accent-400/40">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-primary-200/90">{step.desc}</p>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
