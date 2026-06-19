import type { User } from "./supabase";
import type { Profile } from "../types";
/** sessionStorage payload */
export type DemoAuthPayload = {
    v: 1;
    userId: string;
    email: string;
    role: Profile["role"];
    full_name: string;
};
export declare const DEMO_STORAGE_KEY = "sb_demo_auth_v1";
/** Stable demo UUIDs for filtering mock data (e.g. client-only document views). */
export declare const DEMO_IDS: {
    readonly ADMIN: "11111111-1111-4111-8111-111111111111";
    readonly TEMP_ADMIN: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    readonly BROKER: "22222222-2222-4222-8222-222222222222";
    readonly CLIENT: "33333333-3333-4333-8333-333333333333";
};
export declare const DEMO_ACCOUNTS: readonly [{
    readonly email: string;
    readonly password: string;
    readonly profile: {
        id: string;
        email: string;
        full_name: string;
        role: "admin";
        phone: null;
        totp_secret: null;
        totp_enabled: false;
        last_login_at: string;
        avatar_url: null;
        bio: null;
        commission_rate: null;
        created_at: string;
        updated_at: string;
    };
}, {
    readonly email: string;
    readonly password: string;
    readonly profile: {
        id: string;
        email: string;
        full_name: string;
        role: "admin";
        phone: null;
        totp_secret: null;
        totp_enabled: false;
        last_login_at: string;
        avatar_url: null;
        bio: null;
        commission_rate: null;
        created_at: string;
        updated_at: string;
    };
}, {
    readonly email: string;
    readonly password: string;
    readonly profile: {
        id: string;
        email: string;
        full_name: string;
        role: "broker";
        phone: null;
        totp_secret: null;
        totp_enabled: false;
        last_login_at: string;
        avatar_url: null;
        bio: null;
        commission_rate: number;
        created_at: string;
        updated_at: string;
    };
}, {
    readonly email: string;
    readonly password: string;
    readonly profile: {
        id: string;
        email: string;
        full_name: string;
        role: "client";
        phone: null;
        totp_secret: null;
        totp_enabled: false;
        last_login_at: string;
        avatar_url: null;
        bio: null;
        commission_rate: null;
        created_at: string;
        updated_at: string;
    };
}];
export type DemoBundle = {
    user: User;
    profile: Profile;
};
/** Demo login is explicit in production: only `VITE_ALLOW_DEMO_LOGIN=true` enables it. */
export declare function isDemoAuthEnabled(): boolean;
/** Resolve built-in demo credentials for a role (first account when multiple share the role). */
export declare function getDemoCredentialsByRole(role: "client" | "broker" | "admin"): (typeof DEMO_ACCOUNTS)[number] | undefined;
export declare function matchDemoLogin(email: string, password: string): DemoBundle | null;
export declare function bundleFromPayload(p: DemoAuthPayload): DemoBundle;
export declare function payloadFromBundle(profile: Profile): DemoAuthPayload;
