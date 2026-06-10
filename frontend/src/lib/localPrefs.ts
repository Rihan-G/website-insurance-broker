export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  policyExpiry: boolean;
  paymentReminder: boolean;
}

export interface StoredUserPrefs {
  notifications: NotificationPrefs;
  companyName: string;
  businessRegistration: string;
  language: string;
}

const PREFS_KEY = "sb_user_prefs_v1";
const NEWSLETTER_KEY = "sb_newsletter_signups_v1";
const COOKIE_CONSENT_KEY = "sb_cookie_consent_v1";
const ONBOARDING_KEY = "sb_onboarding_done_v1";

const defaultNotifications: NotificationPrefs = {
  email: true,
  sms: false,
  whatsapp: true,
  policyExpiry: true,
  paymentReminder: true,
};

export const defaultUserPrefs = (companyName: string): StoredUserPrefs => ({
  notifications: { ...defaultNotifications },
  companyName,
  businessRegistration: "C12345678",
  language: "English",
});

export function loadUserPrefs(companyName: string): StoredUserPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultUserPrefs(companyName);
    const parsed = JSON.parse(raw) as Partial<StoredUserPrefs>;
    return {
      ...defaultUserPrefs(companyName),
      ...parsed,
      notifications: { ...defaultNotifications, ...parsed.notifications },
    };
  } catch {
    return defaultUserPrefs(companyName);
  }
}

export function saveUserPrefs(prefs: StoredUserPrefs): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function saveNewsletterSignup(email: string): void {
  try {
    const raw = localStorage.getItem(NEWSLETTER_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(email.toLowerCase())) {
      list.push(email.toLowerCase());
      localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list));
    }
  } catch {
    localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([email.toLowerCase()]));
  }
}

export function hasCookieConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function acceptCookieConsent(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, "1");
}
