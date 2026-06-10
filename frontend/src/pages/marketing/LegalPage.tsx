import { MarketingPageLayout } from "../../components/marketing/MarketingPageLayout";
import { COMPANY_NAME, CONTACT_EMAIL } from "../../lib/branding";

type LegalKind = "privacy" | "terms";

const content: Record<LegalKind, { title: string; description: string; sections: Array<{ h: string; p: string }> }> = {
  privacy: {
    title: "Privacy Policy",
    description: `How ${COMPANY_NAME} handles personal data on this website and client portal.`,
    sections: [
      {
        h: "Who we are",
        p: `${COMPANY_NAME} is an insurance broker licensed in Mauritius. We act as intermediary between you and insurers. Contact: ${CONTACT_EMAIL}.`,
      },
      {
        h: "Data we collect",
        p: "We collect information you provide for quotes, KYC, policy placement, and claims — including name, contact details, identity documents, and risk information. Portal usage may generate technical logs (browser type, IP, session metadata).",
      },
      {
        h: "How we use data",
        p: "To provide brokerage services, comply with FSC and insurer requirements, process claims, send renewal reminders (where you opt in), and improve our portal. We do not sell your personal data.",
      },
      {
        h: "Storage & security",
        p: "Data is stored on encrypted connections and access-controlled systems. Local browser storage may hold theme, currency, checklist progress, and demo preferences on your device.",
      },
      {
        h: "Your rights",
        p: "You may request access, correction, or deletion of personal data subject to legal and regulatory retention requirements. Email us at the address above.",
      },
      {
        h: "Cookies",
        p: "We use essential local storage for portal functionality. Analytics may be added later with consent. You can clear site data in your browser settings.",
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    description: `Terms for using the ${COMPANY_NAME} website and client portal.`,
    sections: [
      {
        h: "Broker role",
        p: "We arrange insurance with third-party insurers. Cover is subject to insurer acceptance, policy wording, and payment of premium. We are not the insurer.",
      },
      {
        h: "Quotes & estimates",
        p: "Online calculators provide indicative premiums only. Firm quotes require full risk details and insurer approval.",
      },
      {
        h: "Portal access",
        p: "Keep credentials confidential. You are responsible for activity under your account. Demo accounts are for evaluation only.",
      },
      {
        h: "Acceptable use",
        p: "Do not misuse the portal, upload malware, or attempt unauthorised access. We may suspend access for security reasons.",
      },
      {
        h: "Intellectual property",
        p: "Site content, branding, and templates remain property of Sindicom or licensors. Insurer logos and wordings belong to respective insurers.",
      },
      {
        h: "Liability",
        p: "To the extent permitted by law, we are not liable for indirect losses. Nothing limits liability that cannot be limited under Mauritius law.",
      },
    ],
  },
};

export function LegalPage({ kind }: { kind: LegalKind }) {
  const doc = content[kind];
  return (
    <MarketingPageLayout meta={{ title: `${doc.title} — ${COMPANY_NAME}`, description: doc.description }}>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-surface-foreground">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
        <div className="prose prose-slate dark:prose-invert mt-10 max-w-none space-y-8">
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-semibold text-surface-foreground">{s.h}</h2>
              <p className="mt-2 text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </MarketingPageLayout>
  );
}
