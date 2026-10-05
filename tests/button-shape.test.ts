import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { keepShape } from "@/registry/ui/button"

// A button's corners are Vita's squircle, everywhere (docs/components/button.md, "Shape"). Nothing passes a corner
// class to a Button or IconButton: the Button drops it, and this test keeps the source from trying.
const SHAPE = /\brounded(?:-[\w.[\]()%+-]+)?\b|corner-shape|--vita-squircle-r/

describe("button shape", () => {
  it("drops corner classes and keeps the rest", () => {
    expect(keepShape("size-8 rounded-inner-2 px-0 [corner-shape:round] hover:rounded-full")).toBe("size-8 px-0")
    expect(keepShape("w-full text-primary")).toBe("w-full text-primary")
  })

  it("no Button or IconButton in the source overrides its corners", () => {
    const files = execSync("git ls-files src", { encoding: "utf8" }).split("\n").filter((f) => f.endsWith(".tsx"))
    const offenders: string[] = []
    for (const f of files) {
      const src = readFileSync(f, "utf8")
      for (const m of src.matchAll(/<(?:Icon)?Button\b/g)) {
        // The element's own props: up to the end of its opening tag.
        const tag = src.slice(m.index, m.index + 800).split(/\/>|>\s*\n|>\{|>[A-Za-z]/)[0]
        const classes = [...tag.matchAll(/className=(?:"([^"]*)"|\{([^}]*)\})/g)].map((c) => c[1] ?? c[2]).join(" ")
        if (SHAPE.test(classes)) offenders.push(`${f}:${src.slice(0, m.index).split("\n").length}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
