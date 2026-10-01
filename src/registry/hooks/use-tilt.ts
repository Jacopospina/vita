import type * as React from "react"

/**
 * useTilt, the "lift" hover: the element tilts toward the pointer in perspective, lifts slightly,
 * and a specular glare follows the cursor. Mouse only; disabled under reduced motion.
 * Pair with the `tilt` utility on the element. Returns handlers to spread (they chain yours).
 */
export function useTilt<T extends HTMLElement>(
  { max = 10, lift = 1.04 }: { max?: number; lift?: number } = {},
  handlers: { onPointerMove?: React.PointerEventHandler<T>; onPointerLeave?: React.PointerEventHandler<T> } = {},
) {
  const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  return {
    onPointerMove: (e: React.PointerEvent<T>) => {
      handlers.onPointerMove?.(e)
      if (e.pointerType !== "mouse" || reduced()) return
      const el = e.currentTarget
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.setProperty("--vita-tilt-x", `${((0.5 - py) * max).toFixed(2)}deg`)
      el.style.setProperty("--vita-tilt-y", `${((px - 0.5) * max).toFixed(2)}deg`)
      el.style.setProperty("--vita-tilt-s", String(lift))
      el.style.setProperty("--vita-glare-x", `${(px * 100).toFixed(1)}%`)
      el.style.setProperty("--vita-glare-y", `${(py * 100).toFixed(1)}%`)
      el.style.setProperty("--vita-glare-o", "1")
    },
    onPointerLeave: (e: React.PointerEvent<T>) => {
      handlers.onPointerLeave?.(e)
      const el = e.currentTarget
      for (const p of ["--vita-tilt-x", "--vita-tilt-y", "--vita-tilt-s", "--vita-glare-o"]) el.style.removeProperty(p)
    },
  }
}
