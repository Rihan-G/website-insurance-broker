import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { BRAND_LOGO_PNG, BRAND_LOGO_SVG } from "../lib/brandAssets";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  /** Accessible label; defaults to decorative (empty alt). */
  label?: string;
};

/**
 * Sindicom logo from `public/brand/` (logo.svg → logo.png), with shield fallback.
 */
export function BrandLogo({ className, imageClassName, label }: BrandLogoProps) {
  const [stage, setStage] = useState<"png" | "svg" | "fallback">("png");

  if (stage === "fallback") {
    return <ShieldCheck className={className} aria-hidden={!label} aria-label={label} />;
  }

  const src = stage === "png" ? BRAND_LOGO_PNG : BRAND_LOGO_SVG;

  return (
    <img
      src={src}
      alt={label ?? ""}
      className={`brand-logo ${imageClassName ?? className ?? ""}`}
      onError={() => {
        if (stage === "png") setStage("svg");
        else setStage("fallback");
      }}
    />
  );
}
