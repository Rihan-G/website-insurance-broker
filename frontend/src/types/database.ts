export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "admin" | "broker" | "client";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "admin" | "broker" | "client";
          phone?: string | null;
        };
        Update: Partial<{
          email: string;
          full_name: string;
          role: "admin" | "broker" | "client";
          phone: string | null;
          updated_at: string;
        }>;
      };
      documents: {
        Row: {
          id: string;
          client_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status: "uploaded" | "processing" | "reviewed" | "approved" | "rejected";
          ocr_data: Record<string, unknown> | null;
          ocr_confidence: number | null;
          version: number;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          status?: string;
          uploaded_by: string;
        };
        Update: Partial<{
          status: string;
          ocr_data: Record<string, unknown> | null;
          ocr_confidence: number | null;
          version: number;
          updated_at: string;
        }>;
      };
      policies: {
        Row: {
          id: string;
          client_id: string;
          policy_number: string;
          insurer: string;
          product_type: string;
          premium: number;
          start_date: string;
          end_date: string;
          status: "active" | "pending" | "expired" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          policy_number: string;
          insurer: string;
          product_type: string;
          premium: number;
          start_date: string;
          end_date: string;
          status?: string;
        };
        Update: Partial<{
          insurer: string;
          product_type: string;
          premium: number;
          end_date: string;
          status: string;
          updated_at: string;
        }>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          details?: Record<string, unknown> | null;
          ip_address?: string | null;
        };
        Update: never;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
