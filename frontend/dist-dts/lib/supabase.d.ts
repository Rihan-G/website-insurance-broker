import { type User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "../types/database";
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", "public", never, {
    PostgrestVersion: "12";
}>;
export type User = SupabaseUser;
