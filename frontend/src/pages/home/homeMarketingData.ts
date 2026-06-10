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
import { COMPANY_NAME_SHORT } from "../../lib/branding";

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

export const policyTypes: Array<{ icon: LucideIcon; name: string; desc: string }> = [
  { icon: Car, name: "Motor Insurance", desc: "Vehicle coverage, third-party, comprehensive" },
  { icon: Home, name: "Home Insurance", desc: "Property, contents, natural disasters" },
  { icon: Heart, name: "Life Insurance", desc: "Term life, whole life, endowment" },
  { icon: HeartHandshake, name: "Health Insurance", desc: "Medical, dental, critical illness" },
  { icon: Plane, name: "Travel Insurance", desc: "Trip cancellation, medical abroad" },
  { icon: Briefcase, name: "Business Insurance", desc: "Commercial, liability, professional" },
];

export const testimonials = [
  {
    name: "Marie Dupont",
    role: "Client, 3 years",
    text: `${COMPANY_NAME_SHORT} made managing my insurance policies effortless. The upload portal is easy to use and I always know the status of my documents.`,
    rating: 5,
  },
  {
    name: "Jean-Pierre R.",
    role: "Business Client",
    text: "I finally have one place to see renewals, messages, and documents for our shop policies. The team is responsive and the online experience feels professional.",
    rating: 5,
  },
  {
    name: "Priya Devi",
    role: "New Client",
    text: "Setting up was quick and the WhatsApp notifications keep me informed about my policy renewals. Highly recommended for anyone in Mauritius.",
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
