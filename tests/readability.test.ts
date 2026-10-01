import { readFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { marked, type Token } from "marked"
import { describe, expect, it } from "vitest"

// Vita writes for the scan: people read the first lines and the start of each heading, then skim down the left.
// Docs paragraphs stay at two sentences or fewer; anything longer becomes a list of cards.
const sentences = (t: string) => (t.replace(/`[^`]*`/g, "x").replace(/\b(e\.g|i\.e|etc|vs)\./g, "$1").match(/[.!?](\s|$)/g) ?? []).length

function paragraphs(tokens: Token[]): string[] {
  const out: string[] = []
  for (const t of tokens) {
    if (t.type === "paragraph") out.push(t.text)
    // Paragraphs inside alerts and lists are cards with their own rules; only top-level prose counts.
  }
  return out
}

describe("readability", () => {
  it("keeps every docs paragraph to two sentences or fewer", () => {
    const files = execSync("git ls-files docs", { encoding: "utf8" }).split("\n").filter((f) => f.endsWith(".md"))
    const long: string[] = []
    for (const f of files) {
      const body = readFileSync(f, "utf8").replace(/^---[\s\S]*?---/, "")
      for (const p of paragraphs(marked.lexer(body))) if (sentences(p) > 2) long.push(`${f}: ${p.slice(0, 60)}`)
    }
    expect(long).toEqual([])
  })
})
