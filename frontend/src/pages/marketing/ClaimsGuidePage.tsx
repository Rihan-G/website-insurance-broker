import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Camera, FileText, Phone, Shield } from "lucide-react";
import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { COMPANY_NAME, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "../../lib/branding";

const steps = [
  {
    icon: Shield,
    title: "Stay safe & secure the scene",
    body: "Check for injuries. Call emergency services if needed. Do not admit liability at the scene. Note time, location, and weather.",
  },
  {
    icon: Phone,
    title: "Notify us and the insurer",
    body: "Contact Sindicom as soon as practical. Many motor policies require prompt notice. We help you complete the insurer claim form.",
  },
  {
    icon: Camera,
    title: "Gather evidence",
    body: "Photos of damage, registration plates, skid marks, and the wider scene. Collect witness names and third-party contacts.",
  },
  {
    icon: FileText,
    title: "Police memo (when required)",
    body: "Theft, injury, or significant third-party damage often needs a police report. Keep the memo number for your file.",
  },
  {
    icon: AlertTriangle,
    title: "Do not dispose or repair early",
    body: "Wait for insurer or assessor instructions before major repairs, unless emergency make-safe is needed.",
  },
];

export function ClaimsGuidePage() {
  const [active, setActive] = useState(0);

  return (
    <MarketingPageLayout
      meta={{
        title: `Claims Guide — ${COMPANY_NAME}`,
        description: "Step-by-step guidance for reporting a motor or property claim in Mauritius.",
      }}
    >
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-surface-foreground">What to do when you need to claim</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A practical checklist for first notice. Your policy wording sets exact deadlines and documents — we help you comply.
        </p>
        <div className="mt-10 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                active === i ? "bg-primary-600 text-white" : "border border-border bg-surface text-muted-foreground"
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-border bg-surface p-8">
          {(() => {
            const s = steps[active] ?? steps[0]!;
            const Icon = s.icon;
            return (
              <>
                <Icon className="h-12 w-12 text-primary-600 dark:text-primary-400" aria-hidden />
                <h2 className="mt-4 text-2xl font-bold text-surface-foreground">{s.title}</h2>
                <p className="mt-3 text-muted-foreground">{s.body}</p>
              </>
            );
          })()}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/checklists/claim-motor" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
            Motor claim checklist
          </Link>
          <Link to="/login" className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
            Report in portal
          </Link>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
            Call {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </MarketingPageLayout>
  );
}
