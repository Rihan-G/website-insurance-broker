interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Array<"admin" | "broker" | "client">;
    fallback?: string;
}
export declare function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps): import("react/jsx-runtime").JSX.Element;
export {};
