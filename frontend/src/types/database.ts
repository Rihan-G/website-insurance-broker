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
          totp_secret: string | null;
          totp_enabled: boolean;
          last_login_at: string | null;
          avatar_url: string | null;
          bio: string | null;
          commission_rate: number | null;
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
          totp_secret: string | null;
          totp_enabled: boolean;
          last_login_at: string | null;
          avatar_url: string | null;
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
          version?: number;
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
      document_reviews: {
        Row: {
          id: string;
          document_id: string;
          reviewer_id: string;
          status: "approved" | "rejected" | "needs_revision";
          comment: string | null;
          created_at: string;
        };
        Insert: {
          document_id: string;
          reviewer_id: string;
          status: "approved" | "rejected" | "needs_revision";
          comment?: string | null;
        };
        Update: never;
      };
      inbox_messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          body: string;
          is_read: boolean;
          message_type: string;
          attachment_url: string | null;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          recipient_id: string;
          subject: string;
          body: string;
          message_type?: string;
          attachment_url?: string | null;
        };
        Update: Partial<{ is_read: boolean }>;
      };
      payments: {
        Row: {
          id: string;
          client_id: string;
          policy_id: string | null;
          amount: number;
          currency: string;
          status: "pending" | "paid" | "failed" | "expired" | "refunded";
          gateway: string;
          gateway_reference: string | null;
          payment_link: string | null;
          link_expires_at: string | null;
          paid_at: string | null;
          receipt_url: string | null;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          policy_id?: string | null;
          amount: number;
          currency?: string;
          status?: string;
          gateway?: string;
          payment_link?: string | null;
          link_expires_at?: string | null;
          description?: string | null;
          created_by: string;
        };
        Update: Partial<{
          status: string;
          paid_at: string | null;
          receipt_url: string | null;
          gateway_reference: string | null;
          updated_at: string;
        }>;
      };
      generated_documents: {
        Row: {
          id: string;
          client_id: string;
          payment_id: string | null;
          policy_id: string | null;
          doc_type: "receipt" | "policy_certificate" | "renewal_notice" | "statement";
          file_path: string;
          generated_at: string;
          generated_by: string;
        };
        Insert: {
          client_id: string;
          payment_id?: string | null;
          policy_id?: string | null;
          doc_type: string;
          file_path: string;
          generated_by: string;
        };
        Update: never;
      };
      quotes: {
        Row: {
          id: string;
          client_id: string | null;
          product_type: string;
          input_data: Record<string, unknown>;
          estimated_premium: number | null;
          status: "draft" | "sent" | "accepted" | "rejected" | "converted";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id?: string | null;
          product_type: string;
          input_data: Record<string, unknown>;
          estimated_premium?: number | null;
          status?: string;
          notes?: string | null;
        };
        Update: Partial<{
          status: string;
          estimated_premium: number | null;
          notes: string | null;
          updated_at: string;
        }>;
      };
      commissions: {
        Row: {
          id: string;
          broker_id: string;
          policy_id: string;
          payment_id: string | null;
          rate: number;
          amount: number;
          status: "pending" | "paid" | "cancelled";
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          broker_id: string;
          policy_id: string;
          payment_id?: string | null;
          rate: number;
          amount: number;
          status?: string;
        };
        Update: Partial<{ status: string; paid_at: string | null }>;
      };
      expiry_alerts: {
        Row: {
          id: string;
          client_id: string;
          policy_id: string | null;
          document_id: string | null;
          alert_type: "policy_expiry" | "document_expiry" | "renewal_due" | "payment_due";
          expires_at: string;
          days_before_alert: number;
          notified_at: string | null;
          status: "active" | "snoozed" | "dismissed";
          created_at: string;
        };
        Insert: {
          client_id: string;
          policy_id?: string | null;
          document_id?: string | null;
          alert_type: string;
          expires_at: string;
          days_before_alert?: number;
        };
        Update: Partial<{ status: string; notified_at: string | null }>;
      };
      mid_term_adjustments: {
        Row: {
          id: string;
          policy_id: string;
          client_id: string;
          adjustment_type: string;
          description: string;
          premium_change: number | null;
          status: "pending" | "in_review" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          policy_id: string;
          client_id: string;
          adjustment_type: string;
          description: string;
          premium_change?: number | null;
          status?: string;
        };
        Update: Partial<{ status: string; reviewed_by: string | null; reviewed_at: string | null }>;
      };
      voice_notes: {
        Row: {
          id: string;
          client_id: string;
          file_path: string;
          duration_seconds: number | null;
          transcript: string | null;
          language: string;
          processing_status: "pending" | "processing" | "done" | "failed";
          linked_document_id: string | null;
          created_at: string;
        };
        Insert: {
          client_id: string;
          file_path: string;
          duration_seconds?: number | null;
          language?: string;
          processing_status?: string;
          linked_document_id?: string | null;
        };
        Update: Partial<{
          transcript: string | null;
          processing_status: string;
          linked_document_id: string | null;
        }>;
      };
      notification_log: {
        Row: {
          id: string;
          recipient_id: string;
          channel: "email" | "sms" | "whatsapp" | "push";
          message: string;
          status: "queued" | "sent" | "failed" | "delivered";
          external_id: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          recipient_id: string;
          channel: string;
          message: string;
          status?: string;
        };
        Update: Partial<{ status: string; sent_at: string | null; external_id: string | null }>;
      };
      renewal_preferences: {
        Row: {
          policy_id: string;
          client_id: string;
          remind_email: boolean;
          remind_sms: boolean;
          remind_whatsapp: boolean;
          last_reminder_at: string | null;
          updated_at: string;
        };
        Insert: {
          policy_id: string;
          client_id: string;
          remind_email?: boolean;
          remind_sms?: boolean;
          remind_whatsapp?: boolean;
          last_reminder_at?: string | null;
        };
        Update: Partial<{
          remind_email: boolean;
          remind_sms: boolean;
          remind_whatsapp: boolean;
          last_reminder_at: string | null;
          updated_at: string;
        }>;
      };
      claim_intakes: {
        Row: {
          id: string;
          client_id: string;
          created_by: string;
          policy_number: string | null;
          incident_at: string | null;
          location: string | null;
          description: string | null;
          third_parties: string | null;
          status: "draft" | "submitted" | "in_review" | "closed";
          created_at: string;
        };
        Insert: {
          client_id: string;
          created_by: string;
          policy_number?: string | null;
          incident_at?: string | null;
          location?: string | null;
          description?: string | null;
          third_parties?: string | null;
          status?: string;
        };
        Update: Partial<{ status: string }>;
      };
      claim_intake_attachments: {
        Row: {
          id: string;
          claim_intake_id: string;
          storage_object_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          claim_intake_id: string;
          storage_object_path: string;
          file_name: string;
          file_size?: number | null;
          mime_type: string;
          uploaded_by: string;
        };
        Update: Partial<{
          storage_object_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string;
        }>;
      };
      secure_threads: {
        Row: {
          id: string;
          policy_id: string | null;
          client_id: string;
          subject: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          policy_id?: string | null;
          client_id: string;
          subject: string;
        };
        Update: Partial<{ subject: string; policy_id: string | null; updated_at: string }>;
      };
      secure_messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          thread_id: string;
          sender_id: string;
          body: string;
        };
        Update: never;
      };
      portal_notifications: {
        Row: {
          id: string;
          user_id: string;
          kind: "document" | "payment" | "security" | "system";
          title: string;
          body: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          kind: string;
          title: string;
          body: string;
          read?: boolean;
        };
        Update: Partial<{ read: boolean }>;
      };
      broker_tasks: {
        Row: {
          id: string;
          title: string;
          client_id: string | null;
          assignee_id: string | null;
          due_at: string | null;
          status: "open" | "in_progress" | "done";
          created_by: string;
          created_at: string;
        };
        Insert: {
          title: string;
          client_id?: string | null;
          assignee_id?: string | null;
          due_at?: string | null;
          status?: string;
          created_by: string;
        };
        Update: Partial<{
          title: string;
          client_id: string | null;
          assignee_id: string | null;
          due_at: string | null;
          status: string;
        }>;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
export type InboxMessage = Database["public"]["Tables"]["inbox_messages"]["Row"];
export type ExpiryAlert = Database["public"]["Tables"]["expiry_alerts"]["Row"];
export type VoiceNote = Database["public"]["Tables"]["voice_notes"]["Row"];
export type Commission = Database["public"]["Tables"]["commissions"]["Row"];
