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
} from "lucide-react";
import { useInView } from "../hooks/useInView";
import { useCounter } from "../hooks/useCounter";

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

const services = [
  { icon: Upload, title: "Document Upload Portal", desc: "Secure client upload with drag-and-drop. PDF, JPG, PNG up to 25MB with AES-256 encryption." },
  { icon: FileText, title: "OCR Intelligence", desc: "Automatic data extraction from insurance documents with confidence scoring and validation." },
  { icon: BarChart3, title: "Admin Dashboard", desc: "Real-time pipeline status, revenue tracking, and comprehensive analytics at a glance." },
  { icon: Users, title: "Client Management", desc: "Complete client profiles with policy tracking, document history, and communication logs." },
  { icon: Lock, title: "Security & Compliance", desc: "Role-based access, 2FA authentication, audit trails, and GDPR-compliant data handling." },
  { icon: Zap, title: "Automated Workflows", desc: "Payment notifications, policy expiry alerts, and automatic PDF receipt generation." },
];

const testimonials = [
  { name: "Marie Dupont", role: "Client, 3 years", text: "SecureBroker made managing my insurance policies effortless. The upload portal is incredibly easy to use.", rating: 5 },
  { name: "Jean-Pierre R.", role: "Business Client", text: "The dashboard gives me a clear overview of all my commercial policies. Outstanding service and technology.", rating: 5 },
  { name: "Priya Devi", role: "New Client", text: "Setting up was quick and the notifications keep me informed about my policy renewals. Highly recommended.", rating: 5 },
];

const steps = [
  { step: "01", title: "Upload Documents", desc: "Drag and drop your insurance documents into our secure portal. We accept all major formats." },
  { step: "02", title: "Automatic Processing", desc: "Our OCR engine extracts and validates data with confidence scoring, reducing manual entry by 90%." },
  { step: "03", title: "Manage & Export", desc: "Review, approve, and export processed data. Track policies, generate reports, and serve clients faster." },
];

export function HomePage() {
  const heroRef = useInView();

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-primary-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-accent-500" />
            <span className="text-lg font-bold text-primary-900 tracking-tight">SecureBroker</span>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium text-primary-700 md:flex">
            <a href="#services" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Services</a>
            <a href="#how-it-works" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">How It Works</a>
            <a href="#testimonials" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Testimonials</a>
            <a href="#contact" className="hover:text-primary-900 cursor-pointer transition-colors duration-200">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 cursor-pointer transition-colors duration-200 sm:block"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 cursor-pointer transition-colors duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-accent-500 blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-primary-400 blur-3xl animate-float-delayed" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
          <div
            ref={heroRef.ref}
            className={`max-w-3xl animate-on-scroll ${heroRef.isInView ? "in-view" : ""}`}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-100 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-4 w-4 text-accent-400" />
              Trusted by 700+ clients in Mauritius
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Insurance Management,{" "}
              <span className="text-accent-400">Simplified</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-200 leading-relaxed">
              The all-in-one platform for insurance brokers. Upload documents, extract data with OCR,
              manage policies, and serve your clients — all through one secure, compliance-ready portal.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white hover:bg-accent-600 cursor-pointer transition-colors duration-200 animate-pulse-glow"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                See How It Works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-primary-200">
              {["No credit card required", "256-bit SSL encryption", "GDPR compliant"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-accent-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-800 border-y border-primary-700">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          <StatCounter value={700} suffix="+" label="Active Clients" />
          <StatCounter value={2500} suffix="+" label="Policies Managed" />
          <StatCounter value={99} suffix=".9%" label="Uptime SLA" />
          <StatCounter value={15000} suffix="+" label="Documents Processed" />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">What We Offer</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              Everything You Need to Run Your Brokerage
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From document intake to policy management, our platform covers every step of the insurance broker workflow.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimatedSection
                key={service.title}
                className={`stagger-${i + 1}`}
                animation="animate-scale-in"
              >
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

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface py-20 lg:py-28 border-y border-border">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-accent-600 uppercase tracking-wider">Simple Process</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Get started in minutes. Our streamlined workflow takes you from document upload to fully processed data.
            </p>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <AnimatedSection
                key={s.step}
                className={`stagger-${i + 1}`}
                animation="animate-on-scroll"
              >
                <div className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white text-xl font-bold">
                    {s.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-surface-foreground">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-[calc(50%+48px)] hidden w-[calc(100%-96px)] border-t-2 border-dashed border-primary-200 md:block" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <AnimatedSection className="text-center">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Client Stories</span>
            <h2 className="mt-3 text-3xl font-bold text-primary-900 sm:text-4xl">
              Trusted by Clients Across Mauritius
            </h2>
          </AnimatedSection>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimatedSection
                key={t.name}
                className={`stagger-${i + 1}`}
                animation="animate-on-scroll"
              >
                <div className="rounded-2xl border border-border bg-surface p-8 hover:shadow-md transition-shadow duration-300">
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 h-64 w-64 rounded-full bg-accent-500 blur-3xl animate-float" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <AnimatedSection className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Modernize Your Brokerage?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-200">
              Join 700+ clients who trust SecureBroker for their insurance management needs.
              Start your free trial today — no credit card required.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-accent-600 cursor-pointer transition-colors duration-200"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-colors duration-200"
              >
                Contact Sales
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Contact / Footer */}
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
                and serving clients across Mauritius since 2024.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400 border border-accent-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
                  All Systems Operational
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
              <div className="mt-4 space-y-3 text-sm">
                <a href="#services" className="block hover:text-white cursor-pointer transition-colors duration-200">Services</a>
                <a href="#how-it-works" className="block hover:text-white cursor-pointer transition-colors duration-200">How It Works</a>
                <a href="#testimonials" className="block hover:text-white cursor-pointer transition-colors duration-200">Testimonials</a>
                <Link to="/login" className="block hover:text-white cursor-pointer transition-colors duration-200">Client Portal</Link>
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
                  <span>info@securebroker.mu</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Port Louis, Mauritius</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>securebroker.mu</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-primary-800 pt-8 text-center text-xs text-primary-400">
            <p>&copy; 2025 SecureBroker Insurance Ltd. All rights reserved. Licensed Insurance Broker — Mauritius.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
