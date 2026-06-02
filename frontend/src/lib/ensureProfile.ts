import type { User } from "./supabase";
import { supabase } from "./supabase";
import type { Profile } from "../types";

const VALID_ROLES = new Set<Profile["role"]>(["admin", "broker", "client"]);

function roleFromUser(user: User): Profile["role"] {
  const raw = user.user_metadata?.role;
  if (typeof raw === "string" && VALID_ROLES.has(raw as Profile["role"])) {
    return raw as Profile["role"];
  }
  return "client";
}

function fullNameFromUser(user: User): string {
  const meta = user.user_metadata?.full_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  const emailLocal = user.email?.split("@")[0]?.trim();
  if (emailLocal) return emailLocal;
  return "New User";
}

/** Create a profiles row when the auth trigger did not run yet (common on fresh sign-ups). */
export async function insertProfileForUser(user: User): Promise<Profile | null> {
  const row = {
    id: user.id,
    email: user.email ?? "",
    full_name: fullNameFromUser(user),
    role: roleFromUser(user),
  };

  const { data, error } = await supabase.from("profiles").insert(row).select("*").single();

  if (!error && data) return data as Profile;

  // Race: trigger inserted between fetch and insert
  if (error && !/duplicate|unique|23505/i.test(error.message)) {
    console.warn("[ensureProfile] insert failed:", error.message);
  }

  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (existing as Profile | null) ?? null;
}

/** Fetch profile; retry briefly; backfill row if missing. */
export async function resolveProfileForUser(user: User, attempts = 4): Promise<Profile | null> {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    if (data) return data as Profile;

    const missing = error?.code === "PGRST116" || /0 rows|not found/i.test(error?.message ?? "");
    if (!missing && error) {
      console.warn("[ensureProfile] fetch failed:", error.message);
      return null;
    }

    if (i === attempts - 1) break;
    await new Promise((r) => setTimeout(r, 250 * (i + 1)));
  }

  return insertProfileForUser(user);
}
