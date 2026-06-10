import { db } from "./db";
import type { StoredUserPrefs } from "./localPrefs";
import { loadUserPrefs, saveUserPrefs } from "./localPrefs";
import { COMPANY_NAME } from "./branding";

export async function loadPrefsForUser(userId: string | undefined, companyName = COMPANY_NAME): Promise<StoredUserPrefs> {
  const local = loadUserPrefs(companyName);
  if (!userId) return local;

  const { data, error } = await db.profiles().select("portal_prefs").eq("id", userId).maybeSingle();
  if (error || !data?.portal_prefs || typeof data.portal_prefs !== "object") return local;

  const remote = data.portal_prefs as Partial<StoredUserPrefs>;
  return {
    ...local,
    ...remote,
    notifications: { ...local.notifications, ...remote.notifications },
  };
}

export async function savePrefsForUser(userId: string | undefined, prefs: StoredUserPrefs): Promise<void> {
  saveUserPrefs(prefs);
  if (!userId) return;

  await db.profiles().update({ portal_prefs: prefs }).eq("id", userId);
}
