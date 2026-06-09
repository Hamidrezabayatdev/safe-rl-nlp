import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // cast: vitest bundles a nested vite whose Plugin type differs from the
  // top-level vite's, which otherwise produces a spurious mismatch here.
  plugins: [react(), tailwindcss()] as never,
  resolve: {
    alias: {
      // Linux dev/CI only; .pathname avoids a hard dependency on @types/node.
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          katex: ["katex", "react-katex"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
