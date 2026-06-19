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
export declare const defaultUserPrefs: (companyName: string) => StoredUserPrefs;
export declare function loadUserPrefs(companyName: string): StoredUserPrefs;
export declare function saveUserPrefs(prefs: StoredUserPrefs): void;
export declare function saveNewsletterSignup(email: string): void;
export declare function hasCookieConsent(): boolean;
export declare function acceptCookieConsent(): void;
export declare function isOnboardingDone(): boolean;
export declare function markOnboardingDone(): void;
