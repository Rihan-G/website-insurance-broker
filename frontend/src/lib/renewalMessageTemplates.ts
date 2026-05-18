export interface RenewalTemplate {
  id: string;
  label: string;
  body: string;
}

export const RENEWAL_MESSAGE_TEMPLATES: RenewalTemplate[] = [
  {
    id: "standard",
    label: "Standard renewal",
    body: "Your policy is approaching renewal. Please review the schedule we attached and confirm cover so we can bind on time.",
  },
  {
    id: "urgent",
    label: "Urgent — within 14 days",
    body: "Important: your renewal date is within two weeks. Reply today so we avoid a lapse in cover.",
  },
  {
    id: "payment",
    label: "Payment link follow-up",
    body: "We sent a secure payment link for your renewal premium. Let us know once paid or if you need a split plan.",
  },
  {
    id: "docs",
    label: "Documents requested",
    body: "To complete your renewal we still need the documents listed in your portal. Upload when convenient or reply with questions.",
  },
];
