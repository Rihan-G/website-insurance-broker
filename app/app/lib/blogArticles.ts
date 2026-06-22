export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  body: string[];
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "cyclone-season-checklist",
    title: "Cyclone season: home insurance checklist for Mauritius",
    excerpt: "Before the season peaks, review sums insured, roof condition, and cyclone extensions on your policy.",
    date: "2026-05-12",
    category: "Home",
    body: [
      "Mauritius cyclone season typically runs November through April. Insurers often require accurate building sums insured — under-insurance can reduce claim payments proportionally.",
      "Photograph your roof, shutters, and outdoor structures. Keep receipts for improvements that increase reinstatement value.",
      "Check whether your policy includes cyclone/flood extensions and what excess applies. Contact your broker before binding changes if you are unsure.",
    ],
  },
  {
    slug: "motor-ncd-explained",
    title: "No-claims discount: what transfers when you switch insurer",
    excerpt: "How NCD letters work in Mauritius and what to send when renewing or moving motor cover.",
    date: "2026-04-03",
    category: "Motor",
    body: [
      "A no-claims discount (NCD) rewards claim-free years. When switching insurers, you usually need a letter or schedule from your previous insurer confirming your NCD level.",
      "Allow time before renewal — some insurers will not back-date NCD if documents arrive late.",
      "Fleet policies may track NCD differently; ask your broker how named drivers affect your premium.",
    ],
  },
  {
    slug: "travel-schengen-certificate",
    title: "Travel insurance certificates for Schengen visas",
    excerpt: "What embassies expect on travel medical cover and how to get the right certificate quickly.",
    date: "2026-03-18",
    category: "Travel",
    body: [
      "Schengen visa applications often require minimum medical cover (commonly €30,000) for the full trip duration.",
      "Your broker can issue a certificate showing limits, territory, and emergency assistance number — request it when you bind cover, not at the airport.",
      "Declare pre-existing conditions accurately; undeclared conditions may void medical sections of the policy.",
    ],
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}
