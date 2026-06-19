export type ThemePreference = "light" | "dark" | "system";
type ThemeContextValue = {
    preference: ThemePreference;
    setPreference: (p: ThemePreference) => void;
    resolved: "light" | "dark";
};
export declare function ThemeProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export {};
