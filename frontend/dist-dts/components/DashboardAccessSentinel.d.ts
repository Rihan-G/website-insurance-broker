/**
 * - **Unified** (default): clients cannot open staff dashboard segments (same origin).
 * - **Client portal host**: any signed-in user hitting a staff URL is sent to `VITE_STAFF_PORTAL_URL` + path when set.
 * - **Staff portal host**: anyone hitting a client-only segment (e.g. my-policies) is sent to `VITE_CLIENT_PORTAL_URL` + path when set.
 */
export declare function DashboardAccessSentinel({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
