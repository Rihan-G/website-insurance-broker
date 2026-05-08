import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  resolved: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "sb_theme";

function prefersDarkScheme(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  } catch {
    return false;
  }
}

function applyDarkClass(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPrefState] = useState<ThemePreference>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      if (raw === "light" || raw === "dark" || raw === "system") return raw;
    } catch {
      /* ignore */
    }
    return "system";
  });

  const [systemDark, setSystemDark] = useState(prefersDarkScheme);

  const resolved: "light" | "dark" =
    preference === "dark" ? "dark" : preference === "light" ? "light" : systemDark ? "dark" : "light";

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    applyDarkClass(resolved === "dark");
  }, [resolved]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPrefState(p);
    try {
      localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ preference, setPreference, resolved }),
    [preference, setPreference, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
