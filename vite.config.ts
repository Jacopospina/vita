import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { fs: { allow: ["."] } },
  // Three pages: the documentation (index.html), the showcase (showcase.html) and what you can make (make.html).
  build: { rollupOptions: { input: { docs: path.resolve(import.meta.dirname, "index.html"), showcase: path.resolve(import.meta.dirname, "showcase.html"), make: path.resolve(import.meta.dirname, "make.html") } } },
  test: { environment: "jsdom", globals: false, setupFiles: ["tests/setup.ts"], include: ["tests/**/*.test.{ts,tsx}"] },
} as never)
