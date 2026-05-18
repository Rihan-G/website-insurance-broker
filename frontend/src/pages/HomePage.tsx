import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  Star,
  Calculator,
  Building2,
  Award,
} from "lucide-react";
import { useInView } from "../hooks/useInView";
import { ParticleField } from "../components/ParticleField";
import { WaveDivider } from "../components/WaveDivider";
import { KineticHeading, Typewriter } from "../components/KineticHeading";
import { useTheme } from "../context/ThemeContext";
import { ScrollProgress } from "../components/ScrollProgress";
import { BackToTop } from "../components/BackToTop";
import { COMPANY_NAME, CONTACT_EMAIL, WEBSITE_DOMAIN, COMPANY_NAME_SHORT } from "../lib/branding";
import { AnimatedSection, StatCounter } from "./home/HomeAnimatedPrimitives";
import { HomeQuoteCalculator } from "./home/HomeQuoteCalculator";
import { HomeMarketingNav } from "./home/HomeMarketingNav";
import {
  insurers,
  services,
  policyTypes,
  testimonials,
  steps,
  certifications,
} from "./home/homeMarketingData";

export function HomePage() {
  const heroRef = useInView();
  const { resolved } = useTheme();
  const waveLightFill = resolved === "dark" ? "#111c2f" : "#ffffff";

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-background">
      <ScrollProgress />
      <BackToTop />
      <HomeMarketingNav />

      {/* ═══════════════════════════════════════════════════════════════
           Hero — Aurora UI + Motion-Driven + Kinetic Typography
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 animated-mesh" />

        <div className="aurora-bg">
          <div className="aurora-orb-1 aurora-home-hero-1" />
          <div className="aurora-orb-2 aurora-home-hero-2" />
          <div className="aurora-orb-3 aurora-home-hero-3" />
          <div className="aurora-orb-4 aurora-home-hero-4" />
          <div className="aurora-orb-1 aurora-home-hero-5" />
        </div>

        <div className="scan-line" />

        <ParticleField count={35} variant="rise" />

        <div className="absolute inset-0 dot-grid opacity-20" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div ref={heroRef.ref} className={`max-w-3xl animate-on-scroll ${heroRef.isInView ? "in-view" : ""}`}>
            <div className="mb-6 badge-float inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm font-semibold text-accent-300 ring-1 ring-accent-500/30">
              <ShieldCheck className="h-4 w-4 text-accent-400" />
              Licensed Insurance Broker — Mauritius
              <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse ring-2 ring-accent-400/40" />
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              <KineticHeading text="Your Trusted Insurance" highlightWords={[]} delay={300} />
              <br />
              <Typewriter words={["Partner", "Protector", "Advisor", "Platform"]} className="text-gradient-warm" speed={80} />
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-primary-200 leading-relaxed">
              Comprehensive insurance solutions for individuals and businesses across Mauritius. Upload documents, get instant quotes,
              manage policies — all in one secure portal.
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

        <WaveDivider topColor="#082F49" bottomColor={waveLightFill} height={80} />
      </section>

      <section className="bg-white dark:bg-slate-900 border-y border-border py-6 overflow-hidden">
        <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-widest mb-5">Partnered with leading insurers</p>
        <div className="marquee-container">
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

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 animated-mesh" />
        <div className="aurora-bg">
          <div className="aurora-orb-3 aurora-home-stats-1" />
          <div className="aurora-orb-4 aurora-home-stats-2" />
        </div>
        <ParticleField count={12} variant="drift" />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-5 px-6 py-14 md:grid-cols-4">
          {[
            { value: 700, suffix: "+", label: "Active Clients" },
            { value: 2500, suffix: "+", label: "Policies Managed" },
            { value: 99, suffix: ".9%", label: "Uptime SLA" },
            { value: 15000, suffix: "+", label: "Documents Processed" },
          ].map((s) => (
            <div key={s.label} className="glass glow-card-anim rounded-2xl p-5 text-center ring-1 ring-white/10">
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
        <WaveDivider topColor="#082F49" bottomColor={waveLightFill} height={60} flip />
      </section>

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

      <section id="products" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Insurance Products</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">Comprehensive Coverage for Every Need</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We partner with Mauritius&apos;s leading insurers to bring you the best rates and coverage options.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {policyTypes.map((p, i) => (
              <AnimatedSection key={p.name} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <a href="#quote" className="card-hover card-glow group flex items-start gap-4 rounded-2xl border border-border bg-surface p-6 cursor-pointer">
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

      <section id="quote" className="bg-surface py-20 lg:py-28 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <AnimatedSection animation="animate-slide-left">
                <span className="text-sm font-semibold text-accent-600 uppercase tracking-wider">Instant Estimate</span>
                <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">Get Your Quote in Seconds</h2>
                <p className="mt-4 text-muted-foreground max-w-lg">
                  Use our quick calculator for an instant estimate, then request a detailed quote tailored to your exact needs. No obligation, no hidden fees.
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
              <HomeQuoteCalculator />
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Our Platform</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">Built for Insurance Professionals</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From document intake to policy management, our platform covers every step of the broker workflow.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} className={`stagger-${i + 1}`} animation="animate-scale-in">
                <div className="card-hover card-glow group rounded-2xl border border-border bg-surface p-7 cursor-default relative overflow-hidden">
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

      <section id="testimonials" className="bg-surface py-20 lg:py-28 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Client Stories</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 dark:text-primary-50 sm:text-4xl">Trusted by Clients Across Mauritius</h2>
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
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-900 text-primary-700 dark:text-primary-100 text-sm font-bold shadow-sm">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
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
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Protect What Matters?</h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-200">
              Join 700+ clients across Mauritius who trust {COMPANY_NAME_SHORT}. Get your free, no-obligation quote today.
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

      <footer id="contact" className="bg-primary-950 text-primary-200">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-7 w-7 text-accent-500" />
                <span className="text-lg font-bold text-white tracking-tight">{COMPANY_NAME_SHORT}</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed">
                Your trusted insurance broker portal. Managing policies, processing documents, and serving clients across Mauritius. Licensed by the Financial Services Commission.
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
                <a href="#products" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Insurance Products
                </a>
                <a href="#quote" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Get a Quote
                </a>
                <a href="#services" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Our Platform
                </a>
                <a href="#testimonials" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Testimonials
                </a>
                <Link to="/login" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Client Portal
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>+230 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{CONTACT_EMAIL}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Port Louis, Mauritius</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>{WEBSITE_DOMAIN}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-800 pt-8 text-center text-xs text-primary-400">
            <p>
              &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. Licensed Insurance Broker — Mauritius FSC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
