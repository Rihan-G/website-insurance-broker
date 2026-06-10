export interface ComparisonPlan {
  id: string;
  name: string;
  bestFor: string;
  features: Array<{ label: string; included: boolean | string }>;
}

export interface ComparisonSet {
  id: string;
  title: string;
  description: string;
  plans: ComparisonPlan[];
}

export const coverageComparisons: ComparisonSet[] = [
  {
    id: "motor",
    title: "Motor — third party vs comprehensive",
    description: "Indicative comparison for private cars. Insurer wordings vary — we confirm exact terms before you bind.",
    plans: [
      {
        id: "tp",
        name: "Third party",
        bestFor: "Older vehicles or budget-conscious owners meeting legal minimum.",
        features: [
          { label: "Injury / death to third parties", included: true },
          { label: "Damage to third-party property", included: true },
          { label: "Own vehicle accident damage", included: false },
          { label: "Theft / fire of own vehicle", included: false },
          { label: "Windscreen cover", included: false },
          { label: "Roadside assistance", included: "Optional add-on" },
        ],
      },
      {
        id: "comp",
        name: "Comprehensive",
        bestFor: "Financed or newer vehicles where repair costs matter.",
        features: [
          { label: "Injury / death to third parties", included: true },
          { label: "Damage to third-party property", included: true },
          { label: "Own vehicle accident damage", included: true },
          { label: "Theft / fire of own vehicle", included: true },
          { label: "Windscreen cover", included: "Often included" },
          { label: "Roadside assistance", included: "Often optional" },
        ],
      },
    ],
  },
  {
    id: "home",
    title: "Home — buildings vs contents",
    description: "Many households need both; sums insured are declared separately.",
    plans: [
      {
        id: "buildings",
        name: "Buildings",
        bestFor: "Homeowners responsible for structure, roof, and fixed fittings.",
        features: [
          { label: "Fire, lightning, explosion", included: true },
          { label: "Cyclone / flood (where extended)", included: "Extension" },
          { label: "Theft of contents", included: false },
          { label: "Portable valuables away from home", included: false },
          { label: "Alternative accommodation", included: "Often included" },
        ],
      },
      {
        id: "contents",
        name: "Contents",
        bestFor: "Tenants and owners protecting furniture, electronics, and valuables.",
        features: [
          { label: "Fire, lightning, explosion", included: true },
          { label: "Cyclone / flood (where extended)", included: "Extension" },
          { label: "Theft of contents", included: true },
          { label: "Portable valuables away from home", included: "Sub-limit" },
          { label: "Alternative accommodation", included: "If building insured" },
        ],
      },
    ],
  },
];
