/**
 * ParticleField — visible floating particles
 * ui-ux-pro-max-skill #15: Motion-Driven UI
 *
 * Per-particle layout lives in a scoped <style> block so divs need no inline
 * `style` attributes (Microsoft Edge Tools / accessibility linters).
 */
import { useId, useMemo } from "react";

const PALETTE = [
  "rgba(103,232,249,0.9)", // aqua
  "rgba(253,230,138,0.85)", // champagne
  "rgba(34,211,238,0.9)", // cyan
  "rgba(226,232,240,0.85)", // silver
  "rgba(255,255,255,0.75)", // white
  "rgba(165,243,252,0.8)", // soft aqua
  "rgba(254,243,199,0.8)", // pale gold
];

function seededValue(seed: number, min: number, max: number): number {
  const s = Math.abs(Math.sin(seed * 9301 + 49297) * 233280);
  return min + (s % 1) * (max - min);
}

interface ParticleFieldProps {
  count?: number;
  variant?: "rise" | "drift";
  className?: string;
}

export function ParticleField({ count = 28, variant = "rise", className = "" }: ParticleFieldProps) {
  const rawId = useId();
  const scopeId = `pf-${rawId.replace(/:/g, "")}`;

  const slotCss = useMemo(() => {
    const rules: string[] = [];
    for (let i = 0; i < count; i++) {
      const size = seededValue(i * 3 + 1, 3, 10);
      const left = seededValue(i * 3 + 2, 2, 98);
      const bottom = seededValue(i * 3 + 3, -5, 15);
      const dur = seededValue(i * 3 + 4, 7, 18);
      const delay = seededValue(i * 3 + 5, 0, 12);
      const color = PALETTE[i % PALETTE.length];
      const isSquare = i % 5 === 0;
      const isDiamond = i % 7 === 0;
      const topDrift = `${seededValue(i * 3 + 6, 5, 90)}%`;

      const pos =
        variant === "rise"
          ? `left: ${left}%; bottom: ${bottom}%;`
          : `left: ${left}%; top: ${topDrift};`;

      const transformClause = isDiamond ? "transform: rotate(45deg);" : "";

      rules.push(`#${scopeId} [data-slot="${i}"] {
          ${pos}
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
          animation-duration: ${dur}s;
          animation-delay: ${delay}s;
          border-radius: ${isDiamond ? "2px" : isSquare ? "3px" : "50%"};
          ${transformClause}
        }`);
    }
    return rules.join("\n");
  }, [count, variant, scopeId]);

  return (
    <>
      <style>{slotCss}</style>
      <div id={`${scopeId}`} className={`particle-field ${className}`}>
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            data-slot={i}
            className={variant === "rise" ? "particle-rise" : "particle-drift"}
          />
        ))}
      </div>
    </>
  );
}
