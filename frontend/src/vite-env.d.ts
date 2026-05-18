/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to `"false"` to hide the “Administrator sign-in” link on the public login page. */
  readonly VITE_SHOW_STAFF_LOGIN_LINK?: string;
}
