/// <reference types="vite/client" />

interface ImportMetaEnv {
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
  /** Generic AI provider key hook (optional). */
  readonly VITE_AI_API_KEY?: string;
  /** OpenAI-compatible API key (optional). */
  readonly VITE_OPENAI_API_KEY?: string;
  /** Optional full URL to a GitHub compare view or PR (Renewals staff panel link). */
  readonly VITE_GITHUB_PR_COMPARE?: string;
}
