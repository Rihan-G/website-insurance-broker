import { useTheme } from "../../context/ThemeContext";
import { AnimatedSection } from "./HomeAnimatedPrimitives";
import { HomeSectionBackground } from "./HomeSectionBackground";
import { claimsJourney } from "./homeMarketingData";

export function HomeClaimsJourney() {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  return (
    <section
      id="claims"
      className={`relative overflow-hidden border-y py-20 lg:py-28 ${
        isDark ? "border-primary-800/40 text-white" : "border-primary-200/80 text-primary-950"
      }`}
    >
      <HomeSectionBackground variant="claims" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6">
        <AnimatedSection className="text-center">
          <span
            className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "text-accent-300" : "text-accent-700"}`}
          >
            Claims support
          </span>
          <h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-4xl">
            Guided steps when something goes wrong
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl ${isDark ? "text-primary-200/95" : "text-primary-800/90"}`}>
            Report incidents with structure, upload evidence securely, and keep your broker in the loop from first notice
            to resolution.
          </p>
        </AnimatedSection>

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {claimsJourney.map((step, i) => (
            <li key={step.title}>
              <AnimatedSection className={`stagger-${i + 1} h-full`} animation="animate-on-scroll">
                <div
                  className={`home-claims-step relative h-full rounded-2xl border p-5 ${
                    isDark
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-primary-200/90 bg-white/75 shadow-sm backdrop-blur-sm"
                  }`}
                >
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-1 ${
                      isDark
                        ? "bg-accent-500/20 text-accent-200 ring-accent-400/40"
                        : "bg-accent-100 text-accent-800 ring-accent-300/60"
                    }`}
                  >
                    {step.step}
                  </span>
                  <h3 className={`mt-4 font-bold ${isDark ? "text-white" : "text-primary-950"}`}>{step.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-primary-200/90" : "text-primary-800/85"}`}>
                    {step.desc}
                  </p>
                </div>
              </AnimatedSection>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
