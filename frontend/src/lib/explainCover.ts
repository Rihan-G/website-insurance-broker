export interface CoverExplanation {
  summary: string;
  typicalIncludes: string[];
  watchOut: string[];
}

const coverLibrary: Record<string, CoverExplanation> = {
  motor_comprehensive: {
    summary: "Comprehensive motor covers damage to your vehicle plus third-party liability, subject to policy limits and excess.",
    typicalIncludes: ["Accident damage to own vehicle", "Theft and fire", "Third-party injury and property", "Windscreen (often sub-limited)"],
    watchOut: ["Driver age and licence restrictions", "Use for hire/reward exclusions", "Depreciation on parts for older vehicles"],
  },
  motor_third_party: {
    summary: "Third-party motor meets legal minimum — injury and property damage to others, not your own vehicle repair.",
    typicalIncludes: ["Third-party bodily injury", "Third-party property damage"],
    watchOut: ["No own-damage cover", "Theft of vehicle not covered", "Consider fire & theft extension if available"],
  },
  home_buildings: {
    summary: "Buildings insurance covers the structure, fixed fittings, and reinstatement after insured events.",
    typicalIncludes: ["Fire, lightning", "Storm/cyclone (if extended)", "Alternative accommodation limits"],
    watchOut: ["Sum insured must reflect rebuild cost", "Wear and tear not covered", "Unoccupied property conditions"],
  },
  travel_medical: {
    summary: "Travel medical covers emergency treatment abroad within territorial limits and policy sub-limits.",
    typicalIncludes: ["Emergency hospitalisation", "Medical evacuation", "Repatriation (limits apply)"],
    watchOut: ["Pre-existing conditions", "Adventure sports exclusions", "Alcohol-related incidents"],
  },
};

export function explainCover(policyKey: string): CoverExplanation | null {
  return coverLibrary[policyKey] ?? null;
}

export const coverOptions = Object.keys(coverLibrary).map((key) => ({
  key,
  label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));
