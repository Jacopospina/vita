#!/usr/bin/env node
/**
 * vita-audit, enforces "the design system is the only source of UI".
 *
 *   node scripts/vita-audit.mjs [paths...]       (default: paths from vita.config.json → audit.include, else ./src)
 *   --json    machine-readable output (for agents / CI annotations)
 *
 * Escape hatch (designer-approved only), on the same line or the line above:
 *   // vita-allow raw-element: native <a> needed for download attr, approved by @designer 2026-09-30
 * An allow comment WITHOUT a reason after the colon is itself a violation.
 */
import fs from "node:fs"
import path from "node:path"
import { createRules } from "./vita-rules.mjs"

const cwd = process.cwd()
const args = process.argv.slice(2)
const asJson = args.includes("--json")
const cfgPath = path.join(cwd, "vita.config.json")
const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, "utf8")) : {}
const roots = args.filter((a) => !a.startsWith("--"))
const include = roots.length ? roots : (cfg.audit?.include ?? ["src"])
const exclude = [
  "node_modules", "dist", ".git",
  ...(cfg.audit?.exclude ?? ["src/components/vita", "src/registry", "src/styles"]),
].map((p) => path.normalize(p))

const EXT = new Set([".tsx", ".ts", ".jsx", ".js", ".css", ".vue", ".svelte"])
const ALIAS = cfg.componentsAlias ?? "@/components/vita"

/* ---------------- taxonomy (banned words) ---------------- */
let banned = []
const taxPath = path.join(cwd, cfg.taxonomy ?? "vita/taxonomy.json")
if (fs.existsSync(taxPath)) {
  try {
    const t = JSON.parse(fs.readFileSync(taxPath, "utf8"))
    banned = Object.entries(t.avoid ?? {}).map(([word, use]) => ({ word, use, re: new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i") }))
  } catch { /* invalid taxonomy: skip content checks */ }
}

const rules = createRules({ alias: ALIAS })

/* ---------------- scan ---------------- */
const files = []
function walk(p) {
  const rel = path.relative(cwd, p)
  if (exclude.some((e) => rel === e || rel.startsWith(e + path.sep))) return
  if (!fs.existsSync(p)) return
  const st = fs.statSync(p)
  if (st.isDirectory()) fs.readdirSync(p).forEach((f) => walk(path.join(p, f)))
  else if (EXT.has(path.extname(p)) && !/\.(test|spec|stories)\.[jt]sx?$/.test(p)) files.push(p)
}
include.forEach((r) => walk(path.resolve(cwd, r)))

const violations = []
const warnings = []
for (const file of files) {
  const ext = path.extname(file)
  const lines = fs.readFileSync(file, "utf8").split("\n")
  let inBlockComment = false
  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (inBlockComment) { if (trimmed.includes("*/")) inBlockComment = false; return }
    if (trimmed.startsWith("/*") && !trimmed.includes("*/")) { inBlockComment = true; return }
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
      const bad = /vita-allow\s+[\w-]+\s*(?::\s*)?$/.exec(trimmed)
      if (bad) violations.push({ file, line: i + 1, rule: "allow-without-reason", message: "vita-allow needs a reason and approver: `// vita-allow <rule>: <why>, approved by @designer`" })
      return
    }
    const allowed = new Set()
    for (const l of [lines[i - 1] ?? "", line]) {
      const m = /vita-allow\s+([\w-]+)\s*:\s*\S.{5,}/.exec(l)
      if (m) allowed.add(m[1])
    }
    for (const r of rules) {
      if (allowed.has(r.id)) continue
      const m = r.test(line, ext)
      if (m) (r.severity === "warn" ? warnings : violations).push({ file, line: i + 1, col: (m.index ?? 0) + 1, rule: r.id, match: m[0], message: typeof r.msg === "function" ? r.msg(m) : r.msg })
    }
    if (banned.length && (ext === ".tsx" || ext === ".jsx") && !allowed.has("taxonomy")) {
      const strings = [...line.matchAll(/>([^<>{}]+)</g), ...line.matchAll(/(?:label|title|placeholder|description|helperText|invalidText|subtitle|confirmLabel|aria-label)=["']([^"']+)["']/g)].map((x) => x[1])
      for (const s of strings) for (const b of banned) if (b.re.test(s)) violations.push({ file, line: i + 1, rule: "taxonomy", match: b.word, message: `Banned term "${b.word}", use "${b.use}" (vita/taxonomy.json).` })
    }
  })
}

if (asJson) {
  console.log(JSON.stringify({ files: files.length, violations: violations.map((v) => ({ ...v, file: path.relative(cwd, v.file) })), warnings: warnings.map((v) => ({ ...v, file: path.relative(cwd, v.file) })) }, null, 2))
} else if (violations.length === 0) {
  console.log(`✓ vita-audit: ${files.length} files, 0 violations`)
} else {
  const byFile = Object.groupBy ? Object.groupBy(violations, (v) => v.file) : violations.reduce((a, v) => ((a[v.file] ??= []).push(v), a), {})
  for (const [file, vs] of Object.entries(byFile)) {
    console.log(`\n${path.relative(cwd, file)}`)
    for (const v of vs) console.log(`  ${v.line}:${v.col ?? 1}  ${v.rule.padEnd(20)} ${v.match ? `"${v.match}"  ` : ""}${v.message}`)
  }
  console.log(`\n✗ vita-audit: ${violations.length} violation(s) in ${Object.keys(byFile).length} file(s). The design system is the only source of UI.`)
}
// Warnings (deprecations) are reported but never fail the build, until the version that removes them.
if (warnings.length && !asJson) {
  console.log(`\n⚠ vita-audit: ${warnings.length} deprecation warning(s)`)
  for (const w of warnings) console.log(`  ${path.relative(cwd, w.file)}:${w.line}  ${w.message}`)
}
process.exit(violations.length ? 1 : 0)
