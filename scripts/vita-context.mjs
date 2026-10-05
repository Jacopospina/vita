#!/usr/bin/env node
/**
 * vita-context, keeps the context agents work from healthy (docs/getting-started/skills.md, "Three kinds of context").
 *
 *   · global fits in one sitting: AGENTS.md, the consumer rules and the Architect non-negotiables stay under a cap
 *   · one rule, one home: the same rule, word for word, in two global files or skills fails
 *   · no dead references: a path a rule points at (docs/…, scripts/…, src/…, skills/…, templates/…, .vita/…) exists
 *
 * Exits 1 on any problem, so `pnpm check` fails before the context turns into a junk drawer.
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const read = (f) => fs.readFileSync(path.join(root, f), "utf8")
const skills = fs.readdirSync(path.join(root, "skills")).filter((d) => fs.existsSync(path.join(root, "skills", d, "SKILL.md"))).map((d) => `skills/${d}/SKILL.md`)
const files = ["AGENTS.md", "templates/AGENTS.consumer.md", ...skills]
const problems = []

// 1. Global fits in one sitting.
const CAPS = { "AGENTS.md": 80, "templates/AGENTS.consumer.md": 50 }
for (const [f, cap] of Object.entries(CAPS)) {
  const n = read(f).split("\n").length
  if (n > cap) problems.push(`${f}: ${n} lines, over the ${cap}-line cap for global context. Move detail into a local doc.`)
}
for (const f of skills) {
  const n = read(f).split("\n").length
  if (n > 160) problems.push(`${f}: ${n} lines, over the 160-line cap for a skill. Move detail into the docs it links to.`)
}
const architect = read("skills/vita-architect/SKILL.md")
const nn = architect.split("## Non-negotiables")[1]?.split("\n## ")[0] ?? ""
const rules = nn.split("\n").filter((l) => /^\d+\.\s/.test(l)).length
if (rules > 15) problems.push(`skills/vita-architect/SKILL.md: ${rules} non-negotiables, over the cap of 15. Fold or move some into local docs.`)

// 2. One rule, one home: a rule bullet (**Title.** text) repeated word for word across files.
const seen = new Map()
const norm = (s) => s.toLowerCase().replace(/[`*_]/g, "").replace(/\s+/g, " ").trim()
for (const f of files) {
  for (const line of read(f).split("\n")) {
    const m = /^\s*(?:[-*]|\d+\.)\s+\*\*(.+?)\*\*\s*(.+)$/.exec(line)
    if (!m || m[2].length < 30) continue
    const key = norm(m[1] + " " + m[2])
    const where = seen.get(key)
    if (where && where !== f) problems.push(`"${m[1]}" is written in both ${where} and ${f}. Keep it in one place and link to it from the other.`)
    else seen.set(key, f)
  }
}

// 3. No dead references.
const MAP = [[".vita/docs/", "docs/"], [".vita/scripts/", "scripts/"], [".vita/templates/", "templates/"], [".claude/skills/", "skills/"]]
for (const f of [...files, ...walk("docs").filter((d) => d.endsWith(".md"))]) {
  for (const m of read(f).matchAll(/`([.\w/-]+\.(?:md|mjs|ts|tsx|css|json))`/g)) {
    let p = m[1]
    if (/[*<>]/.test(p) || p.startsWith("vita/") || p.startsWith("src/components/vita") || p.startsWith("src/styles/vita/")) continue
    for (const [from, to] of MAP) if (p.startsWith(from)) p = to + p.slice(from.length)
    if (!/^(docs|scripts|src|skills|templates)\//.test(p)) continue
    if (!fs.existsSync(path.join(root, p))) problems.push(`${f}: points at \`${m[1]}\`, which doesn't exist.`)
  }
}

function walk(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))
}

if (problems.length) {
  console.error(problems.map((p) => `  ${p}`).join("\n"))
  console.error(`\n✗ vita-context: ${problems.length} problem(s). Context agents read must stay small, single-sourced and true.`)
  process.exit(1)
}
console.log(`✓ vita-context: ${files.length} global and skill files, one home per rule, no dead references`)
