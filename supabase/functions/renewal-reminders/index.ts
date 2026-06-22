// Scheduled Edge Function — renewal reminders
// Deploy: supabase functions deploy renewal-reminders
// Schedule: supabase functions schedule renewal-reminders --cron "0 8 * * *"
// (runs daily at 08:00 UTC — adjust for Mauritius time UTC+4 → set to "0 4 * * *")
//
// Required secrets (supabase secrets set):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY  (for email — https://resend.com)
//   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID  (for Meta Cloud API — optional)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REMINDER_WINDOWS = [30, 14, 7]; // days before expiry

interface Policy {
  id: string;
  policy_number: string;
  product_type: string;
  end_date: string;
  preferred_channel: "email" | "whatsapp" | "sms";
  client: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface ReminderLog {
  policy_id: string;
  channel: string;
  days_before_expiry: number;
  sent_at: string;
  status: "sent" | "failed";
  error?: string;
}

Deno.serve(async (req) => {
  // Allow manual trigger via POST; scheduled trigger arrives as GET
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const today = new Date();
  const logs: ReminderLog[] = [];
  let policiesProcessed = 0;

  for (const daysWindow of REMINDER_WINDOWS) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysWindow);
    const dateStr = targetDate.toISOString().split("T")[0];

    // Fetch policies expiring on exactly this target date
    const { data: policies, error } = await supabase
      .from("policies")
      .select(`
        id, policy_number, product_type, end_date, preferred_channel,
        client:profiles!policies_client_id_fkey (full_name, email, phone)
      `)
      .eq("end_date", dateStr)
      .eq("status", "active");

    if (error) {
      console.error(`Error fetching policies for +${daysWindow}d:`, error);
      continue;
    }

    for (const policy of (policies ?? []) as unknown as Policy[]) {
      policiesProcessed++;
      const { client } = policy;
      const channel = policy.preferred_channel ?? "email";

      try {
        if (channel === "email" && client.email) {
          await sendEmail({
            to: client.email,
            name: client.full_name,
            policyNumber: policy.policy_number,
            product: policy.product_type,
            endDate: policy.end_date,
            daysLeft: daysWindow,
          });
          logs.push({ policy_id: policy.id, channel: "email", days_before_expiry: daysWindow, sent_at: today.toISOString(), status: "sent" });
        } else if (channel === "whatsapp" && client.phone) {
          await sendWhatsApp({
            phone: client.phone,
            name: client.full_name,
            policyNumber: policy.policy_number,
            product: policy.product_type,
            endDate: policy.end_date,
            daysLeft: daysWindow,
          });
          logs.push({ policy_id: policy.id, channel: "whatsapp", days_before_expiry: daysWindow, sent_at: today.toISOString(), status: "sent" });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to send reminder for policy ${policy.policy_number}:`, message);
        logs.push({ policy_id: policy.id, channel, days_before_expiry: daysWindow, sent_at: today.toISOString(), status: "failed", error: message });
      }
    }
  }

  // Persist logs to notification_log table (best-effort)
  if (logs.length > 0) {
    const { error: logError } = await supabase.from("notification_log").insert(
      logs.map((l) => ({
        policy_id: l.policy_id,
        channel: l.channel,
        event_type: "renewal_reminder",
        metadata: { days_before_expiry: l.days_before_expiry, status: l.status, error: l.error },
        created_at: l.sent_at,
      })),
    );
    if (logError) console.error("Failed to write notification_log:", logError);
  }

  return new Response(
    JSON.stringify({ date: today.toISOString().split("T")[0], policiesProcessed, reminders: logs }),
    { headers: { "Content-Type": "application/json" } },
  );
});

// ── Email via Resend ──────────────────────────────────────────────────────────

async function sendEmail(params: {
  to: string;
  name: string;
  policyNumber: string;
  product: string;
  endDate: string;
  daysLeft: number;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const urgency = params.daysLeft <= 7 ? "urgent: " : params.daysLeft <= 14 ? "important: " : "";
  const subject = `Policy renewal ${urgency}reminder — ${params.policyNumber}`;

  const html = `
    <p>Dear ${params.name},</p>
    <p>This is a reminder that your <strong>${params.product}</strong> policy
    (<strong>${params.policyNumber}</strong>) is due for renewal in
    <strong>${params.daysLeft} day${params.daysLeft !== 1 ? "s" : ""}</strong>,
    on <strong>${new Date(params.endDate).toLocaleDateString("en-MU", { day: "numeric", month: "long", year: "numeric" })}</strong>.</p>
    <p>Please contact your broker at Sindicom Brokers to discuss renewal options and ensure you remain covered.</p>
    <p>If you have already arranged your renewal, please disregard this message.</p>
    <br/>
    <p>Kind regards,<br/><strong>Sindicom Brokers Ltd</strong><br/>
    Licensed Insurance Broker — FSC Mauritius</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "reminders@sindicom.mu",
      to: params.to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

// ── WhatsApp via Meta Cloud API ───────────────────────────────────────────────

async function sendWhatsApp(params: {
  phone: string;
  name: string;
  policyNumber: string;
  product: string;
  endDate: string;
  daysLeft: number;
}) {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneId = Deno.env.get("WHATSAPP_PHONE_ID");
  if (!token || !phoneId) throw new Error("WHATSAPP_TOKEN or WHATSAPP_PHONE_ID not set");

  const firstName = params.name.split(" ")[0];
  const formattedDate = new Date(params.endDate).toLocaleDateString("en-MU", { day: "numeric", month: "long", year: "numeric" });
  const message = `Hi ${firstName}, this is a reminder from Sindicom Brokers. Your ${params.product} policy (${params.policyNumber}) is due for renewal on ${formattedDate} — in ${params.daysLeft} day${params.daysLeft !== 1 ? "s" : ""}. Please contact us to renew and stay covered. Thank you.`;

  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.phone,
      type: "text",
      text: { body: message },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${body}`);
  }
}
