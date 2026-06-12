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
  MessageCircle,
  Linkedin,
  Facebook,
} from "lucide-react";
import { useInView } from "../hooks/useInView";
import { WaveDivider } from "../components/WaveDivider";
import { useTheme } from "../context/ThemeContext";
import { ScrollProgress } from "../components/ScrollProgress";
import { BackToTop } from "../components/BackToTop";
import { FaqAssistant } from "../components/FaqAssistant";
import toast from "react-hot-toast";
import { subscribeNewsletter } from "../lib/newsletterService";
import {
  COMPANY_NAME,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_PHONE_WHATSAPP,
  WEBSITE_DOMAIN,
  COMPANY_NAME_SHORT,
  LINKEDIN_URL,
  FACEBOOK_URL,
} from "../lib/branding";
import { AnimatedSection, StatCounter } from "./home/HomeAnimatedPrimitives";
import { HomeWhyChooseUs } from "./home/HomeWhyChooseUs";
import { HomeClaimsJourney } from "./home/HomeClaimsJourney";
import { HomeQuoteCalculator } from "./home/HomeQuoteCalculator";
import { HomeMarketingNav } from "./home/HomeMarketingNav";
import { HomeStickyCta } from "./home/HomeStickyCta";
import { HomeAssistantTeaser } from "./home/HomeAssistantTeaser";
import { homeFaqItems } from "./home/homeFaqData";
import { HomeHeroDashboardMockup } from "./home/HomeHeroDashboardMockup";
import { HomePlatformPreview } from "./home/HomePlatformPreview";
import { HomeDarkBandBackground, HomeHeroBackground } from "./home/HomeHeroBackground";
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
  const isDark = resolved === "dark";
  const waveLightFill = isDark ? "#111c2f" : "#ffffff";
  const heroWaveTop = isDark ? "#1e293b" : "#a5f3fc";

  return (
    <div className="home-marketing min-h-screen bg-background max-lg:pb-[calc(9.25rem+env(safe-area-inset-bottom))] lg:pb-0">
      <a
        href="#quote"
        className="absolute left-4 top-2 z-[100] -translate-y-12 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        Skip to quote form
      </a>
      <ScrollProgress />
      <BackToTop />
      <HomeMarketingNav />
      <HomeAssistantTeaser />
      <HomeStickyCta />
      <FaqAssistant />

      <section className="relative overflow-hidden pt-20 sm:pt-24 md:pt-28">
        <HomeHeroBackground />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-28 pb-36 sm:px-6 sm:py-32 sm:pb-40 md:py-36 md:pb-44 lg:py-40 lg:pb-48">
          <div ref={heroRef.ref} className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-16 animate-on-scroll ${heroRef.isInView ? "in-view" : ""}`}>
            <div className="min-w-0 max-w-3xl">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ring-1 ${
                isDark
                  ? "border-white/20 bg-primary-900/50 text-accent-200 ring-accent-500/25"
                  : "border-primary-200/90 bg-white/75 text-accent-800 ring-accent-300/40 backdrop-blur-sm"
              }`}
            >
              <ShieldCheck className={`h-4 w-4 ${isDark ? "text-accent-400" : "text-accent-600"}`} aria-hidden />
              <span className={isDark ? "text-primary-50/95" : "text-primary-900"}>FSC-licensed broker · Mauritius</span>
              <span className={`h-2 w-2 rounded-full ring-2 ${isDark ? "bg-accent-400 ring-accent-400/30" : "bg-accent-500 ring-accent-500/30"}`} aria-hidden />
            </div>

            <h1 className={`text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.06] ${isDark ? "text-white" : "text-primary-950"}`}>
              Protect What Matters Most
            </h1>
            <p className={`mt-2 text-xl font-bold sm:text-2xl ${isDark ? "text-accent-200" : "text-accent-700"}`}>Insurance made clear for Mauritius</p>
            <p className={`mt-5 max-w-2xl text-xl font-semibold leading-snug sm:text-2xl ${isDark ? "text-primary-50" : "text-primary-900"}`}>
              Fast, affordable insurance coverage for individuals and businesses.
            </p>
            <p className={`ui-body mt-5 max-w-2xl sm:text-lg ${isDark ? "text-primary-200/95" : "text-primary-800/90"}`}>
              Get an indicative quote in minutes, share documents through a secure channel, and work with licensed advisors who place cover
              with leading insurers, all in one place.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a
                href="#quote"
                aria-label="Jump to free quote form"
                className="btn-glow btn-marketing inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-transform duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 cursor-pointer sm:inline-flex"
              >
                <Calculator className="h-4 w-4 shrink-0" aria-hidden />
                Get a Free Quote
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold transition-[background-color,transform] duration-[240ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer sm:inline-flex ${
                  isDark
                    ? "border-white/30 bg-primary-900/35 text-white hover:bg-primary-800/50"
                    : "border-primary-300/80 bg-white/70 text-primary-900 hover:bg-white/90"
                }`}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                Talk to an Advisor
              </a>
              <Link
                to="/login"
                aria-label="Open secure sign in page"
                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-semibold transition-all duration-200 cursor-pointer sm:inline-flex ${
                  isDark
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : "border-primary-200/90 bg-primary-50/60 text-primary-900 hover:bg-primary-100/70"
                }`}
              >
                Sign in
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>

            <div className={`mt-10 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm ${isDark ? "text-primary-100/95" : "text-primary-800/90"}`}>
              <a
                href={`https://wa.me/${CONTACT_PHONE_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-semibold transition-colors ${
                  isDark
                    ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                    : "border-primary-200/90 bg-white/70 text-primary-900 hover:bg-white/90"
                }`}
              >
                <MessageCircle className={`h-4 w-4 shrink-0 ${isDark ? "text-accent-300" : "text-accent-600"}`} aria-hidden />
                WhatsApp us
              </a>
              <span className={`hidden sm:inline ${isDark ? "text-primary-300/80" : "text-primary-500/80"}`}>·</span>
              <span className={`text-sm ${isDark ? "text-primary-200/90" : "text-primary-700/90"}`}>Typical response under 1 business day</span>
            </div>

            <div className={`mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm ${isDark ? "text-primary-200" : "text-primary-800/90"}`}>
              {["No-obligation quotes", "256-bit TLS encryption", "Dedicated claims guidance"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 shrink-0 text-marketing-icon" aria-hidden />
                  {t}
                </span>
              ))}
            </div>
            </div>
            <div className="min-w-0 w-full lg:max-w-none lg:justify-self-end">
              <HomeHeroDashboardMockup />
            </div>
          </div>
        </div>

        <WaveDivider topColor={heroWaveTop} bottomColor={waveLightFill} height={80} />
      </section>

      <section className="home-insurer-band border-y border-primary-200/70 bg-gradient-to-r from-primary-50 via-primary-100/60 to-primary-50 py-6 overflow-hidden dark:border-border dark:from-surface dark:via-background dark:to-surface">
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

      <HomePlatformPreview />
      <HomeWhyChooseUs />

      <section className="border-y border-primary-800/30 bg-gradient-to-b from-primary-900 to-primary-950 py-16 lg:py-20">
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 sm:px-6 md:grid-cols-4 md:gap-5">
          {[
            { value: 15, suffix: "+", label: "Years serving Mauritius" },
            { value: 12, suffix: "+", label: "Insurer partners" },
            { value: 98, suffix: "%", label: "Clients who would recommend us*" },
            { value: 1, suffix: "", label: "Licensed team on your side" },
          ].map((s) => (
            <div key={s.label} className="home-stat-panel rounded-2xl p-5 text-center">
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-primary-300/70">*Based on client feedback surveys</p>
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

      <HomeClaimsJourney />

      <section id="products" className="home-section-soft py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <p className="ui-eyebrow text-primary-600 dark:text-primary-400">Insurance products</p>
            <h2 className="ui-title mt-4 text-balance text-3xl font-extrabold text-primary-950 dark:text-primary-50 sm:text-4xl lg:text-5xl">
              Comprehensive Coverage for Every Need
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We partner with Mauritius&apos;s leading insurers to bring you the best rates and coverage options.
            </p>
          </AnimatedSection>

          <AnimatedSection className="mt-10" animation="animate-fade-in">
            <div className="flex flex-wrap justify-center gap-2">
              {policyTypes.map((p) => (
                <Link
                  key={p.name}
                  to={`/products/${p.slug}`}
                  className="home-coverage-pill inline-flex items-center gap-2 rounded-full border border-primary-200 bg-surface px-4 py-2 text-sm font-semibold text-primary-800 shadow-sm transition-[transform,box-shadow] duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-md dark:border-primary-700/60 dark:bg-primary-800/50 dark:text-primary-200"
                >
                  <p.icon className="h-4 w-4 text-primary-600 dark:text-primary-300" aria-hidden />
                  {p.name}
                </Link>
              ))}
            </div>
          </AnimatedSection>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {policyTypes.map((p, i) => (
              <AnimatedSection key={p.name} className={`stagger-${i + 1}`} animation="animate-fade-in">
                <Link to={`/products/${p.slug}`} className="home-feature-card card-hover group flex items-start gap-4 rounded-2xl border border-primary-200/70 bg-surface p-6 cursor-pointer dark:border-border dark:bg-surface">
                  <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 p-3 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300 shrink-0 shadow-sm">
                    <p.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-surface-foreground">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:gap-2.5 transition-all duration-200">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="quote" className="border-y border-border bg-surface py-24 lg:py-32 dark:bg-background">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
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

      <section id="services" className="home-section-soft py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Our Platform</span>
            <h2 className="ui-title mt-4 text-balance text-3xl font-extrabold text-primary-950 dark:text-primary-50 sm:text-4xl lg:text-5xl">
              From first quote to renewal, online and human
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              The same tools power our advisory team and your client area: secure uploads, clear status, and reminders so nothing important is missed.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} className={`stagger-${i + 1}`} animation="animate-fade-in">
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

      <section id="testimonials" className="border-y border-border bg-surface py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Client Stories</span>
            <h2 className="ui-title mt-4 text-balance text-3xl font-extrabold text-primary-950 dark:text-primary-50 sm:text-4xl lg:text-5xl">
              Trusted by Clients Across Mauritius
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} className={`stagger-${i + 1}`} animation="animate-on-scroll">
                <div className="card-hover group rounded-2xl border border-border bg-surface p-8 relative overflow-hidden">
                  <div className="home-testimonial-hover absolute top-0 left-0 h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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

      <section id="faq" className="home-section-soft border-y border-border py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">FAQ</span>
            <h2 className="ui-title mt-3 text-balance text-3xl font-extrabold text-primary-950 dark:text-primary-50 sm:text-4xl">
              Common questions
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Straight answers about quotes, security, and how we work with insurers.
            </p>
          </div>
          <div className="mt-10 space-y-3">
            {homeFaqItems.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface p-1 shadow-sm transition-shadow hover:shadow-md open:shadow-md dark:bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-4 text-left text-base font-semibold text-surface-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-bold text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="border-t border-border/80 px-4 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={`relative overflow-hidden border-t ${isDark ? "border-primary-700/40" : "border-primary-200/80"}`}>
        <HomeDarkBandBackground />
        <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:py-28">
          <AnimatedSection className="text-center">
            <Building2 className={`mx-auto h-10 w-10 mb-4 ${isDark ? "text-accent-400" : "text-accent-600"}`} />
            <h2 className={`text-3xl font-extrabold sm:text-4xl ${isDark ? "text-white" : "text-primary-950"}`}>Ready to Protect What Matters?</h2>
            <p className={`mx-auto mt-4 max-w-xl ${isDark ? "text-primary-200" : "text-primary-800/90"}`}>
              Families and businesses across Mauritius trust {COMPANY_NAME_SHORT} for clear advice and a straightforward online experience. Get your free, no-obligation quote today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#quote"
                className="btn-glow btn-marketing inline-flex min-h-[48px] items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-white cursor-pointer transition-all duration-200"
              >
                <Calculator className="h-4 w-4" aria-hidden />
                Get Your Quote
              </a>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-bold cursor-pointer transition-all duration-200 ${
                  isDark
                    ? "glass border-white/20 text-white hover:bg-white/15"
                    : "border-primary-300/80 bg-white/75 text-primary-900 hover:bg-white/90 backdrop-blur-sm"
                }`}
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                Call an advisor
              </a>
              <Link
                to="/login"
                className={`inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-8 py-3.5 text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  isDark
                    ? "glass border-white/20 text-white hover:bg-white/15"
                    : "border-primary-200/90 bg-primary-50/70 text-primary-900 hover:bg-primary-100/80 backdrop-blur-sm"
                }`}
              >
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden />
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
                Your licensed insurance broker for Mauritius: quotes, renewals, claims guidance, and secure document sharing in one place. Regulated by the Financial Services Commission.
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
              <div className="mt-8 max-w-md">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Newsletter</h4>
                <p className="mt-2 text-xs text-primary-300/90">Regulatory updates and product tips. Opt out anytime.</p>
                <form
                  className="mt-3 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const email = String(fd.get("email") ?? "").trim();
                    if (!email) return;
                    void subscribeNewsletter(email, "home_footer").then((r) => {
                      if (r.ok) toast.success(r.message);
                      else toast.error(r.message);
                    });
                  }}
                >
                  <label htmlFor="footer-newsletter-email" className="sr-only">
                    Email for newsletter
                  </label>
                  <input
                    id="footer-newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="min-h-[44px] w-full flex-1 rounded-lg border border-primary-700/80 bg-primary-900/40 px-3 py-2 text-sm text-white placeholder:text-primary-400/80 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                  />
                  <button
                    type="submit"
                    className="min-h-[44px] shrink-0 rounded-lg bg-accent-600 px-4 text-sm font-bold text-white hover:bg-accent-500 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">Follow</span>
                  <div className="flex gap-2">
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-700/80 bg-primary-900/30 text-primary-100 hover:border-accent-500/60 hover:text-white"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" aria-hidden />
                    </a>
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary-700/80 bg-primary-900/30 text-primary-100 hover:border-accent-500/60 hover:text-white"
                      aria-label="Facebook"
                    >
                      <Facebook className="h-5 w-5" aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
              <div className="mt-4 space-y-3 text-sm">
                <a href="#platform" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Platform
                </a>
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
                <a href="#faq" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  FAQ
                </a>
                <Link to="/about" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  About
                </Link>
                <Link to="/products" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Products
                </Link>
                <Link to="/claims-guide" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Claims guide
                </Link>
                <Link to="/compare" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Compare cover
                </Link>
                <Link to="/checklists" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Checklists
                </Link>
                <Link to="/blog" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Insights
                </Link>
                <Link to="/privacy" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Privacy
                </Link>
                <Link to="/login" className="block hover:text-white cursor-pointer transition-colors duration-200">
                  Sign in
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-white">
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Port Louis, Mauritius</span>
                </div>
                <div className="mt-5 overflow-hidden rounded-xl border border-primary-800/80 shadow-lg shadow-black/20">
                  <iframe
                    title="Office location, Port Louis on OpenStreetMap"
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=57.482,-20.175,57.521,-20.142&layer=mapnik&marker=-20.1619,57.5014"
                  />
                  <div className="border-t border-primary-800/80 bg-primary-900/50 px-3 py-2 text-center text-[11px] text-primary-300/95">
                    <a
                      href="https://www.openstreetmap.org/?mlat=-20.1619&mlon=57.5014#map=16/-20.1619/57.5014"
                      className="font-medium text-accent-400 hover:text-accent-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open full map
                    </a>
                    <span className="text-primary-500"> · </span>
                    <span className="text-primary-400">© OpenStreetMap contributors</span>
                  </div>
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
              &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved. Licensed Insurance Broker, Mauritius FSC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
