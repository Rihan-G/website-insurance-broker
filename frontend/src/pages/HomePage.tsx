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
import { ParticleField } from "../components/ParticleField";
import { WaveDivider } from "../components/WaveDivider";
import { KineticHeading, Typewriter } from "../components/KineticHeading";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
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
    <div className="neon-border rounded-2xl bg-surface p-8 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary-600 ring-pulse" />
        <h3 className="text-xl font-bold text-surface-foreground">Quick Quote Estimate</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-surface-foreground mb-1.5">Policy Type</label>
          <div className="relative">
            <select
              aria-label="Select policy type"
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
              aria-label="Select coverage amount"
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

        <div className="rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 p-5 text-center">
          <p className="text-sm text-muted-foreground">Estimated Monthly Premium</p>
          <p className="mt-1 text-3xl font-bold text-primary-700 dark:text-primary-300 transition-all duration-300">{estimate}</p>
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
  const { resolved } = useTheme();
  const waveLightFill = resolved === "dark" ? "#111c2f" : "#ffffff";

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-background">
      <ScrollProgress />
      <BackToTop />
      {/* Sticky Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-primary-100 dark:border-border bg-white/80 dark:bg-surface/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-accent-500" />
            <span className="text-lg font-bold text-primary-900 dark:text-primary-50 tracking-tight">SecureBroker</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-primary-700 dark:text-primary-200 md:flex">
            <a href="#services" className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Services</a>
            <a href="#products" className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Products</a>
            <a href="#quote" className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Get Quote</a>
            <a href="#testimonials" className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Testimonials</a>
            <a href="#contact" className="hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors duration-200">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySwitcher />
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-200 hover:bg-primary-50 dark:hover:bg-muted cursor-pointer transition-colors duration-200 sm:block">
              Sign In
            </Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200">
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
           Hero — Aurora UI + Motion-Driven + Kinetic Typography
           ui-ux-pro-max-skill #10 Aurora, #15 Motion-Driven, #30 Kinetic
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16">
        {/* Animated mesh base */}
        <div className="absolute inset-0 animated-mesh" />

        {/* VISIBLE Aurora orbs — lower blur, higher opacity */}
        <div className="aurora-bg">
          {/* Large cyan orb — top-left */}
          <div className="aurora-orb-1 aurora-home-hero-1" />
          {/* Large green orb — bottom-right */}
          <div className="aurora-orb-2 aurora-home-hero-2" />
          {/* Medium sky orb — center-right */}
          <div className="aurora-orb-3 aurora-home-hero-3" />
          {/* Small amber orb — bottom-left */}
          <div className="aurora-orb-4 aurora-home-hero-4" />
          {/* Extra small white orb — top-right */}
          <div className="aurora-orb-1 aurora-home-hero-5" />
        </div>

        {/* Animated scan line */}
        <div className="scan-line" />

        {/* Rising particles */}
        <ParticleField count={35} variant="rise" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-20" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div ref={heroRef.ref} className={`max-w-3xl animate-on-scroll ${heroRef.isInView ? "in-view" : ""}`}>

            {/* Floating badge */}
            <div className="mb-6 badge-float inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold text-accent-300 ring-1 ring-accent-500/30">
              <ShieldCheck className="h-4 w-4 text-accent-400" />
              Licensed Insurance Broker — Mauritius
              <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse ring-2 ring-accent-400/40" />
            </div>

            {/* Kinetic heading */}
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              <KineticHeading
                text="Your Trusted Insurance"
                highlightWords={[]}
                delay={300}
              />
              <br />
              <Typewriter
                words={["Partner", "Protector", "Advisor", "Platform"]}
                className="text-gradient-warm"
                speed={80}
              />
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-primary-200 leading-relaxed">
              Comprehensive insurance solutions for individuals and businesses across Mauritius.
              Upload documents, get instant quotes, manage policies — all in one secure portal.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#quote"
                className="btn-glow ring-pulse inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-7 py-3.5 text-sm font-bold text-white hover:from-accent-600 hover:to-accent-700 cursor-pointer shadow-lg shadow-accent-500/40 transition-all duration-200"
              >
                <Calculator className="h-4 w-4" />
                Get a Free Quote
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl glass border border-white/25 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/15 cursor-pointer transition-all duration-200"
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

        {/* Animated wave bottom */}
        <WaveDivider topColor="#082F49" bottomColor={waveLightFill} height={80} />
      </section>

      {/* Trusted Insurers — Auto-scrolling marquee ticker */}
      <section className="bg-white dark:bg-slate-900 border-y border-border py-6 overflow-hidden">
        <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">
          Partnered with leading insurers
        </p>
        <div className="marquee-container">
          {/* Duplicate list for seamless loop */}
          <div className="flex animate-marquee gap-0">
            {[...insurers, ...insurers].map((name, i) => (
              <div key={`${name}-${i}`} className="flex items-center gap-8 px-8 shrink-0">
                <span className="text-sm font-semibold text-muted-foreground/70 hover:text-primary-600 cursor-default transition-colors duration-200 whitespace-nowrap">
                  {name}
                </span>
                <span className="h-1 w-1 rounded-full bg-primary-200 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — Glassmorphism cards with glow animation */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-mesh" />
        {/* Visible orbs in stats too */}
        <div className="aurora-bg">
          <div className="aurora-orb-3 aurora-home-stats-1" />
          <div className="aurora-orb-4 aurora-home-stats-2" />
        </div>
        <ParticleField count={12} variant="drift" />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-5 px-6 py-14 md:grid-cols-4">
          {[
            { value: 700,   suffix: "+",   label: "Active Clients" },
            { value: 2500,  suffix: "+",   label: "Policies Managed" },
            { value: 99,    suffix: ".9%", label: "Uptime SLA" },
            { value: 15000, suffix: "+",   label: "Documents Processed" },
          ].map((s) => (
            <div key={s.label} className="glass glow-card-anim rounded-2xl p-5 text-center ring-1 ring-white/10">
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
        <WaveDivider topColor="#082F49" bottomColor={waveLightFill} height={60} flip />
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
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">
              Comprehensive Coverage for Every Need
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We partner with Mauritius's leading insurers to bring you the best rates and coverage options.
            </p>
          </AnimatedSection>

          {/* Bento Box Grid — ui-ux-pro-max-skill #21 */}
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {policyTypes.map((p, i) => (
              <AnimatedSection key={p.name} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <a
                  href="#quote"
                  className="card-hover card-glow group flex items-start gap-4 rounded-2xl border border-border bg-surface p-6 cursor-pointer"
                >
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300 shrink-0 shadow-sm">
                    <p.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-surface-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:gap-2.5 transition-all duration-200">
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
                <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">
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
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">
              Built for Insurance Professionals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From document intake to policy management, our platform covers every step of the broker workflow.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <div className="card-hover card-glow group rounded-2xl border border-border bg-surface p-7 cursor-default relative overflow-hidden">
                  {/* Subtle gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 to-primary-50/0 group-hover:from-primary-50/40 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className="inline-flex rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300 shadow-sm">
                      <service.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-surface-foreground">{service.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  </div>
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
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">
              Trusted by Clients Across Mauritius
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} className={`stagger-${i + 1}`} animation="animate-on-scroll">
                <div className="card-hover group rounded-2xl border border-border bg-surface p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-warning-500 text-warning-500" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 text-primary-700 dark:text-primary-100 text-sm font-bold shadow-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — Full aurora with particles */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-mesh" />
        <div className="aurora-bg">
          <div className="aurora-orb-1 aurora-home-cta-1" />
          <div className="aurora-orb-2 aurora-home-cta-2" />
          <div className="aurora-orb-3 aurora-home-cta-3" />
        </div>
        <div className="scan-line scan-line-delayed" />
        <ParticleField count={20} variant="rise" />
        <div className="absolute inset-0 dot-grid opacity-12" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <AnimatedSection className="text-center">
            <Building2 className="mx-auto h-10 w-10 text-accent-400 mb-4" />
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Protect What Matters?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-200">
              Join 700+ clients across Mauritius who trust SecureBroker.
              Get your free, no-obligation quote today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#quote"
                className="btn-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-8 py-3.5 text-sm font-bold text-white hover:from-accent-600 hover:to-accent-700 cursor-pointer shadow-lg shadow-accent-500/30 transition-all duration-200"
              >
                <Calculator className="h-4 w-4" />
                Get Your Quote
              </a>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl glass border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/15 cursor-pointer transition-all duration-200"
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
