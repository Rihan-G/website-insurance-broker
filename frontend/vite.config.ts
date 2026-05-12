import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** GitHub Pages project URL is https://<user>.github.io/<repo>/ — set in CI (see deploy workflow). */
const ghPagesBase = process.env.VITE_GH_PAGES_BASE?.trim();
const base =
  ghPagesBase && ghPagesBase !== "/"
    ? ghPagesBase.endsWith("/")
      ? ghPagesBase
      : `${ghPagesBase}/`
    : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-pdf": ["jspdf", "jspdf-autotable"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
