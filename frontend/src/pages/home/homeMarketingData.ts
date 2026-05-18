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
    title: "Secure Document Portal",
    desc: "Encrypted drag-and-drop uploads. PDF, JPG, PNG up to 25MB with AES-256 at rest and in transit.",
  },
  {
    icon: FileText,
    title: "OCR Intelligence",
    desc: "Automatic data extraction from policy documents with confidence scoring, validation, and version control.",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    desc: "Real-time pipeline status, revenue tracking, client analytics, and comprehensive reporting at a glance.",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Complete client profiles with policy tracking, document history, communication logs, and payment status.",
  },
  {
    icon: Lock,
    title: "Security & Compliance",
    desc: "Role-based access, 2FA authentication, full audit trails, GDPR-compliant data handling, and AML/KYC.",
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    desc: "Payment notifications via SMS/WhatsApp, policy expiry alerts, and automatic PDF receipt generation.",
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
    text: "The dashboard gives me a clear overview of all my commercial policies. Outstanding service and technology. My accountant loves the CSV exports.",
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
    title: "Upload Documents",
    desc: "Drag and drop insurance documents into our encrypted portal. We accept all major formats with 25MB limit.",
  },
  {
    step: "02",
    title: "Automatic Processing",
    desc: "Our OCR engine extracts and validates data with confidence scoring, reducing manual entry by 90%.",
  },
  {
    step: "03",
    title: "Manage & Export",
    desc: "Review, approve, and export processed data. Track policies, generate receipts, and serve clients faster.",
  },
];

export const certifications: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Award, label: "FSC Mauritius Licensed" },
  { icon: ShieldCheck, label: "Data Protection Act Compliant" },
  { icon: Lock, label: "AES-256 Encryption" },
  { icon: Globe, label: "GDPR Ready" },
];
