import { describe, it, expect } from "vitest"
import { spawnSync } from "node:child_process"

describe("corpus-audit", () => {
  const r = spawnSync(process.execPath, ["scripts/corpus-audit.mjs", "tests/fixtures", "--json"], { encoding: "utf8" })
  const out = JSON.parse(r.stdout) as { violations: { rule: string; line: number }[] }
  const rules = new Set(out.violations.map((v) => v.rule))

  it("fails the build on violations", () => expect(r.status).toBe(1))
  for (const rule of ["foreign-icons", "foreign-ui", "raw-color", "palette-color", "arbitrary-value", "type-size", "off-scale-spacing", "raw-shape", "raw-motion", "dark-variant", "inline-style", "raw-element", "taxonomy", "spinner"])
    it(`catches ${rule}`, () => expect(rules.has(rule)).toBe(true))
  it("honours a designer-approved corpus-allow with a reason", () => {
    expect(out.violations.some((v) => v.rule === "raw-element" && v.line === 9)).toBe(false)
  })
  it("passes the playground (dogfooding)", () => {
    expect(spawnSync(process.execPath, ["scripts/corpus-audit.mjs"], { encoding: "utf8" }).status).toBe(0)
  })
})
