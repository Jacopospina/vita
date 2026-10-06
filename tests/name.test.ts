import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

// The design system is Vita. Its former name never appears: not in code, docs, comments or generated files.
const OLD = new RegExp(["c", "orpus"].join(""), "i")

describe("name", () => {
  it("only ever says Vita", () => {
    const files = execSync("git ls-files", { encoding: "utf8" })
      .split("\n")
      .filter((f) => f && !/\.(png|jpe?g|gif|mp4|webm|ico|woff2?)$/.test(f) && !f.includes("pnpm-lock"))
    expect(files.filter((f) => OLD.test(f) || (() => { try { return OLD.test(readFileSync(f, "utf8")) } catch { return false } })())).toEqual([])
  })
})
