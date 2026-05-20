/**
 * Typed wrappers for Supabase tables that are not yet in the
 * auto-generated type definitions. Using explicit casts here
 * keeps all other files clean and type-safe.
 */
import { supabase } from "./supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export const db = {
  inboxMessages: () => sb.from("inbox_messages"),
  payments: () => sb.from("payments"),
  quotes: () => sb.from("quotes"),
  expiryAlerts: () => sb.from("expiry_alerts"),
  documentReviews: () => sb.from("document_reviews"),
  voiceNotes: () => sb.from("voice_notes"),
  midTermAdjustments: () => sb.from("mid_term_adjustments"),
  commissions: () => sb.from("commissions"),
  generatedDocuments: () => sb.from("generated_documents"),
  notificationLog: () => sb.from("notification_log"),
  // existing tables – also routed here so mutations avoid strict generic constraints
  profiles: () => sb.from("profiles"),
  documents: () => sb.from("documents"),
  policies: () => sb.from("policies"),
  auditLogs: () => sb.from("audit_logs"),
  renewalPreferences: () => sb.from("renewal_preferences"),
  claimIntakes: () => sb.from("claim_intakes"),
  claimIntakeAttachments: () => sb.from("claim_intake_attachments"),
  secureThreads: () => sb.from("secure_threads"),
  secureMessages: () => sb.from("secure_messages"),
  portalNotifications: () => sb.from("portal_notifications"),
  brokerTasks: () => sb.from("broker_tasks"),
};
