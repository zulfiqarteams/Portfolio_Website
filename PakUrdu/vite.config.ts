import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this app from a sub-path (not the domain root),
  // so every built asset URL needs that prefix. Must match BASE_PATH in
  // src/config/site.ts and the <BrowserRouter basename> in src/main.tsx.
  base: "/Z_Tech/PakUrdu/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
