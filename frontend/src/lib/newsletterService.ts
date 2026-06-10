import { db } from "./db";
import { saveNewsletterSignup } from "./localPrefs";

export async function subscribeNewsletter(email: string, source = "website"): Promise<{ ok: boolean; message: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { ok: false, message: "Email is required." };

  saveNewsletterSignup(normalized);

  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url.includes("your-project")) {
    return { ok: true, message: "Saved locally (Supabase not configured)." };
  }

  const { error } = await db.newsletterSubscribers().insert({ email: normalized, source });
  if (error) {
    if (error.code === "23505") return { ok: true, message: "You are already subscribed." };
    return { ok: false, message: error.message };
  }
  return { ok: true, message: "Subscribed — thank you!" };
}
