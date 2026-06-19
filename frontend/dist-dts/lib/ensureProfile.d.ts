import type { User } from "./supabase";
import type { Profile } from "../types";
/** Create a profiles row when the auth trigger did not run yet (common on fresh sign-ups). */
export declare function insertProfileForUser(user: User): Promise<Profile | null>;
/** Fetch profile; retry briefly; backfill row if missing. */
export declare function resolveProfileForUser(user: User, attempts?: number): Promise<Profile | null>;
