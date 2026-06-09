type SectionVariant = "hero" | "cta" | "claims";

export function HomeSectionBackground({ variant }: { variant: SectionVariant }) {
  const baseClass =
    variant === "claims" ? "home-claims-base" : variant === "cta" ? "home-cta-base" : "home-hero-base";
  const vignetteClass = variant === "claims" ? "home-claims-vignette" : "home-hero-vignette";
  const showSheen = variant !== "claims";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className={`${baseClass} absolute inset-0`} />
      <div className="home-bg-coastal-shift absolute inset-0" />
      <div className="home-bg-aurora-glow absolute inset-0" />
      <div className={`aurora-bg aurora-calm absolute inset-0 ${variant === "claims" ? "home-claims-aurora" : ""}`}>
        {variant === "claims" ? (
          <>
            <div className="aurora-orb-2 aurora-home-claims-1" />
            <div className="aurora-orb-3 aurora-home-claims-2" />
          </>
        ) : variant === "cta" ? (
          <>
            <div className="aurora-orb-2 aurora-home-cta-1" />
            <div className="aurora-orb-3 aurora-home-cta-2" />
          </>
        ) : (
          <>
            <div className="aurora-orb-1 aurora-home-hero-1" />
            <div className="aurora-orb-2 aurora-home-hero-2" />
            <div className="aurora-orb-3 aurora-home-hero-3" />
          </>
        )}
      </div>
      {showSheen && <div className="home-bg-coastal-sheen absolute inset-0" />}
      <div className={`absolute inset-0 dot-grid ${variant === "hero" ? "opacity-[0.08]" : "opacity-[0.06]"}`} />
      <div className="home-bg-grain absolute inset-0" />
      <div className={`${vignetteClass} absolute inset-0`} />
    </div>
  );
}
