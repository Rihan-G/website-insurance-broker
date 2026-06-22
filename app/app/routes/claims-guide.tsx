import { useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, Camera, FileText, Phone, Shield } from "lucide-react";
import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { COMPANY_NAME, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "~/lib/branding";
import type { Route } from "./+types/claims-guide";

const steps = [
  { icon: Shield, title: "Stay safe & secure the scene", body: "Check for injuries. Call emergency services if needed. Do not admit liability at the scene. Note time, location, and weather." },
  { icon: Phone, title: "Notify us and the insurer", body: "Contact Sindicom as soon as practical. Many motor policies require prompt notice. We help you complete the insurer claim form." },
  { icon: Camera, title: "Gather evidence", body: "Photos of damage, registration plates, skid marks, and the wider scene. Collect witness names and third-party contacts." },
  { icon: FileText, title: "Police memo (when required)", body: "Theft, injury, or significant third-party damage often needs a police report. Keep the memo number for your file." },
  { icon: AlertTriangle, title: "Do not dispose or repair early", body: "Wait for insurer or assessor instructions before major repairs, unless emergency make-safe is needed." },
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Claims Guide — ${COMPANY_NAME}` },
    { name: "description", content: "Step-by-step guidance for reporting a motor or property claim in Mauritius." },
  ];
}

export default function ClaimsGuide() {
  const [active, setActive] = useState(0);
  const step = steps[active] ?? steps[0]!;
  const Icon = step.icon;

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">What to do when you need to claim</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          A practical checklist for first notice. Your policy wording sets exact deadlines and documents — we help you comply.
        </p>
        <div className="mt-10 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active === i ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
              }`}
            >
              Step {i + 1}
            </button>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <Icon className="h-12 w-12 text-blue-600 dark:text-blue-400" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{step.title}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{step.body}</p>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/checklists/claim-motor" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            Motor claim checklist
          </Link>
          <Link to="/login" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Report in portal
          </Link>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            Call {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </MarketingLayout>
  );
}
