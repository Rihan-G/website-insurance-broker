/**
 * Full-page navigation to another origin (client ↔ staff portal).
 * Used so each hostname keeps its own Supabase session in localStorage.
 */
export declare function CrossPortalNavigate({ href }: {
    href: string;
}): import("react/jsx-runtime").JSX.Element;
