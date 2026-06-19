export type { Database, Profile, Document, Policy, AuditLog } from "./database";
export interface DashboardStats {
    totalClients: number;
    activePolices: number;
    pendingDocuments: number;
    monthlyRevenue: number;
    revenueChange: number;
    documentsProcessed: number;
}
export interface UploadProgress {
    fileName: string;
    progress: number;
    status: "uploading" | "processing" | "complete" | "error";
    error?: string;
}
export interface PipelineItem {
    id: string;
    clientName: string;
    documentType: string;
    status: "uploaded" | "processing" | "reviewed" | "approved" | "rejected";
    uploadedAt: string;
    confidence?: number;
}
