/**
 * eslint-plugin-corpus — surfaces corpus-audit rules in the editor.
 *   import corpus from "./eslint/corpus-plugin.mjs"
 *   export default [{ plugins: { corpus }, rules: { "corpus/design-system": "error" } }]
 */
import { createRules } from "../scripts/corpus-rules.mjs"

const rules = createRules()

const designSystem = {
  meta: { type: "problem", docs: { description: "The design system is the only source of UI" }, schema: [] },
  create(context) {
    const ext = "." + context.filename.split(".").pop()
    return {
      Program() {
        const lines = context.sourceCode.lines
        lines.forEach((line, i) => {
          const t = line.trim()
          if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return
          const allowed = new Set([lines[i - 1] ?? "", line].flatMap((l) => [.../corpus-allow\s+([\w-]+)\s*:\s*\S.{5,}/.exec(l) ?? []].slice(1)))
          for (const r of rules) {
            if (allowed.has(r.id)) continue
            const m = r.test(line, ext)
            if (m) context.report({ loc: { line: i + 1, column: m.index ?? 0 }, message: `[${r.id}] ${typeof r.msg === "function" ? r.msg(m) : r.msg}` })
          }
        })
      },
    }
  },
}

export default { meta: { name: "eslint-plugin-corpus" }, rules: { "design-system": designSystem } }
