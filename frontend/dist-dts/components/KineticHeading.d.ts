interface KineticHeadingProps {
    text: string;
    className?: string;
    highlightWords?: string[];
    delay?: number;
}
export declare function KineticHeading({ text, className, highlightWords, delay, }: KineticHeadingProps): import("react/jsx-runtime").JSX.Element;
interface TypewriterProps {
    words: string[];
    className?: string;
    speed?: number;
}
export declare function Typewriter({ words, className, speed }: TypewriterProps): import("react/jsx-runtime").JSX.Element;
export {};
