/** Shared demo client rows for broker flows (Clients page, upload target picker). */
export interface DemoClientRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  policies: number;
  documents: number;
  status: "active" | "inactive" | "pending";
  joinedAt: string;
}

export const DEMO_CLIENT_ROWS: DemoClientRow[] = [
  { id: "1", name: "Marie Dupont", email: "marie@email.com", phone: "+230 5729 1234", policies: 3, documents: 12, status: "active", joinedAt: "2024-03-15" },
  { id: "2", name: "Jean-Pierre Ramgoolam", email: "jp@email.com", phone: "+230 5834 5678", policies: 2, documents: 8, status: "active", joinedAt: "2024-05-22" },
  { id: "3", name: "Priya Devi", email: "priya@email.com", phone: "+230 5912 3456", policies: 1, documents: 4, status: "pending", joinedAt: "2025-01-10" },
  { id: "4", name: "Ahmed Boolell", email: "ahmed@email.com", phone: "+230 5748 9012", policies: 4, documents: 15, status: "active", joinedAt: "2023-11-08" },
  { id: "5", name: "Sophie Chen", email: "sophie@email.com", phone: "+230 5863 7890", policies: 1, documents: 3, status: "inactive", joinedAt: "2024-08-30" },
  { id: "6", name: "Ravi Patel", email: "ravi@email.com", phone: "+230 5921 4567", policies: 2, documents: 7, status: "active", joinedAt: "2024-06-12" },
];
