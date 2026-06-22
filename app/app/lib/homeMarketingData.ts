import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  FileText,
  Upload,
  BarChart3,
  Users,
  Lock,
  Zap,
  Globe,
  Award,
  Car,
  Home,
  Briefcase,
  Plane,
  Heart,
  HeartHandshake,
  Headphones,
  Clock,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

export const insurers = [
  "Swan Insurance",
  "MUA Ltd",
  "Jubilee Insurance",
  "Lamberts",
  "Mauritius Union",
  "New India Assurance",
  "Sicom",
  "Eagle Insurance",
  "Allianz",
  "BPCE",
];

export const services: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  {
    icon: Upload,
    title: "Secure document sharing",
    desc: "Send policies and proof documents through an encrypted portal: simple uploads, clear status, and no email attachments to chase.",
  },
  {
    icon: FileText,
    title: "Clearer paperwork, faster answers",
    desc: "We help structure what you send so your cover can be reviewed accurately, with less back-and-forth and fewer missed details.",
  },
  {
    icon: BarChart3,
    title: "Your cover in one place",
    desc: "See renewals, messages, and what needs your attention in a single online hub, whether you have one policy or several.",
  },
  {
    icon: Users,
    title: "People you can reach",
    desc: "Work with licensed advisors who explain options in plain language and stay with you from quote to claim.",
  },
  {
    icon: Lock,
    title: "Privacy & security",
    desc: "Strong sign-in options, encrypted connections, and handling aligned with data-protection expectations for financial services.",
  },
  {
    icon: Zap,
    title: "Timely reminders",
    desc: "Renewal and payment prompts by email or WhatsApp (where you opt in) so important dates do not slip past unnoticed.",
  },
];

export const policyTypes: Array<{ icon: LucideIcon; name: string; slug: string; desc: string }> = [
  { icon: Car, name: "Motor Insurance", slug: "motor", desc: "Vehicle coverage, third-party, comprehensive" },
  { icon: Home, name: "Home Insurance", slug: "home", desc: "Property, contents, natural disasters" },
  { icon: Heart, name: "Life Insurance", slug: "life", desc: "Term life, whole life, endowment" },
  { icon: HeartHandshake, name: "Health Insurance", slug: "health", desc: "Medical, dental, critical illness" },
  { icon: Plane, name: "Travel Insurance", slug: "travel", desc: "Trip cancellation, medical abroad" },
  { icon: Briefcase, name: "Business Insurance", slug: "business", desc: "Commercial, liability, professional" },
];

export const testimonials = [
  {
    name: "Marie Dupont",
    role: "Motor client, Port Louis",
    location: "Port Louis",
    detail: "Motor claim settled in 9 days",
    text: "My car was hit while parked in Rose Hill. I reported the incident through the portal on a Tuesday morning and had a settlement confirmation by the following Thursday. Nine days start to finish, with updates at every stage.",
    rating: 5,
  },
  {
    name: "Jean-Pierre R.",
    role: "Business owner, Quatre Bornes",
    location: "Quatre Bornes",
    detail: "3 commercial policies, one place",
    text: "We insure our shop stock, vehicles, and staff health through Sindicom. Before, I was chasing three separate insurers at renewal time. Now I get one reminder, upload once, and the advisor handles the rest.",
    rating: 5,
  },
  {
    name: "Priya Devi",
    role: "New client, Vacoas",
    location: "Vacoas",
    detail: "First policy set up in under 20 minutes",
    text: "I had been putting off getting home contents cover for two years because the paperwork felt overwhelming. The checklist on the portal told me exactly what to upload, and my advisor confirmed cover the same afternoon.",
    rating: 5,
  },
];

export const steps = [
  {
    step: "01",
    title: "Tell us what you need",
    desc: "Use the quick estimate or reach out by phone or WhatsApp. We confirm details and next steps with no obligation.",
  },
  {
    step: "02",
    title: "Share documents securely",
    desc: "Upload policies or proof documents through our encrypted portal so we can review cover accurately and quickly.",
  },
  {
    step: "03",
    title: "Stay covered with support",
    desc: "Track renewals and messages in your online area, and lean on your advisor when life changes or you need to claim.",
  },
];

export const certifications: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Award, label: "FSC Mauritius Licensed" },
  { icon: ShieldCheck, label: "Data Protection Act Compliant" },
  { icon: Lock, label: "AES-256 Encryption" },
  { icon: Globe, label: "GDPR Ready" },
];

export const whyChooseUs: Array<{ icon: LucideIcon; title: string; desc: string; tone: string }> = [
  {
    icon: BadgeCheck,
    title: "Licensed & regulated",
    desc: "FSC-authorised brokerage with transparent advice and insurer partnerships you can verify.",
    tone: "from-primary-600 to-primary-800",
  },
  {
    icon: Clock,
    title: "Faster turnaround",
    desc: "Structured uploads and digital workflows reduce back-and-forth so cover can move quicker.",
    tone: "from-primary-400 to-primary-700",
  },
  {
    icon: Headphones,
    title: "Human when it counts",
    desc: "Phone, email, and WhatsApp access to advisors, not a faceless call centre.",
    tone: "from-cyan-500 to-primary-700",
  },
  {
    icon: Sparkles,
    title: "Smart reminders",
    desc: "Renewal and payment nudges help you avoid lapses and last-minute scrambles.",
    tone: "from-amber-500 to-orange-700",
  },
];

export const claimsJourney = [
  {
    step: "01",
    title: "Report the incident",
    desc: "Capture what happened, where, and when using a guided first-notice flow.",
  },
  {
    step: "02",
    title: "Upload evidence",
    desc: "Add photos, reports, or estimates through the secure client portal.",
  },
  {
    step: "03",
    title: "Broker review",
    desc: "Your advisor checks completeness and liaises with the insurer on your behalf.",
  },
  {
    step: "04",
    title: "Track progress",
    desc: "Follow status updates and messages until the claim reaches a clear outcome.",
  },
];
