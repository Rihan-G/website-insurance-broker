import type { LucideIcon } from "lucide-react";
interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionTo?: string;
    onAction?: () => void;
}
export declare function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
