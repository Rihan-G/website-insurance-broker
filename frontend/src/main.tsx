import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import App from "./App";
import "./lib/i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <CurrencyProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
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
        </CurrencyProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
