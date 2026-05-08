import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Upload,
  BarChart3,
  Users,
  Lock,
  Zap,
  Globe,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  Star,
  Calculator,
  ChevronDown,
  Award,
  Building2,
  HeartHandshake,
  Car,
  Home,
  Briefcase,
  Plane,
  Heart,
} from "lucide-react";
import { useInView } from "../hooks/useInView";
import { useCounter } from "../hooks/useCounter";
import { useTypingEffect } from "../hooks/useTypingEffect";
import { useCurrency } from "../context/CurrencyContext";
import { CurrencySwitcher } from "../components/CurrencySwitcher";
import { ScrollProgress } from "../components/ScrollProgress";
import { BackToTop } from "../components/BackToTop";

function AnimatedSection({
  children,
  className = "",
  animation = "animate-on-scroll",
}: {
  children: React.ReactNode;
  className?: string;
  animation?: string;
}) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={`${animation} ${isInView ? "in-view" : ""} ${className}`}>
      {children}
    </div>
  );
}

function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, isInView } = useInView();
  const count = useCounter(value, isInView);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-bold text-white md:text-5xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-sm text-primary-200 font-medium">{label}</p>
    </div>
  );
}

/* ── Data ── */

const insurers = [
  "Swan Insurance", "MUA Ltd", "Jubilee Insurance", "Lamberts", "Mauritius Union",
  "New India Assurance", "Sicom", "Eagle Insurance", "Allianz", "BPCE",
];

const services = [
  { icon: Upload, title: "Secure Document Portal", desc: "Encrypted drag-and-drop uploads. PDF, JPG, PNG up to 25MB with AES-256 at rest and in transit." },
  { icon: FileText, title: "OCR Intelligence", desc: "Automatic data extraction from policy documents with confidence scoring, validation, and version control." },
  { icon: BarChart3, title: "Admin Dashboard", desc: "Real-time pipeline status, revenue tracking, client analytics, and comprehensive reporting at a glance." },
  { icon: Users, title: "Client Management", desc: "Complete client profiles with policy tracking, document history, communication logs, and payment status." },
  { icon: Lock, title: "Security & Compliance", desc: "Role-based access, 2FA authentication, full audit trails, GDPR-compliant data handling, and AML/KYC." },
  { icon: Zap, title: "Automated Workflows", desc: "Payment notifications via SMS/WhatsApp, policy expiry alerts, and automatic PDF receipt generation." },
];

const policyTypes = [
  { icon: Car, name: "Motor Insurance", desc: "Vehicle coverage, third-party, comprehensive" },
  { icon: Home, name: "Home Insurance", desc: "Property, contents, natural disasters" },
  { icon: Heart, name: "Life Insurance", desc: "Term life, whole life, endowment" },
  { icon: HeartHandshake, name: "Health Insurance", desc: "Medical, dental, critical illness" },
  { icon: Plane, name: "Travel Insurance", desc: "Trip cancellation, medical abroad" },
  { icon: Briefcase, name: "Business Insurance", desc: "Commercial, liability, professional" },
];

const testimonials = [
  { name: "Marie Dupont", role: "Client, 3 years", text: "SecureBroker made managing my insurance policies effortless. The upload portal is incredibly easy to use and I always know the status of my documents.", rating: 5 },
  { name: "Jean-Pierre R.", role: "Business Client", text: "The dashboard gives me a clear overview of all my commercial policies. Outstanding service and technology. My accountant loves the CSV exports.", rating: 5 },
  { name: "Priya Devi", role: "New Client", text: "Setting up was quick and the WhatsApp notifications keep me informed about my policy renewals. Highly recommended for anyone in Mauritius.", rating: 5 },
];

const steps = [
  { step: "01", title: "Upload Documents", desc: "Drag and drop insurance documents into our encrypted portal. We accept all major formats with 25MB limit." },
  { step: "02", title: "Automatic Processing", desc: "Our OCR engine extracts and validates data with confidence scoring, reducing manual entry by 90%." },
  { step: "03", title: "Manage & Export", desc: "Review, approve, and export processed data. Track policies, generate receipts, and serve clients faster." },
];

const certifications = [
  { icon: Award, label: "FSC Mauritius Licensed" },
  { icon: ShieldCheck, label: "Data Protection Act Compliant" },
  { icon: Lock, label: "AES-256 Encryption" },
  { icon: Globe, label: "GDPR Ready" },
];

/* ── Quote Calculator ── */

function QuoteCalculator() {
  const [policyType, setPolicyType] = useState("motor");
  const [coverage, setCoverage] = useState("500000");
  const { format } = useCurrency();

  const premiumMUR: Record<string, Record<string, number>> = {
    motor: { "250000": 3200, "500000": 5400, "1000000": 8700 },
    home: { "250000": 2100, "500000": 3800, "1000000": 6500 },
    life: { "250000": 1800, "500000": 3200, "1000000": 5900 },
    health: { "250000": 2800, "500000": 4600, "1000000": 7200 },
  };

  const coverageOptions = [250000, 500000, 1000000];
  const estimateValue = premiumMUR[policyType]?.[coverage] ?? 5400;
  const estimate = format(estimateValue);

  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-bold text-surface-foreground">Quick Quote Estimate</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-foreground mb-1.5">Policy Type</label>
          <div className="relative">
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer transition-colors duration-200"
            >
              <option value="motor">Motor Insurance</option>
              <option value="home">Home Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="health">Health Insurance</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-foreground mb-1.5">Coverage Amount</label>
          <div className="relative">
            <select
              value={coverage}
              onChange={(e) => setCoverage(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-surface-foreground focus:border-primary-500 focus:ring-2 focus:ring-ring/20 focus:outline-none cursor-pointer transition-colors duration-200"
            >
              {coverageOptions.map((val) => (
                <option key={val} value={String(val)}>{format(val)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="rounded-xl bg-primary-50 border border-primary-200 p-5 text-center">
          <p className="text-sm text-muted-foreground">Estimated Monthly Premium</p>
          <p className="mt-1 text-3xl font-bold text-primary-700 transition-all duration-300">{estimate}</p>
          <p className="mt-1 text-xs text-muted-foreground">per month *</p>
        </div>

        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-600 cursor-pointer transition-colors duration-200"
        >
          Get Detailed Quote
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-xs text-muted-foreground text-center">
          * Indicative estimate only. Final premium depends on individual assessment.
        </p>
      </div>
    </div>
  );
}

/* ── Page ── */

export function HomePage() {
  const heroRef = useInView();
  const typedWord = useTypingEffect(
    ["Partner", "Advisor", "Shield", "Solution"],
    90,
    60,
    2500
  );

  return (
    <div className="min-h-screen bg-primary-50">
      <ScrollProgress />
      <BackToTop />

      {/* Sticky Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-accent-500" />
            <span className="text-lg font-bold text-primary-900 tracking-tight">SecureBroker</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-primary-700 lg:flex">
            <a href="#services" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Services</a>
            <a href="#products" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Products</a>
            <a href="#quote" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Get Quote</a>
            <a href="#testimonials" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Testimonials</a>
            <a href="#contact" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySwitcher />
            <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 cursor-pointer transition-colors duration-200 sm:block">
              Sign In
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200">
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Trust & Authority pattern */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-accent-500 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-primary-400 blur-3xl animate-float-delayed" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div ref={heroRef.ref} className={`max-w-3xl animate-on-scroll ${heroRef.isInView ? "in-view" : ""}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-100 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-4 w-4 text-accent-400" />
              Licensed Insurance Broker — Mauritius
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your Trusted Insurance{" "}
              <span className="text-accent-400">{typedWord}</span>
              <span className="animate-pulse text-accent-400">|</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-200 leading-relaxed">
              Comprehensive insurance solutions for individuals and businesses across Mauritius.
              Upload documents, get instant quotes, manage policies — all in one secure portal.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#quote"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-accent-600 cursor-pointer transition-colors duration-200 animate-pulse-glow"
              >
                <Calculator className="h-4 w-4" />
                Get a Quote
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                Client Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-primary-200">
              {["No obligation quote", "256-bit SSL encryption", "FSC Mauritius Licensed"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent-400 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Insurers Logo Bar */}
      <section className="bg-white border-y border-border py-8 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            Partnered with leading insurers
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {insurers.map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-foreground/60 hover:text-primary-600 cursor-default transition-colors duration-200 whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          <StatCounter value={700} suffix="+" label="Active Clients" />
          <StatCounter value={2500} suffix="+" label="Policies Managed" />
          <StatCounter value={99} suffix=".9%" label="Uptime SLA" />
          <StatCounter value={15000} suffix="+" label="Documents Processed" />
        </div>
      </section>

      {/* Certifications Bar */}
      <section className="bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {certifications.map((cert) => (
              <div key={cert.label} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <cert.icon className="h-5 w-5 text-accent-600 shrink-0" />
                {cert.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Products */}
      <section id="products" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Insurance Products</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              Comprehensive Coverage for Every Need
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We partner with Mauritius's leading insurers to bring you the best rates and coverage options.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {policyTypes.map((p, i) => (
              <AnimatedSection key={p.name} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <a
                  href="#quote"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-6 hover:shadow-md hover:border-primary-200 cursor-pointer transition-all duration-300"
                >
                  <div className="rounded-xl bg-primary-50 p-3 group-hover:bg-primary-100 transition-colors duration-300 shrink-0">
                    <p.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 group-hover:gap-2 transition-all duration-200">
                      Get Quote <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </a>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Calculator + How It Works */}
      <section id="quote" className="bg-surface py-20 lg:py-28 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <AnimatedSection animation="animate-slide-left">
                <span className="text-sm font-semibold text-accent-600 uppercase tracking-wider">Instant Estimate</span>
                <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
                  Get Your Quote in Seconds
                </h2>
                <p className="mt-4 text-muted-foreground max-w-lg">
                  Use our quick calculator for an instant estimate, then request a detailed quote
                  tailored to your exact needs. No obligation, no hidden fees.
                </p>
              </AnimatedSection>

              <AnimatedSection className="mt-12" animation="animate-slide-left stagger-2">
                <h3 className="text-lg font-semibold text-surface-foreground mb-6">How It Works</h3>
                <div className="space-y-6">
                  {steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white text-sm font-bold shrink-0">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-surface-foreground">{s.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            <AnimatedSection animation="animate-slide-right">
              <QuoteCalculator />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Services / Platform Features */}
      <section id="services" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Our Platform</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              Built for Insurance Professionals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From document intake to policy management, our platform covers every step of the broker workflow.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <div className="group rounded-2xl border border-border bg-surface p-8 hover:shadow-lg hover:border-primary-200 cursor-pointer transition-all duration-300">
                  <div className="inline-flex rounded-xl bg-primary-50 p-3 group-hover:bg-primary-100 transition-colors duration-300">
                    <service.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-surface-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-surface py-20 lg:py-28 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Client Stories</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              Trusted by Clients Across Mauritius
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} className={`stagger-${i + 1}`} animation="animate-on-scroll">
                <div className="rounded-2xl border border-border bg-primary-50/30 p-8 hover:shadow-md transition-shadow duration-300">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning-500 text-warning-500" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800" />
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-accent-500 blur-3xl animate-float" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <AnimatedSection className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-accent-400 mb-4" />
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Protect What Matters?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-200">
              Join 700+ clients across Mauritius who trust SecureBroker.
              Get your free, no-obligation quote today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#quote"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-600 cursor-pointer transition-colors duration-200"
              >
                <Calculator className="h-4 w-4" />
                Get Your Quote
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                Access Client Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-primary-950 text-primary-200">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-7 w-7 text-accent-500" />
                <span className="text-lg font-bold text-white tracking-tight">SecureBroker</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed">
                Your trusted insurance broker portal. Managing policies, processing documents,
                and serving clients across Mauritius. Licensed by the Financial Services Commission.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400 border border-accent-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                  All Systems Operational
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-800 px-3 py-1 text-xs font-medium text-primary-300 border border-primary-700">
                  <Award className="h-3 w-3" />
                  FSC Licensed
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
              <div className="mt-4 space-y-3 text-sm">
                <a href="#products" className="block hover:text-white cursor-pointer transition-colors duration-200">Insurance Products</a>
                <a href="#quote" className="block hover:text-white cursor-pointer transition-colors duration-200">Get a Quote</a>
                <a href="#services" className="block hover:text-white cursor-pointer transition-colors duration-200">Our Platform</a>
                <a href="#testimonials" className="block hover:text-white cursor-pointer transition-colors duration-200">Testimonials</a>
                <Link to="/login" className="block hover:text-white cursor-pointer transition-colors duration-200">Client Portal</Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><span>+230 123 4567</span></div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><span>info@securebroker.mu</span></div>
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>Port Louis, Mauritius</span></div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 shrink-0" /><span>securebroker.mu</span></div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-800 pt-8 text-center text-xs text-primary-400">
            <p>&copy; 2025 SecureBroker Insurance Ltd. All rights reserved. Licensed Insurance Broker — Mauritius FSC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
