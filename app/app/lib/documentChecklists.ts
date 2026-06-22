import { insuranceTemplateDownloadUrl } from "./insuranceTemplates";

export interface ChecklistItem {
  id: string;
  label: string;
  templateUrl?: string;
}

export interface DocumentChecklist {
  id: string;
  title: string;
  description: string;
  productLine: string;
  items: ChecklistItem[];
}

export const documentChecklists: DocumentChecklist[] = [
  {
    id: "motor-new",
    title: "Motor — new business",
    description: "Documents to gather before we place a new motor policy.",
    productLine: "Motor",
    items: [
      { id: "m1", label: "National ID or passport (policyholder)" },
      { id: "m2", label: "Valid driving licence (all named drivers)" },
      { id: "m3", label: "Vehicle registration form (horsepower / fitness)" },
      { id: "m4", label: "Previous policy schedule or NCD letter" },
      { id: "m5", label: "Import papers (if newly imported vehicle)" },
      {
        id: "m6",
        label: "Completed placing slip",
        templateUrl: insuranceTemplateDownloadUrl("placing-motor.doc"),
      },
    ],
  },
  {
    id: "motor-renewal",
    title: "Motor — renewal",
    description: "Quick pack for renewing an existing motor policy.",
    productLine: "Motor",
    items: [
      { id: "r1", label: "Last year policy schedule" },
      { id: "r2", label: "Updated registration if vehicle details changed" },
      { id: "r3", label: "Claims history declaration (if any claims last year)" },
      { id: "r4", label: "Proof of payment or debit order mandate if switching insurer" },
    ],
  },
  {
    id: "travel",
    title: "Travel insurance",
    description: "Information needed for travel cover before departure.",
    productLine: "Travel",
    items: [
      { id: "t1", label: "Traveller names and dates of birth" },
      { id: "t2", label: "Destination countries and travel dates" },
      { id: "t3", label: "Pre-existing medical conditions declaration" },
      {
        id: "t4",
        label: "Placing template (if broker-led)",
        templateUrl: insuranceTemplateDownloadUrl("placing-travel.doc"),
      },
    ],
  },
  {
    id: "claim-motor",
    title: "Motor claim — first notice",
    description: "What to prepare when reporting an accident or theft.",
    productLine: "Motor claims",
    items: [
      { id: "c1", label: "Policy number and insured vehicle details" },
      { id: "c2", label: "Police memo / incident number (theft or injury)" },
      { id: "c3", label: "Photos of damage and accident scene" },
      { id: "c4", label: "Third-party details and witness contacts" },
      { id: "c5", label: "Repair estimate or insurer assessor appointment" },
    ],
  },
];

const CHECKLIST_STORAGE = "sb_checklist_progress_v1";

export function loadChecklistProgress(checklistId: string): Set<string> {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    return new Set(all[checklistId] ?? []);
  } catch {
    return new Set();
  }
}

export function saveChecklistProgress(checklistId: string, done: Set<string>): void {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE);
    const all = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    all[checklistId] = [...done];
    localStorage.setItem(CHECKLIST_STORAGE, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
