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
}
