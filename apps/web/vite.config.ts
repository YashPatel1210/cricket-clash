import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@cricket-clash/simulation": path.resolve(__dirname, "../../packages/simulation/src"),
      "@cricket-clash/data":       path.resolve(__dirname, "../../packages/data/src"),
      "@cricket-clash/shared":     path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
});
