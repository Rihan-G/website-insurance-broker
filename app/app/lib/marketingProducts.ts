import type { LucideIcon } from "lucide-react";
import { Car, Home, Heart, HeartHandshake, Plane, Briefcase } from "lucide-react";
import { COMPANY_NAME_SHORT } from "./branding";

export interface MarketingProduct {
  slug: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  summary: string;
  highlights: string[];
  faq?: Array<{ q: string; a: string }>;
  templateId?: string;
}

export const marketingProducts: MarketingProduct[] = [
  {
    slug: "motor",
    name: "Motor Insurance",
    tagline: "Third-party and comprehensive cover for cars, vans, and fleets.",
    icon: Car,
    summary:
      "Whether you need basic third-party liability or full comprehensive protection, we compare options from leading Mauritian insurers and explain excess, NCD, and add-ons in plain language.",
    highlights: [
      "Third-party, third-party fire & theft, and comprehensive",
      "Fleet placing templates and renewal support",
      "Windscreen, roadside assistance, and young-driver options",
      "Claims guidance from first notice to settlement",
    ],
    faq: [
      { q: "What documents do I need?", a: "ID, driving licence, vehicle registration (form), and previous policy or NCD letter if applicable." },
      { q: "Can you insure a new import?", a: "Yes — we need invoice, shipping documents, and inspection details where required by the insurer." },
    ],
    templateId: "placing-motor",
  },
  {
    slug: "home",
    name: "Home Insurance",
    tagline: "Buildings, contents, and cyclone-related cover for households.",
    icon: Home,
    summary:
      "Protect your home and belongings against fire, theft, water damage, and natural events. We help you declare sums insured accurately so you are not under-insured at claim time.",
    highlights: [
      "Buildings, contents, or combined policies",
      "Cyclone and flood extensions where available",
      "Valuation support for reinstatement sums",
      "Landlord and tenant liability options",
    ],
    faq: [
      { q: "How do I value my contents?", a: "Room-by-room inventory works best. We provide a checklist and can review before you bind cover." },
    ],
    templateId: "placing-non-motor",
  },
  {
    slug: "life",
    name: "Life Insurance",
    tagline: "Term, whole life, and endowment solutions for families and businesses.",
    icon: Heart,
    summary:
      "Life cover to protect dependents, secure loans, or fund long-term goals. We explain beneficiary nominations and how policies interact with estate planning.",
    highlights: [
      "Term and whole-of-life structures",
      "Key-person and loan protection for businesses",
      "Beneficiary and nomination guidance",
      "Medical underwriting coordination",
    ],
    templateId: "placing-non-motor",
  },
  {
    slug: "health",
    name: "Health Insurance",
    tagline: "Medical, hospitalisation, and critical illness cover.",
    icon: HeartHandshake,
    summary:
      "Individual and group medical schemes with clear network and sub-limit explanations. We help compare co-pays, room limits, and pre-existing condition terms.",
    highlights: [
      "Individual and SME group schemes",
      "Critical illness and top-up hospital plans",
      "Claims pre-authorisation support",
      "Renewal benchmarking across insurers",
    ],
    templateId: "placing-medical",
  },
  {
    slug: "travel",
    name: "Travel Insurance",
    tagline: "Single-trip and annual multi-trip cover for Mauritian travellers.",
    icon: Plane,
    summary:
      "Medical emergencies abroad, trip cancellation, and baggage loss — with clear territory and activity exclusions so you know what is covered before you fly.",
    highlights: [
      "Schengen-compliant certificates where required",
      "Family and annual multi-trip plans",
      "Adventure sports extensions on request",
      "24/7 emergency assistance numbers on policy",
    ],
    templateId: "placing-travel",
  },
  {
    slug: "business",
    name: "Business Insurance",
    tagline: "Commercial property, liability, and professional lines.",
    icon: Briefcase,
    summary:
      "From shops and offices to larger commercial risks — property, business interruption, public liability, and professional indemnity placed with appropriate insurers.",
    highlights: [
      "Public and products liability",
      "Professional indemnity for regulated professions",
      "Commercial property and business interruption",
      "Marine cargo and engineering referrals",
    ],
    templateId: "placing-non-motor",
  },
];

export function getProductBySlug(slug: string): MarketingProduct | undefined {
  return marketingProducts.find((p) => p.slug === slug);
}

export const marketingAboutCopy = {
  headline: `Trusted insurance advice in Mauritius`,
  intro: `${COMPANY_NAME_SHORT} Brokers Ltd is an FSC-licensed insurance broker helping individuals and businesses place cover with leading insurers. We combine local expertise with a secure online portal so you can quote, upload documents, and track renewals in one place.`,
  values: [
    { title: "Licensed & accountable", desc: "We operate under Mauritius FSC broker regulations. Cover is always issued by the named insurer on your policy." },
    { title: "Plain-language advice", desc: "No jargon without explanation — we walk you through options, exclusions, and what happens at claim time." },
    { title: "Digital + human", desc: "Use the portal for documents and renewals; speak to a broker when you need judgment on complex risks." },
  ],
};
