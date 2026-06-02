/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  /** Supabase project URL (build-time; set in CI secrets for GitHub Pages). */
  readonly VITE_SUPABASE_URL?: string;
  /** Legacy anon JWT (build-time). */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Preferred publishable key `sb_publishable_…` (build-time). */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** `"true"` | `"false"` — forces demo on/off; omit to derive from whether Supabase keys look configured. */
  readonly VITE_ALLOW_DEMO_LOGIN?: string;
  /** Set to `"false"` to hide the “Administrator sign-in” link on the public login page. */
  readonly VITE_SHOW_STAFF_LOGIN_LINK?: string;
  /** `unified` (default) | `client` | `staff` — split deploys use isolated Supabase auth storage. */
  readonly VITE_PORTAL_FLAVOR?: string;
  /** Operations portal origin, no trailing slash (required on client portal for staff hand-offs). */
  readonly VITE_STAFF_PORTAL_URL?: string;
  /** Client portal origin, no trailing slash (required on staff portal for my-policies hand-off). */
  readonly VITE_CLIENT_PORTAL_URL?: string;
  /** Google Gemini API key for voice transcription / future AI features (server-safe: use Edge Functions in production). */
  readonly VITE_GEMINI_API_KEY?: string;
  /** OpenRouter API key (preferred low-cost provider for testing). */
  readonly VITE_OPENROUTER_API_KEY?: string;
  /** Generic AI provider key hook (optional). */
  readonly VITE_AI_API_KEY?: string;
  /** OpenAI-compatible API key (optional). */
  readonly VITE_OPENAI_API_KEY?: string;
  /** Optional demo admin credentials for local/staging UX. */
  readonly VITE_DEMO_ADMIN_EMAIL?: string;
  readonly VITE_DEMO_ADMIN_PASSWORD?: string;
  /** Optional second demo admin (temporary/ops). */
  readonly VITE_DEMO_TEMP_ADMIN_EMAIL?: string;
  readonly VITE_DEMO_TEMP_ADMIN_PASSWORD?: string;
  /** Optional demo broker credentials. */
  readonly VITE_DEMO_BROKER_EMAIL?: string;
  readonly VITE_DEMO_BROKER_PASSWORD?: string;
  /** Optional demo client credentials. */
  readonly VITE_DEMO_CLIENT_EMAIL?: string;
  readonly VITE_DEMO_CLIENT_PASSWORD?: string;
  /** Optional full URL to a GitHub compare view or PR (Renewals staff panel). Empty values are ignored. */
  readonly VITE_GITHUB_PR_COMPARE?: string;
  /** Optional override for “Repository” links (e.g. fork). Must be repo root, with or without https://. */
  readonly VITE_GITHUB_REPO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
