import { COMPANY_NAME_SHORT } from "../../lib/branding";

export const homeFaqItems: Array<{ q: string; a: string }> = [
  {
    q: "How quickly can I get a quote?",
    a: "Use the on-page calculator for an indicative premium in seconds. A broker will follow up with a firm quote once we have your full risk details, often the same business day.",
  },
  {
    q: "Is my information secure?",
    a: "The client portal uses encrypted connections and role-based access. Never share passwords; we will never ask for your full banking PIN by email or WhatsApp.",
  },
  {
    q: "Do you cover businesses as well as individuals?",
    a: "Yes. We place motor, home, life, health, travel, and commercial lines with leading insurers in Mauritius and can structure cover for SMEs and larger risks.",
  },
  {
    q: "What happens after I upload documents?",
    a: "Documents enter our review queue. You will see status updates in the portal and may receive reminders if something is missing or needs clarification.",
  },
  {
    q: "Are you licensed?",
    a: `${COMPANY_NAME_SHORT} operates as a licensed insurance broker in Mauritius (FSC). Coverage is ultimately provided by the insurer named on your policy.`,
  },
];
