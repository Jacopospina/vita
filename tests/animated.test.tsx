import { describe, it, expect, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import { AnimatedText } from "@/registry/ui/animated"

// A rolling value renders one 10-digit reel per digit; a letter reveal renders none.
const reels = (el: HTMLElement) => el.querySelectorAll(".flex-col").length

describe("text choreography: numbers always roll", () => {
  afterEach(cleanup)

  it("rolls formatted numeric values (slider, meters)", () => {
    for (const v of ["$1,200", "40%", "20 – 80", "1.2k"]) {
      const { container } = render(<AnimatedText>{v}</AnimatedText>)
      expect(reels(container), v).toBe(v.replace(/\D/g, "").length)
      cleanup()
    }
  })

  it("rolls when only the digits of a label change", () => {
    const { container, rerender } = render(<AnimatedText>3 agents</AnimatedText>)
    rerender(<AnimatedText>12 agents</AnimatedText>)
    expect(reels(container)).toBe(2)
  })

  it("keeps sentences that contain numbers as normal wrapping text", () => {
    const { container } = render(<AnimatedText>Your refund for order 4821 arrives in 3–5 working days.</AnimatedText>)
    expect(reels(container)).toBe(0)
    expect(container.querySelector(".whitespace-pre")).toBeNull()
  })

  it("letter-reveals real text changes", () => {
    const { container, rerender } = render(<AnimatedText>Saving</AnimatedText>)
    rerender(<AnimatedText>Saved</AnimatedText>)
    expect(reels(container)).toBe(0)
  })
})
