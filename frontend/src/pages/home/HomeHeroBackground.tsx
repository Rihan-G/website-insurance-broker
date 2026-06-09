import { ParticleField } from "../../components/ParticleField";
import type { HeroBgPreset } from "./homeHeroBackgrounds";

export function HomeHeroBackground({ preset }: { preset: HeroBgPreset }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="home-hero-base absolute inset-0" />

      {preset === "tide" && <div className="home-bg-tide absolute inset-0" />}

      {preset === "mesh" && <div className="home-bg-mesh-slow animated-mesh absolute inset-0" />}

      {preset === "aurora" && (
        <>
          <div className="aurora-bg aurora-calm absolute inset-0">
            <div className="aurora-orb-1 aurora-home-hero-1" />
            <div className="aurora-orb-2 aurora-home-hero-2" />
            <div className="aurora-orb-3 aurora-home-hero-3" />
          </div>
          <ParticleField count={10} variant="rise" className="opacity-50" />
        </>
      )}

      {preset === "dawn" && <div className="home-bg-dawn absolute inset-0" />}

      {preset === "current" && (
        <>
          <div className="home-bg-current absolute inset-0" />
          <div className="home-bg-current-band home-bg-current-band--a" />
          <div className="home-bg-current-band home-bg-current-band--b" />
        </>
      )}

      <div className="absolute inset-0 dot-grid opacity-[0.1]" />
      <div className="home-hero-vignette absolute inset-0" />
    </div>
  );
}

/** Reuse hero preset on other dark bands (CTA, etc.) */
export function HomeDarkBandBackground({ preset }: { preset: HeroBgPreset }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="home-hero-base absolute inset-0" />
      {preset === "tide" && <div className="home-bg-tide absolute inset-0 opacity-90" />}
      {preset === "mesh" && <div className="home-bg-mesh-slow animated-mesh absolute inset-0 opacity-85" />}
      {preset === "aurora" && (
        <div className="aurora-bg aurora-calm absolute inset-0 opacity-80">
          <div className="aurora-orb-2 aurora-home-cta-1" />
          <div className="aurora-orb-3 aurora-home-cta-2" />
        </div>
      )}
      {preset === "dawn" && <div className="home-bg-dawn absolute inset-0 opacity-90" />}
      {preset === "current" && (
        <>
          <div className="home-bg-current absolute inset-0 opacity-90" />
          <div className="home-bg-current-band home-bg-current-band--b opacity-70" />
        </>
      )}
      <div className="home-hero-vignette absolute inset-0" />
    </div>
  );
}
