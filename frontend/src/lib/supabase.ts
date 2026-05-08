import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

/** See https://supabase.com/docs/guides/api/api-keys — publishable (sb_publishable_…) or legacy anon JWT. */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
