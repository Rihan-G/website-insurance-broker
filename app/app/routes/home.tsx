import { Link } from "react-router";
import {
  ShieldCheck, Phone, Mail, MapPin, ArrowRight, CheckCircle, Star,
  Calculator, Building2, Award, MessageCircle, Globe, Linkedin, Facebook,
} from "lucide-react";
import { MarketingNav } from "~/components/marketing/MarketingNav";
import { AnimatedSection, StatCounter } from "~/components/home/HomeAnimatedPrimitives";
import { HomeWhyChooseUs } from "~/components/home/HomeWhyChooseUs";
import { HomeClaimsJourney } from "~/components/home/HomeClaimsJourney";
import { HomeQuoteCalculator } from "~/components/home/HomeQuoteCalculator";
import { homeFaqItems } from "~/lib/homeFaqData";
import {
  insurers, services, policyTypes, testimonials, steps, certifications,
} from "~/lib/homeMarketingData";
import {
  COMPANY_NAME, COMPANY_NAME_SHORT, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL, CONTACT_PHONE_WHATSAPP, WEBSITE_DOMAIN,
  LINKEDIN_URL, FACEBOOK_URL,
} from "~/lib/branding";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sindicom Brokers — Insurance Brokers in Mauritius" },
    { name: "description", content: "Compare insurance quotes, manage your policies, and file claims with Sindicom Brokers Ltd — Mauritius's trusted insurance broker." },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 pt-20 text-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-green-400" aria-hidden />
                <span>FSC-licensed broker · Mauritius</span>
                <span className="h-2 w-2 rounded-full bg-green-400 ring-2 ring-green-400/30" aria-hidden />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Protect What<br />
                <span className="text-green-300">Matters Most</span>
              </h1>
              <p className="mt-4 text-xl font-semibold text-blue-100">Insurance made clear for Mauritius</p>
              <p className="mt-4 max-w-xl text-lg text-blue-200/90 leading-relaxed">
                Fast, affordable coverage for individuals and businesses. Get an indicative quote in minutes, share documents through a secure channel, and work with licensed advisors who place cover with leading insurers.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a href="#quote" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-white hover:bg-green-400 transition-colors shadow-lg">
                  <Calculator className="h-4 w-4" aria-hidden /> Get a Free Quote
                </a>
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <Phone className="h-4 w-4" aria-hidden /> Talk to an Advisor
                </a>
                <Link to="/login" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                  Sign in <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-sm text-blue-200">
                {["No-obligation quotes", "256-bit TLS encryption", "Dedicated claims guidance"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-green-400" aria-hidden /> {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
              <HomeQuoteCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Insurer marquee */}
      <section className="border-y border-blue-200/70 bg-blue-50 py-8 overflow-hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex shrink-0 items-center gap-2.5 rounded-xl border border-green-200 bg-white px-4 py-2.5 shadow-sm dark:border-green-800/30 dark:bg-gray-800">
              <ShieldCheck className="h-5 w-5 text-green-600" aria-hidden />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400">FSC Licensed Broker</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Financial Services Commission · Mauritius</p>
              </div>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400 sm:text-left">Cover placed with</p>
              <div className="overflow-hidden">
                <div className="flex animate-marquee gap-0">
                  {[...insurers, ...insurers].map((name, i) => (
                    <div key={`${name}-${i}`} className="flex items-center gap-6 px-6 shrink-0">
                      <span className="text-sm font-semibold text-blue-700/80 whitespace-nowrap dark:text-blue-300/80">{name}</span>
                      <span className="h-1 w-1 rounded-full bg-blue-300 dark:bg-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeWhyChooseUs />

      {/* Stats */}
      <section className="border-y border-blue-800/30 bg-gradient-to-b from-blue-900 to-blue-950 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 sm:px-6 md:grid-cols-4">
          {[
            { value: 15, suffix: "+", label: "Years serving Mauritius" },
            { value: 12, suffix: "+", label: "Insurer partners" },
            { value: 98, suffix: "%", label: "Clients who recommend us" },
            { value: 1,  suffix: "",  label: "Licensed team on your side" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-sm">
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {certifications.map((cert) => (
              <div key={cert.label} className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <cert.icon className="h-5 w-5 text-green-600" />
                {cert.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeClaimsJourney />

      {/* Products */}
      <section id="products" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Insurance products</p>
            <h2 className="mt-4 text-balance text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              Comprehensive Coverage for Every Need
            </h2>
          </AnimatedSection>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {policyTypes.map((p, i) => (
              <AnimatedSection key={p.name} className={`stagger-${i + 1}`} animation="animate-fade-in">
                <Link to={`/products/${p.slug}`} className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all dark:border-gray-700 dark:bg-gray-900">
                  <div className="rounded-xl bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors dark:bg-blue-950/40">
                    <p.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white">{p.name}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                      Learn more <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Quote */}
      <section id="quote" className="border-y border-gray-200 bg-white py-24 lg:py-32 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <AnimatedSection>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Get Your Quote in Seconds</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-lg">
                  Use our quick calculator for an instant estimate, then request a detailed quote from a licensed advisor. No obligation, no hidden fees.
                </p>
              </AnimatedSection>
              <AnimatedSection className="mt-12" animation="animate-slide-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">How It Works</h3>
                <div className="space-y-6">
                  {steps.map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-bold shrink-0">{s.step}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{s.title}</h4>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
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

      {/* Services */}
      <section id="services" className="py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
              From first quote to renewal, online and human
            </h2>
          </AnimatedSection>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} className={`stagger-${i + 1}`} animation="animate-fade-in">
                <div className="group rounded-2xl border border-gray-200 bg-white p-7 hover:border-blue-300 hover:shadow-md transition-all dark:border-gray-700 dark:bg-gray-900">
                  <div className="inline-flex rounded-xl bg-blue-50 p-3 group-hover:bg-blue-100 transition-colors dark:bg-blue-950/40">
                    <service.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-y border-gray-200 bg-white py-24 lg:py-32 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Trusted by Clients Across Mauritius</h2>
          </AnimatedSection>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection key={t.name} className={`stagger-${i + 1}`} animation="animate-on-scroll">
                <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-900">
                  {"detail" in t && (
                    <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-800/40 dark:bg-green-950/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" /> {(t as { detail: string }).detail}
                    </span>
                  )}
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm font-bold">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-y border-gray-200 bg-gray-50 py-24 lg:py-32 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">Common questions</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-600 dark:text-gray-400">
              Straight answers about quotes, security, and how we work with insurers.
            </p>
          </div>
          <div className="mt-10 space-y-3">
            {homeFaqItems.map((item) => (
              <details key={item.q} className="group rounded-2xl border border-gray-200 bg-white p-1 shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-4 text-left text-base font-semibold text-gray-900 outline-none focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-white [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="shrink-0 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500 transition-transform group-open:rotate-45 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">+</span>
                </summary>
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-600 dark:border-gray-700 dark:text-gray-400">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-950 to-blue-900 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <AnimatedSection className="text-center">
            <Building2 className="mx-auto h-10 w-10 mb-4 text-green-400" />
            <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to Protect What Matters?</h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-200">
              Families and businesses across Mauritius trust {COMPANY_NAME_SHORT} for clear advice and a straightforward online experience.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#quote" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-white hover:bg-green-400 shadow-lg transition-colors">
                <Calculator className="h-4 w-4" /> Get Your Quote
              </a>
              <a href={`tel:${CONTACT_PHONE_TEL}`} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3 text-sm font-bold text-white hover:bg-white/20 backdrop-blur-sm transition-colors">
                <Phone className="h-4 w-4" /> Call an advisor
              </a>
              <Link to="/login" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-blue-950 text-blue-200">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-7 w-7 text-green-500" />
                <span className="text-lg font-bold text-white">{COMPANY_NAME_SHORT}</span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed">
                Your licensed insurance broker for Mauritius: quotes, renewals, claims guidance, and secure document sharing in one place. Regulated by the Financial Services Commission.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-700/80 text-blue-100 hover:border-green-500/60 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-700/80 text-blue-100 hover:border-green-500/60 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href={`https://wa.me/${CONTACT_PHONE_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-700/80 text-blue-100 hover:border-green-500/60 hover:text-white transition-colors" aria-label="WhatsApp">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
              <div className="mt-4 space-y-2 text-sm">
                {[
                  ["#products", "Insurance Products"], ["/products", "All Products"],
                  ["/claims-guide", "Claims Guide"], ["/compare", "Compare Cover"],
                  ["/checklists", "Checklists"], ["/blog", "Insights"],
                  ["/about", "About"], ["/login", "Sign In"],
                ].map(([href, label]) =>
                  href?.startsWith("/") ? (
                    <Link key={label} to={href} className="block hover:text-white transition-colors">{label}</Link>
                  ) : (
                    <a key={label} href={href} className="block hover:text-white transition-colors">{label}</a>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
              <div className="mt-4 space-y-3 text-sm">
                <a href={`tel:${CONTACT_PHONE_TEL}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4 w-4 shrink-0" /> {CONTACT_PHONE_DISPLAY}
                </a>
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 shrink-0" /> {CONTACT_EMAIL}
                </a>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Port Louis, Mauritius
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0" /> {WEBSITE_DOMAIN}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-blue-800 pt-8 text-center text-xs text-blue-400">
            <p>
              &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.{" "}
              <Link to="/privacy" className="hover:text-blue-200">Privacy</Link>
              {" · "}
              <Link to="/terms" className="hover:text-blue-200">Terms</Link>
              {" · "}Licensed Insurance Broker, Mauritius FSC.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
