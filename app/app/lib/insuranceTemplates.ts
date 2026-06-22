export type InsuranceTemplateCategory = "placing" | "fleet" | "cancellation" | "letterhead";

export interface InsuranceTemplate {
  id: string;
  title: string;
  description: string;
  fileName: string;
  category: InsuranceTemplateCategory;
  productLine: string;
}

export const insuranceTemplates: InsuranceTemplate[] = [
  { id: "placing-motor", title: "Placing — Motor", description: "Motor insurance placing slip / cover note template.", fileName: "placing-motor.doc", category: "placing", productLine: "Motor" },
  { id: "placing-non-motor", title: "Placing — Non Motor", description: "Non-motor placing slip template.", fileName: "placing-non-motor.doc", category: "placing", productLine: "General" },
  { id: "placing-medical", title: "Placing — Medical", description: "Medical / health placing slip template.", fileName: "placing-medical.doc", category: "placing", productLine: "Health" },
  { id: "placing-travel", title: "Placing — Travel", description: "Travel insurance placing slip template.", fileName: "placing-travel.doc", category: "placing", productLine: "Travel" },
];

export function insuranceTemplateDownloadUrl(fileName: string): string {
  return `/templates/${fileName}`;
}
