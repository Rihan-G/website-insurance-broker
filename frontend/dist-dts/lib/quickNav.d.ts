export type AppRole = "admin" | "broker" | "client";
export interface QuickNavItem {
    id: string;
    label: string;
    to: string;
    /** Extra tokens to match when filtering (lowercased). */
    keywords?: string;
    /** If set, only these roles see the item. */
    roles?: AppRole[];
}
export declare const QUICK_NAV_ITEMS: QuickNavItem[];
export declare function quickNavForRole(role: AppRole | undefined, query: string): QuickNavItem[];
