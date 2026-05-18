import { describe, expect, it } from "vitest";
import { parseISO } from "date-fns";
import { interpolateRenewalMessage } from "./renewalMessageTemplates";

describe("interpolateRenewalMessage", () => {
  const row = {
    policyNumber: "MOT-1",
    product: "Motor",
    insurer: "MUA Ltd",
    renewalDate: parseISO("2026-06-15"),
  };

  it("replaces known tokens", () => {
    const ref = parseISO("2026-06-01");
    const out = interpolateRenewalMessage(
      "Policy {{policy_number}} renews {{renewal_date_iso}} ({{renewal_date}}), {{days_until_renewal}} days.",
      row,
      ref,
    );
    expect(out).toBe("Policy MOT-1 renews 2026-06-15 (Jun 15, 2026), 14 days.");
  });

  it("leaves unknown tokens unchanged", () => {
    expect(interpolateRenewalMessage("{{not_a_real_token}}", row)).toBe("{{not_a_real_token}}");
  });

  it("substitutes company_name_short", () => {
    expect(interpolateRenewalMessage("From {{company_name_short}}", row)).toBe("From Sindicom");
  });
});
