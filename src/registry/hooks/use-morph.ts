import * as React from "react"
import { flushSync } from "react-dom"

type VTDocument = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

/**
 * morph — apply a state change as a MORPH instead of a snap (View Transitions API).
 * Elements with a `view-transition-name` glide from their old position/size to the new one.
 *   kind "element" (default): only named elements move; the rest of the page updates in place.
 *   kind "page": the whole view transitions expressively (navigation).
 * Falls back to an instant update when unsupported or when the user prefers reduced motion.
 */
export function morph(update: () => void, { kind = "element" }: { kind?: "element" | "page" } = {}) {
  const d = document as VTDocument
  if (!d.startViewTransition || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return update()
  const root = document.documentElement
  if (kind === "page") root.dataset.morph = "page"
  const vt = d.startViewTransition(() => flushSync(update))
  vt.finished.finally(() => delete root.dataset.morph)
}

/** A stable, CSS-safe prefix for view-transition-name values. */
export function useMorphId() {
  return "m" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
}

/**
 * useIndicator — measures the active child (by selector) so a single indicator can SLIDE between options
 * (tabs underline, segmented-control pill) instead of jumping.
 */
export function useIndicator<T extends HTMLElement>(selector: string) {
  const ref = React.useRef<T>(null)
  const [rect, setRect] = React.useState<{ x: number; y: number; w: number; h: number } | null>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const a = el.querySelector<HTMLElement>(selector)
      setRect(a ? { x: a.offsetLeft, y: a.offsetTop, w: a.offsetWidth, h: a.offsetHeight } : null)
    }
    const raf = requestAnimationFrame(measure)
    const mo = new MutationObserver(measure)
    mo.observe(el, { attributes: true, subtree: true, attributeFilter: ["data-state", "aria-selected"] })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      ro.disconnect()
    }
  }, [selector])
  return [ref, rect] as const
}
