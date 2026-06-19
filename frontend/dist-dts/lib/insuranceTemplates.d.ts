export type InsuranceTemplateCategory = "placing" | "fleet" | "cancellation" | "letterhead";
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
export declare const insuranceTemplates: InsuranceTemplate[];
export declare function insuranceTemplateDownloadUrl(fileName: string): string;
export declare const insuranceTemplateCategoryLabel: Record<InsuranceTemplateCategory, string>;
