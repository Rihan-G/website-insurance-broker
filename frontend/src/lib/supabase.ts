import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { getPortalFlavor } from "./portalFlavor";

/** See https://supabase.com/docs/guides/api/api-keys — publishable (sb_publishable_…) or legacy anon JWT. */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

const flavor = getPortalFlavor();
const authStorageKey = flavor !== "unified" ? `sb-securebroker-auth-${flavor}` : undefined;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    ...(authStorageKey ? { storageKey: authStorageKey } : {}),
  },
});
