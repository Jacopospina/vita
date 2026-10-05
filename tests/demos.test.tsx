import { describe, it, expect, afterEach, vi } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { demos } from "@/playground/demos"
import { manifest } from "@/playground/manifest"
import { getDoc } from "@/playground/docs"
import { TooltipProvider } from "@/registry/ui/tooltip"

afterEach(cleanup)

describe("every Vita page is documented", () => {
  for (const [section, entries] of Object.entries(manifest))
    for (const e of entries)
      it(`${section}/${e.slug} has docs with a summary`, () => {
        const doc = getDoc(section, e.slug)
        expect(doc, `docs/${section}/${e.slug}.md`).toBeTruthy()
        expect(doc!.meta.summary).toBeTruthy()
      })
})

// A Button that was handed a corner class says so (keepShape): no demo may trigger it.
const shapeWarnings: string[] = []
const warn = console.warn
vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
  if (String(args[0]).startsWith("Vita Button:")) shapeWarnings.push(String(args[0]))
  else warn(...args)
})

describe("every demo renders", () => {
  for (const [key, list] of Object.entries(demos))
    for (const d of list)
      it(`${key}, ${d.title}`, () => {
        const { container } = render(<TooltipProvider>{d.render()}</TooltipProvider>)
        expect(container.innerHTML.length).toBeGreaterThan(0)
      })
})

describe("buttons keep their squircle", () => {
  it("no demo passes a corner class to a Button", () => {
    expect(shapeWarnings).toEqual([])
  })
})
