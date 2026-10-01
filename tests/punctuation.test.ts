import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// Vita never writes the em dash: not in docs, UI copy, comments or generated files. Use a comma, colon, full stop
// or parentheses instead. (Regexes that must still read old text spell it as an escape.)
const EM_DASH = String.fromCharCode(0x2014)

describe("punctuation", () => {
  it("has no em dashes anywhere in the repository", () => {
    const files = execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f && !/\.(png|jpe?g|ico|woff2?)$/.test(f) && !f.includes("pnpm-lock"))
    const offenders = files.filter((f) => {
      try {
        return readFileSync(f, "utf8").includes(EM_DASH)
      } catch {
        return false
      }
    })
    expect(offenders).toEqual([])
  })
})
