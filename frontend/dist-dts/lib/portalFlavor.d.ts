export type PortalFlavor = "unified" | "client" | "staff";
/** How this bundle is deployed: single site (default), client-only host, or staff-only host. */
export declare function getPortalFlavor(): PortalFlavor;
export declare function isUnifiedPortal(): boolean;
export declare function isClientPortalHost(): boolean;
export declare function isStaffPortalHost(): boolean;
/** Operations / staff portal origin (no trailing slash). Used from client portal for hand-offs. */
export declare function staffPortalBaseUrl(): string | null;
/** Client portal origin (no trailing slash). Used from staff portal for hand-offs. */
export declare function clientPortalBaseUrl(): string | null;
