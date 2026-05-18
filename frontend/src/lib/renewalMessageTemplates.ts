import { differenceInCalendarDays, format } from "date-fns";
import { COMPANY_NAME_SHORT } from "./branding";

/** Insurer “format packs” — today they share the same token set; swap copy per pack when you wire insurer-specific layouts. */
export type RenewalInsurerPackId = "generic" | "mua_ltd" | "swan_insurance" | "allied_union";

export const DEFAULT_RENEWAL_INSURER_PACK_ID: RenewalInsurerPackId = "generic";

export interface RenewalTemplateEntry {
  slug: string;
  label: string;
  /** Interchangeable tokens: {{policy_number}}, {{product}}, {{insurer}}, {{renewal_date}}, {{renewal_date_iso}}, {{days_until_renewal}} */
  body: string;
}

export interface RenewalInsurerPack {
  id: RenewalInsurerPackId;
  name: string;
  /** Shown in UI — explain that future PDF/email formats can key off this id. */
  note: string;
  templates: RenewalTemplateEntry[];
}

export const RENEWAL_TEMPLATE_PLACEHOLDERS: { token: string; description: string }[] = [
  { token: "{{policy_number}}", description: "Policy reference from the row" },
  { token: "{{product}}", description: "Product / cover type" },
  { token: "{{insurer}}", description: "Insurer name on the policy" },
  { token: "{{renewal_date}}", description: "Renewal date (e.g. Jun 1, 2026)" },
  { token: "{{renewal_date_iso}}", description: "Renewal date as YYYY-MM-DD" },
  { token: "{{days_until_renewal}}", description: "Signed calendar days until renewal (negative if overdue)" },
  { token: "{{company_name_short}}", description: "Broker short name (from branding)" },
];

export type RenewalMessageRow = {
  policyNumber: string;
  product: string;
  insurer: string;
  renewalDate: Date;
};

const TOKEN_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/**
 * Fills known renewal tokens from a policy row. Unknown tokens are left unchanged so drafts stay readable.
 */
export function interpolateRenewalMessage(body: string, row: RenewalMessageRow, refDate: Date = new Date()): string {
  const renewal_date = format(row.renewalDate, "MMM d, yyyy");
  const renewal_date_iso = format(row.renewalDate, "yyyy-MM-dd");
  const days_until_renewal = String(differenceInCalendarDays(row.renewalDate, refDate));
  const map: Record<string, string> = {
    policy_number: row.policyNumber,
    product: row.product,
    insurer: row.insurer,
    renewal_date,
    renewal_date_iso,
    days_until_renewal,
    company_name_short: COMPANY_NAME_SHORT,
  };
  return body.replace(TOKEN_RE, (full, rawKey: string) => {
    const key = rawKey.toLowerCase();
    const v = map[key];
    return v !== undefined ? v : full;
  });
}

/** Suggested insurer label when adding a demo row from a pack (generic = leave manual entry). */
export const RENEWAL_PACK_SUGGESTED_INSURER: Partial<Record<RenewalInsurerPackId, string>> = {
  mua_ltd: "MUA Ltd",
  swan_insurance: "Swan Insurance",
  allied_union: "Allied Union",
};

export const RENEWAL_INSURER_PACKS: RenewalInsurerPack[] = [
  {
    id: "generic",
    name: "Broker default (neutral)",
    note: "Carrier-agnostic wording. Use when the policy insurer does not yet have a dedicated pack.",
    templates: [
      {
        slug: "standard",
        label: "Standard renewal",
        body: "Your policy {{policy_number}} ({{product}}) with {{insurer}} is approaching renewal on {{renewal_date}} ({{days_until_renewal}} calendar days from today). Please review the schedule we sent and confirm cover so we can bind on time.",
      },
      {
        slug: "urgent",
        label: "Urgent — within two weeks",
        body: "Important: policy {{policy_number}} renews on {{renewal_date}}. Reply today so we avoid a lapse in cover for {{product}}.",
      },
      {
        slug: "payment",
        label: "Payment link follow-up",
        body: "We sent a secure payment link for renewal premium on {{policy_number}} ({{insurer}}, {{product}}). Let us know once paid or if you need a split plan. Renewal date: {{renewal_date}}.",
      },
      {
        slug: "docs",
        label: "Documents requested",
        body: "To complete renewal for {{policy_number}} ({{product}}) we still need the documents listed in your portal. Upload when convenient or reply with questions. Insurer on file: {{insurer}}. Target date: {{renewal_date}}.",
      },
    ],
  },
  {
    id: "mua_ltd",
    name: "MUA Ltd",
    note: "MUA-flavoured copy for now; replace with insurer PDF wording when you have the official format.",
    templates: [
      {
        slug: "standard",
        label: "Standard renewal",
        body: "MUA renewal — policy {{policy_number}} for {{product}}. Your renewal date is {{renewal_date}} ({{days_until_renewal}} days). Please confirm with {{company_name_short}} so we can keep cover continuous. Insurer: {{insurer}}.",
      },
      {
        slug: "urgent",
        label: "Urgent — within two weeks",
        body: "MUA urgent: {{policy_number}} / {{product}} expires {{renewal_date}}. Contact us immediately to avoid a gap. {{days_until_renewal}} calendar days remaining.",
      },
      {
        slug: "payment",
        label: "Payment link follow-up",
        body: "MUA premium follow-up for {{policy_number}} ({{renewal_date_iso}}). Confirm payment for {{product}} or ask us about instalments. Insurer shown: {{insurer}}.",
      },
      {
        slug: "docs",
        label: "Documents requested",
        body: "MUA renewal paperwork: we still need documents for {{policy_number}} ({{product}}, {{insurer}}) before {{renewal_date}}. Upload via the portal or reply to this thread.",
      },
    ],
  },
  {
    id: "swan_insurance",
    name: "Swan Insurance",
    note: "Swan-specific tone placeholder — align with Swan schedules when formats are provided.",
    templates: [
      {
        slug: "standard",
        label: "Standard renewal",
        body: "Swan renewal notice — reference {{policy_number}}, {{product}}. Renewal falls on {{renewal_date}} ({{days_until_renewal}} days). Underwriter: {{insurer}}.",
      },
      {
        slug: "urgent",
        label: "Urgent — within two weeks",
        body: "Swan urgent renewal: {{policy_number}} for {{product}} is due {{renewal_date}}. {{days_until_renewal}} days left — please respond today.",
      },
      {
        slug: "payment",
        label: "Payment link follow-up",
        body: "Swan payment reminder — {{policy_number}}, renewal {{renewal_date_iso}}. Premium for {{product}} with {{insurer}}.",
      },
      {
        slug: "docs",
        label: "Documents requested",
        body: "Swan underwriting still needs documents for {{policy_number}} ({{product}}) ahead of {{renewal_date}}. Insurer: {{insurer}}.",
      },
    ],
  },
  {
    id: "allied_union",
    name: "Allied Union (example)",
    note: "Fourth slot for another local market; swap id + copy when you lock the real carrier list.",
    templates: [
      {
        slug: "standard",
        label: "Standard renewal",
        body: "Allied Union policy {{policy_number}} — {{product}} renews {{renewal_date}} ({{days_until_renewal}} days). Carrier on file: {{insurer}}.",
      },
      {
        slug: "urgent",
        label: "Urgent — within two weeks",
        body: "Allied Union urgent: {{policy_number}} / {{product}} must renew by {{renewal_date}}. {{days_until_renewal}} calendar days.",
      },
      {
        slug: "payment",
        label: "Payment link follow-up",
        body: "Allied Union payment follow-up for {{policy_number}} ({{renewal_date_iso}}), {{insurer}}, {{product}}.",
      },
      {
        slug: "docs",
        label: "Documents requested",
        body: "Allied Union renewal — missing documents for {{policy_number}} ({{product}}) before {{renewal_date}}. Insurer: {{insurer}}.",
      },
    ],
  },
];
