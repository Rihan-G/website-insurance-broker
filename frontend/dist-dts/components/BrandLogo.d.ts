type BrandLogoProps = {
    className?: string;
    imageClassName?: string;
    /** Accessible label; defaults to decorative (empty alt). */
    label?: string;
};
/**
 * Sindicom logo from `public/brand/` (logo.svg → logo.png), with shield fallback.
 */
export declare function BrandLogo({ className, imageClassName, label }: BrandLogoProps): import("react/jsx-runtime").JSX.Element;
export {};
