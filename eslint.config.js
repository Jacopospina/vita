import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import vita from "./eslint/vita-plugin.mjs"

export default tseslint.config(
  { ignores: ["dist", "node_modules", "tests/fixtures", "public"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs.recommended.rules, "@typescript-eslint/no-explicit-any": "error" },
  },
  // Product code (everything outside the registry) must obey the design system.
  {
    files: ["src/playground/**/*.tsx", "src/examples/**/*.tsx"],
    plugins: { vita },
    rules: { "vita/design-system": "error", "vita/deprecated": "warn" },
  },
)
