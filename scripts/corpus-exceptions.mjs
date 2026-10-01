#!/usr/bin/env node
/**
 * pnpm exceptions — every approved deviation (`// corpus-allow <rule>: <why> — approved by @<owner>`) in one list,
 * with its age from git blame, for regular review (docs/decisions/how-we-decide.md). The same rule allowed in
 * three or more places is flagged as a system gap to promote.
 *   pnpm exceptions [--json] [dir…]   (default: src)
 */
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const args = process.argv.slice(2)
const asJson = args.includes("--json")
const roots = args.filter((a) => !a.startsWith("--"))
const cwd = process.cwd()
const files = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx?|jsx?|css|mdx?)$/.test(e.name)) files.push(p)
  }
}
for (const r of roots.length ? roots : ["src"]) if (fs.existsSync(r)) walk(path.resolve(cwd, r))

const blameDate = (file, line) => {
  try {
    const out = execFileSync("git", ["blame", "-L", `${line},${line}`, "--porcelain", file], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    const t = /^author-time (\d+)/m.exec(out)
    return t ? new Date(Number(t[1]) * 1000) : null
  } catch {
    return null
  }
}

const found = []
for (const file of files) {
  fs.readFileSync(file, "utf8").split("\n").forEach((l, i) => {
    const m = /corpus-allow\s+([\w-]+)\s*:\s*(.+?)(?:\s+—\s+approved by\s+(@\S+))?\s*(?:\*\/)?$/.exec(l)
    if (!m) return
    const date = blameDate(file, i + 1)
    found.push({ rule: m[1], reason: m[2].trim(), approver: m[3] ?? null, file: path.relative(cwd, file), line: i + 1, date: date?.toISOString().slice(0, 10) ?? "uncommitted", ageDays: date ? Math.floor((Date.now() - date) / 864e5) : 0 })
  })
}
const byRule = Object.groupBy ? Object.groupBy(found, (e) => e.rule) : found.reduce((a, e) => ((a[e.rule] ??= []).push(e), a), {})
const gaps = Object.entries(byRule).filter(([, list]) => new Set(list.map((e) => e.file)).size >= 3).map(([rule, list]) => ({ rule, count: list.length }))

if (asJson) {
  console.log(JSON.stringify({ exceptions: found, promote: gaps }, null, 2))
} else if (!found.length) {
  console.log("✓ corpus-exceptions: no approved deviations")
} else {
  console.log(`corpus-exceptions: ${found.length} approved deviation(s)\n`)
  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`${rule} (${list.length})`)
    for (const e of list) console.log(`  ${e.file}:${e.line}  ${e.date} (${e.ageDays}d)  ${e.approver ?? "⚠ no approver"}  ${e.reason}`)
  }
  for (const g of gaps) console.log(`\n▲ Promote? "${g.rule}" is allowed in ${g.count} places across 3+ files — likely a system gap.`)
}
