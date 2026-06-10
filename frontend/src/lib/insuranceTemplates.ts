import { brandAssetUrl } from "./brandAssets";

export type InsuranceTemplateCategory =
  | "placing"
  | "fleet"
  | "cancellation"
  | "letterhead";

export interface InsuranceTemplate {
  id: string;
  title: string;
  description: string;
  fileName: string;
  category: InsuranceTemplateCategory;
  /** Product line shown in the portal (from your template set). */
  productLine: string;
}

/** Sindicom placing templates — files in `frontend/public/templates/`. */
export const insuranceTemplates: InsuranceTemplate[] = [
  {
    id: "placing-motor",
    title: "Placing — Motor",
    description: "Motor insurance placing slip / cover note template.",
    fileName: "placing-motor.doc",
    category: "placing",
    productLine: "Motor",
  },
  {
    id: "placing-non-motor",
    title: "Placing — Non-motor",
    description: "General non-motor placing template (home, commercial property, etc.).",
    fileName: "placing-non-motor.doc",
    category: "placing",
    productLine: "Non-motor",
  },
  {
    id: "placing-travel",
    title: "Placing — Travel",
    description: "Travel insurance placing template.",
    fileName: "placing-travel.doc",
    category: "placing",
    productLine: "Travel",
  },
  {
    id: "placing-marine",
    title: "Placing — Marine",
    description: "Marine / cargo placing template.",
    fileName: "placing-marine.doc",
    category: "placing",
    productLine: "Marine",
  },
  {
    id: "placing-medical",
    title: "Placing — Medical",
    description: "Medical / health placing template.",
    fileName: "placing-medical.doc",
    category: "placing",
    productLine: "Medical",
  },
  {
    id: "placing-motor-fleet",
    title: "Placing — Motor fleet",
    description: "Fleet motor placing workbook (Excel).",
    fileName: "placing-motor-fleet.xlsx",
    category: "fleet",
    productLine: "Motor fleet",
  },
  {
    id: "placing-cancellation",
    title: "Placing — Cancellation",
    description: "Standard policy cancellation placing template.",
    fileName: "placing-cancellation.doc",
    category: "cancellation",
    productLine: "All lines",
  },
  {
    id: "placing-motor-fleet-cancellation",
    title: "Motor fleet — Cancellation",
    description: "Fleet cancellation placing workbook (Excel).",
    fileName: "placing-motor-fleet-cancellation.xlsx",
    category: "cancellation",
    productLine: "Motor fleet",
  },
  {
    id: "letterhead",
    title: "Sindicom letterhead",
    description: "Official letterhead (Word) — includes Sindicom Brokers branding.",
    fileName: "letterhead.doc",
    category: "letterhead",
    productLine: "Correspondence",
  },
];

export function insuranceTemplateDownloadUrl(fileName: string): string {
  return brandAssetUrl(`templates/${fileName}`);
}

export const insuranceTemplateCategoryLabel: Record<InsuranceTemplateCategory, string> = {
  placing: "Placing slips",
  fleet: "Motor fleet",
  cancellation: "Cancellations",
  letterhead: "Letterhead",
};
