import { MarketingLayout } from "~/components/marketing/MarketingLayout";
import { COMPANY_NAME } from "~/lib/branding";
import type { Route } from "./+types/terms";

const sections = [
  { h: "Broker role", p: "We arrange insurance with third-party insurers. Cover is subject to insurer acceptance, policy wording, and payment of premium. We are not the insurer." },
  { h: "Quotes & estimates", p: "Online calculators provide indicative premiums only. Firm quotes require full risk details and insurer approval." },
  { h: "Portal access", p: "Keep credentials confidential. You are responsible for activity under your account. Demo accounts are for evaluation only." },
  { h: "Acceptable use", p: "Do not misuse the portal, upload malware, or attempt unauthorised access. We may suspend access for security reasons." },
  { h: "Intellectual property", p: "Site content, branding, and templates remain property of Sindicom or licensors. Insurer logos and wordings belong to respective insurers." },
  { h: "Liability", p: "To the extent permitted by law, we are not liable for indirect losses. Nothing limits liability that cannot be limited under Mauritius law." },
];

export function meta(_: Route.MetaArgs) {
  return [
    { title: `Terms of Use — ${COMPANY_NAME}` },
    { name: "description", content: `Terms for using the ${COMPANY_NAME} website and client portal.` },
  ];
}

export default function Terms() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Use</h1>
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
