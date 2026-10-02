import { describe, it, expect, afterEach, vi } from "vitest"
import { render, cleanup, act } from "@testing-library/react"
import { ScrambleText } from "@/registry/ui/scramble-text"
import { Kpi } from "@/registry/ui/kpi"

describe("ScrambleText: text on its way", () => {
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it("renders plain text when the text is there on mount (static content never animates)", () => {
    const { container } = render(<ScrambleText text="Support triage" />)
    expect(container.textContent).toBe("Support triage")
    expect(container.querySelector("[aria-busy]")).toBeNull()
  })

  it("is busy while loading, announces its label once, and holds the placeholder length", () => {
    const { container } = render(<ScrambleText length={8} label="Loading name" />)
    const busy = container.querySelector("[aria-busy=true]")!
    expect(busy).not.toBeNull()
    expect(busy.querySelector(".sr-only")?.textContent).toBe("Loading name")
    expect(busy.querySelector("[aria-hidden]")?.textContent).toHaveLength(8)
  })

  it("only ever shows glyphs from its charset while loading", () => {
    const { container } = render(<ScrambleText length={12} charset="digits" />)
    expect(container.querySelector("[aria-hidden]")?.textContent).toMatch(/^\d{12}$/)
  })

  it("settles into exactly the real text once it arrives", () => {
    vi.useFakeTimers()
    const { container, rerender } = render(<ScrambleText length={6} />)
    rerender(<ScrambleText length={6} text="12,840" />)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(container.textContent).toBe("12,840")
    expect(container.querySelector("[aria-busy]")).toBeNull()
  })
})

describe("Kpi loading scrambles, never a grey bar", () => {
  afterEach(cleanup)
  it("shows a busy scramble in place of the value, and no skeleton", () => {
    const { container } = render(<Kpi label="Runs today" value={12840} delta={0.12} period="vs yesterday" loading />)
    expect(container.querySelectorAll("[aria-busy=true]").length).toBeGreaterThanOrEqual(1)
    expect(container.querySelector(".animate-shimmer")).toBeNull()
  })
})
