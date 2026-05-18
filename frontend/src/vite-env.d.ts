/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional separate origin for client-facing portal links (no trailing slash). */
  readonly VITE_CLIENT_PORTAL_URL?: string;
}
