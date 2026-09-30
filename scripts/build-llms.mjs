#!/usr/bin/env node
/**
 * Builds the agent-facing catalog from docs frontmatter:
 *   docs/index.json  — machine-readable (slug, section, title, summary, import, use_when, avoid_when, related)
 *   llms.txt         — compact overview agents load first
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const sections = ["foundations", "components", "patterns"]

function parse(src) {
  const m = /^---\n([\s\S]*?)\n---/.exec(src)
  const meta = {}
  if (!m) return meta
  let key = null
  for (const line of m[1].split("\n")) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && key) { meta[key].push(item[1]); continue }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const [, k, v] = kv
    if (v === "") { key = k; meta[k] = [] }
    else if (v.startsWith("[")) { meta[k] = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean); key = null }
    else { try { meta[k] = v.startsWith('"') ? JSON.parse(v) : v } catch { meta[k] = v } key = null }
  }
  return meta
}

const entries = []
for (const section of sections) {
  const dir = path.join(root, "docs", section)
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const meta = parse(fs.readFileSync(path.join(dir, f), "utf8"))
    entries.push({ section, slug: f.replace(/\.md$/, ""), path: `docs/${section}/${f}`, ...meta })
  }
}
fs.writeFileSync(path.join(root, "docs/index.json"), JSON.stringify({ name: "Corpus", generated: new Date().toISOString().slice(0, 10), entries }, null, 2) + "\n")

const lines = [
  "# Corpus design system",
  "",
  "> Corpus is the body of the product: the only source of UI. Components are imported from @/components/corpus/*, tokens are Tailwind utilities, patterns are documented flows. Never create local components or raw values.",
  "",
  "Start with: docs/components/choosing-components.md (decision guide) · docs/foundations/principles.md · skills/corpus-design-system/SKILL.md",
  "",
]
for (const section of sections) {
  lines.push(`## ${section[0].toUpperCase()}${section.slice(1)}`, "")
  for (const e of entries.filter((x) => x.section === section)) {
    lines.push(`- [${e.title ?? e.slug}](${e.path}): ${e.summary ?? ""}`)
    if (e.use_when?.length) lines.push(`  - use: ${e.use_when.join("; ")}`)
    if (e.avoid_when?.length) lines.push(`  - avoid: ${e.avoid_when.join("; ")}`)
  }
  lines.push("")
}
fs.writeFileSync(path.join(root, "llms.txt"), lines.join("\n"))
console.log(`✓ ${entries.length} docs → docs/index.json, llms.txt`)
