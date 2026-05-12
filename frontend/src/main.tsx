import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./lib/i18n";
import "./index.css";

/** GitHub Pages serves the app under /<repo>/; Vite sets import.meta.env.BASE_URL with a trailing slash. */
function routerBasename(): string | undefined {
  const b = import.meta.env.BASE_URL;
  if (!b || b === "/") return undefined;
  return b.endsWith("/") ? b.slice(0, -1) : b;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={routerBasename()}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "dark:!shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
              style: {
                borderRadius: "0.75rem",
                background: "var(--color-surface)",
                color: "var(--color-surface-foreground)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                fontSize: "0.875rem",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
