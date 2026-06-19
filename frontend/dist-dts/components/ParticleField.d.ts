interface ParticleFieldProps {
    count?: number;
    variant?: "rise" | "drift";
    className?: string;
    /** Shorter duration range for gentler but visible motion */
    pace?: "default" | "brisk";
}
export declare function ParticleField({ count, variant, className, pace, }: ParticleFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
