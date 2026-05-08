import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types";

/** sessionStorage payload */
export type DemoAuthPayload = {
  v: 1;
  userId: string;
  email: string;
  role: Profile["role"];
  full_name: string;
};

export const DEMO_STORAGE_KEY = "sb_demo_auth_v1";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const BROKER_ID = "22222222-2222-4222-8222-222222222222";
const CLIENT_ID = "33333333-3333-4333-8333-333333333333";

const now = () => new Date().toISOString();

export const DEMO_ACCOUNTS = [
  {
    email: (import.meta.env.VITE_DEMO_ADMIN_EMAIL as string | undefined) ?? "admin@demo.securebroker.local",
    password:
      (import.meta.env.VITE_DEMO_ADMIN_PASSWORD as string | undefined) ?? "AdminDemo!SecureBroker",
    profile: {
      id: ADMIN_ID,
      email: (import.meta.env.VITE_DEMO_ADMIN_EMAIL as string | undefined) ?? "admin@demo.securebroker.local",
      full_name: "Demo Administrator",
      role: "admin" as const,
      phone: null,
      totp_secret: null,
      totp_enabled: false,
      last_login_at: now(),
      avatar_url: null,
      bio: null,
      commission_rate: null,
      created_at: now(),
      updated_at: now(),
    } satisfies Profile,
  },
  {
    email: (import.meta.env.VITE_DEMO_BROKER_EMAIL as string | undefined) ?? "broker@demo.securebroker.local",
    password:
      (import.meta.env.VITE_DEMO_BROKER_PASSWORD as string | undefined) ?? "BrokerDemo!SecureBroker",
    profile: {
      id: BROKER_ID,
      email:
        (import.meta.env.VITE_DEMO_BROKER_EMAIL as string | undefined) ?? "broker@demo.securebroker.local",
      full_name: "Demo Broker",
      role: "broker" as const,
      phone: null,
      totp_secret: null,
      totp_enabled: false,
      last_login_at: now(),
      avatar_url: null,
      bio: null,
      commission_rate: 12.5,
      created_at: now(),
      updated_at: now(),
    } satisfies Profile,
  },
  {
    email: (import.meta.env.VITE_DEMO_CLIENT_EMAIL as string | undefined) ?? "client@demo.securebroker.local",
    password:
      (import.meta.env.VITE_DEMO_CLIENT_PASSWORD as string | undefined) ?? "ClientDemo!SecureBroker",
    profile: {
      id: CLIENT_ID,
      email:
        (import.meta.env.VITE_DEMO_CLIENT_EMAIL as string | undefined) ?? "client@demo.securebroker.local",
      full_name: "Demo Client",
      role: "client" as const,
      phone: null,
      totp_secret: null,
      totp_enabled: false,
      last_login_at: now(),
      avatar_url: null,
      bio: null,
      commission_rate: null,
      created_at: now(),
      updated_at: now(),
    } satisfies Profile,
  },
] as const;

export type DemoBundle = { user: User; profile: Profile };

function buildUser(profile: Profile): User {
  const t = now();
  return {
    id: profile.id,
    aud: "authenticated",
    role: "authenticated",
    email: profile.email,
    email_confirmed_at: t,
    phone: "",
    confirmed_at: t,
    last_sign_in_at: t,
    app_metadata: {},
    user_metadata: { full_name: profile.full_name },
    identities: [],
    created_at: t,
    updated_at: t,
    is_anonymous: false,
  } as User;
}

function supabaseLooksUnconfigured(): boolean {
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ??
    "";
  return !key || key.includes("placeholder");
}

/** Demo login when Supabase env is not wired, or when `VITE_ALLOW_DEMO_LOGIN=true`. */
export function isDemoAuthEnabled(): boolean {
  if (import.meta.env.VITE_ALLOW_DEMO_LOGIN === "false") return false;
  if (import.meta.env.VITE_ALLOW_DEMO_LOGIN === "true") return true;
  return import.meta.env.DEV && supabaseLooksUnconfigured();
}

export function matchDemoLogin(email: string, password: string): DemoBundle | null {
  if (!isDemoAuthEnabled()) return null;
  const hit = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
  if (!hit) return null;
  const profile = { ...hit.profile, last_login_at: now(), updated_at: now() };
  return { user: buildUser(profile), profile };
}

export function bundleFromPayload(p: DemoAuthPayload): DemoBundle {
  const tmpl =
    DEMO_ACCOUNTS.find((a) => a.profile.role === p.role)?.profile ??
    DEMO_ACCOUNTS[2].profile;
  const profile: Profile = {
    ...tmpl,
    id: p.userId,
    email: p.email,
    full_name: p.full_name,
    role: p.role,
    last_login_at: now(),
    updated_at: now(),
  };
  return { user: buildUser(profile), profile };
}

export function payloadFromBundle(profile: Profile): DemoAuthPayload {
  return {
    v: 1,
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    full_name: profile.full_name,
  };
}
