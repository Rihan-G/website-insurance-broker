import { useState } from "react";
import { Link } from "react-router-dom";
import { ExplainCoverTool } from "../components/ExplainCoverTool";
import {
  Car, Home, Heart, HeartPulse, Plane, Briefcase,
  CheckCircle, Phone, MessageCircle, Mail, MapPin,
  Award, ShieldCheck, Star, ChevronRight, ArrowRight,
} from "lucide-react";
import { COMPANY_NAME, COMPANY_NAME_SHORT, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_PHONE_WHATSAPP } from "../lib/branding";

const products = [
  {
    id: "motor",
    icon: Car,
    title: "Motor Insurance",
    subtitle: "Comprehensive & Third-Party Cover",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    description: "Protect your vehicle against accidents, theft, fire, and third-party liability. Available for private cars, vans, motorbikes, and commercial vehicles.",
    features: ["Accident & collision cover", "Theft & fire protection", "Third-party liability", "No Claims Discount (NCD)", "Roadside assistance", "Windscreen cover"],
    startingFrom: "MUR 8,500",
  },
  {
    id: "home",
    icon: Home,
    title: "Home Insurance",
    subtitle: "Building & Contents Cover",
    color: "from-green-500 to-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    description: "Safeguard your home and belongings against natural disasters, burglary, fire, and accidental damage. Covers houses, apartments, and villas.",
    features: ["Building structure cover", "Contents & valuables", "Natural disaster cover", "Burglary & theft", "Alternative accommodation", "Public liability"],
    startingFrom: "MUR 3,200",
  },
  {
    id: "life",
    icon: Heart,
    title: "Life Insurance",
    subtitle: "Term & Whole of Life Plans",
    color: "from-rose-500 to-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    description: "Secure your family's financial future with life cover tailored to your needs. Term life, whole of life, and mortgage protection plans available.",
    features: ["Death benefit payout", "Critical illness rider", "Disability cover", "Flexible premiums", "Joint life options", "Mortgage protection"],
    startingFrom: "MUR 1,200 / month",
  },
  {
    id: "health",
    icon: HeartPulse,
    title: "Health Insurance",
    subtitle: "Individual & Family Plans",
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    description: "Access quality healthcare with comprehensive medical insurance covering hospitalisation, outpatient consultations, and specialist treatments.",
    features: ["Hospitalisation cover", "Outpatient consultations", "Specialist referrals", "Maternity cover", "Dental & optical add-ons", "International cover"],
    startingFrom: "MUR 18,000 / year",
  },
  {
    id: "travel",
    icon: Plane,
    title: "Travel Insurance",
    subtitle: "Single Trip & Annual Plans",
    color: "from-sky-500 to-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    description: "Travel with confidence knowing you're covered for medical emergencies, trip cancellations, lost luggage, and flight delays worldwide.",
    features: ["Emergency medical cover", "Trip cancellation", "Lost baggage cover", "Flight delay compensation", "Personal liability", "24/7 emergency helpline"],
    startingFrom: "MUR 1,800 / trip",
  },
  {
    id: "business",
    icon: Briefcase,
    title: "Business Insurance",
    subtitle: "SME & Corporate Packages",
    color: "from-amber-500 to-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    description: "Comprehensive business protection covering public liability, employer's liability, property, equipment, and business interruption.",
    features: ["Public liability", "Employer's liability", "Property & contents", "Business interruption", "Professional indemnity", "Cyber liability"],
    startingFrom: "MUR 12,000 / year",
  },
];

const testimonials = [
  { name: "Marie Dupont", role: "Motor Insurance client", rating: 5, text: `Excellent service! My claim was processed within 48 hours. Highly recommend ${COMPANY_NAME_SHORT}.` },
  { name: "Jean-Pierre Ramgoolam", role: "Home & Motor client", rating: 5, text: "The team found me the best cover at a great price. Professional and always available on WhatsApp." },
  { name: "Priya Devi", role: "Health Insurance client", rating: 5, text: `${COMPANY_NAME_SHORT} made finding health insurance easy. The online portal is very convenient.` },
];

const certifications = [
  { name: "FSC Licensed Broker", desc: "Financial Services Commission" },
  { name: "GDPR Compliant", desc: "Data Protection Act 2017" },
  { name: "FATF AML Standards", desc: "Anti-money laundering" },
  { name: "ISO 27001", desc: "Information security" },
];

export function ServicesPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedProduct);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm mb-6">
            <ShieldCheck className="h-4 w-4 text-accent-400" />
            Licensed Insurance Broker · Mauritius
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl">Insurance Solutions for Every Need</h1>
          <p className="mt-4 text-lg text-primary-200 max-w-2xl mx-auto">
            Trusted by 700+ clients across Mauritius. We compare the best insurers to find you the right cover at the best price.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/dashboard/quotes" className="inline-flex items-center gap-2 rounded-lg bg-accent-500 hover:bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200">
              Get a Free Quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200">
              Contact Us
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <ExplainCoverTool />
      </div>

      {/* Products grid */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-surface-foreground">Our Insurance Products</h2>
          <p className="mt-2 text-muted-foreground">Click on any product to learn more</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(selectedProduct === p.id ? null : p.id)}
              className={`text-left rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedProduct === p.id
                  ? `${p.border} ${p.bg} dark:border-slate-600 dark:bg-slate-900/70`
                  : "border-border hover:border-primary-200 dark:hover:border-primary-600"
              }`}
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${p.color} p-3 mb-4`}>
                <p.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-surface-foreground text-lg">{p.title}</h3>
              <p className={`text-sm font-medium ${p.text} dark:opacity-95 dark:brightness-125`}>{p.subtitle}</p>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">From <span className="font-semibold text-surface-foreground">{p.startingFrom}</span></p>
            </button>
          ))}
        </div>

        {/* Expanded product detail */}
        {selected && (
          <div className={`mt-6 rounded-2xl border-2 ${selected.border} ${selected.bg} p-8 dark:border-slate-600 dark:bg-slate-900/70`}>
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${selected.color} p-3 mb-4`}>
                  <selected.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-surface-foreground">{selected.title}</h3>
                <p className={`font-medium ${selected.text} mb-3 dark:opacity-95 dark:brightness-125`}>{selected.subtitle}</p>
                <p className="text-surface-foreground leading-relaxed">{selected.description}</p>
                <p className="mt-4 text-sm text-muted-foreground">Starting from <span className="text-lg font-bold text-surface-foreground">{selected.startingFrom}</span></p>
                <div className="mt-6 flex gap-3">
                  <Link to="/dashboard/quotes" className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-br ${selected.color} px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity`}>
                    Get Quote <ChevronRight className="h-4 w-4" />
                  </Link>
                  <a href="#contact" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-surface-foreground hover:bg-muted transition-colors">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-surface-foreground mb-4">What's Covered</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${selected.text}`} />
                      <span className="text-sm text-surface-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="bg-primary-50 border-y border-border py-12 px-6 dark:bg-primary-950/25 dark:border-border">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-foreground">Certified & Compliant</h2>
            <p className="text-muted-foreground mt-1">Operating under strict regulatory standards</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                <div className="rounded-lg bg-accent-50 p-2 dark:bg-accent-950/50">
                  <Award className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-surface-foreground">What Our Clients Say</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-surface-foreground leading-relaxed italic">"{t.text}"</p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-surface-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact hub */}
      <div id="contact" className="bg-primary-900 text-white py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Get In Touch</h2>
            <p className="text-primary-300 mt-1">We're here to help — reach us on your preferred channel</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Call Us", value: CONTACT_PHONE_DISPLAY, href: `tel:${CONTACT_PHONE_TEL}` },
              { icon: MessageCircle, label: "WhatsApp", value: CONTACT_PHONE_DISPLAY, href: `https://wa.me/${CONTACT_PHONE_WHATSAPP}` },
              { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { icon: MapPin, label: "Office", value: "Port Louis, Mauritius", href: "#" },
            ].map((c) => (
              <a key={c.label} href={c.href} className="flex flex-col items-center rounded-xl bg-white/10 border border-white/20 p-5 hover:bg-white/20 transition-colors duration-200 text-center">
                <div className="rounded-full bg-accent-500/20 border border-accent-500/30 p-3 mb-3">
                  <c.icon className="h-5 w-5 text-accent-400" />
                </div>
                <p className="text-xs text-primary-300 font-medium">{c.label}</p>
                <p className="text-sm font-semibold mt-0.5">{c.value}</p>
              </a>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-primary-400">
            {COMPANY_NAME} · Licensed by the Financial Services Commission, Mauritius
            <br />
            Mon–Fri 8:30 AM – 5:00 PM · Saturday 9:00 AM – 12:00 PM
          </p>
        </div>
      </div>
    </div>
  );
}
