import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => ({
  server: { port: 5174 },
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
    },
  },
  plugins: [
    // Cloudflare Workers runtime only in production builds.
    // Dev uses standard Node/Vite SSR so process.env and normal imports work.
    ...(command === "build" ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    tailwindcss(),
    reactRouter(),
  ],
}));
