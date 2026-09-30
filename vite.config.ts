import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { fs: { allow: ["."] } },
  test: { environment: "jsdom", globals: false, setupFiles: ["tests/setup.ts"], include: ["tests/**/*.test.{ts,tsx}"] },
} as never)
