import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { COMPANY_NAME, CONTACT_EMAIL } from "~/lib/branding";
import type { Route } from "./+types/privacy";

const sections = [
  { h: "Who we are", p: `${COMPANY_NAME} is an insurance broker licensed in Mauritius. We act as intermediary between you and insurers. Contact: ${CONTACT_EMAIL}.` },
  { h: "Data we collect", p: "We collect information you provide for quotes, KYC, policy placement, and claims — including name, contact details, identity documents, and risk information. Portal usage may generate technical logs (browser type, IP, session metadata)." },
  { h: "How we use data", p: "To provide brokerage services, comply with FSC and insurer requirements, process claims, send renewal reminders (where you opt in), and improve our portal. We do not sell your personal data." },
  { h: "Storage & security", p: "Data is stored on encrypted connections and access-controlled systems. Local browser storage may hold theme, currency, checklist progress, and demo preferences on your device." },
  { h: "Your rights", p: "You may request access, correction, or deletion of personal data subject to legal and regulatory retention requirements. Email us at the address above." },
  { h: "Cookies", p: "We use essential local storage for portal functionality. Analytics may be added later with consent. You can clear site data in your browser settings." },
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Privacy Policy — ${COMPANY_NAME}` },
    { name: "description", content: `How ${COMPANY_NAME} handles personal data on this website and client portal.` },
  ];
}

export default function Privacy() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
        <div className="mt-10 max-w-none space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{s.h}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
