import * as React from "react"

/**
 * useExit, play an exit before something disappears. Nothing in Vita vanishes instantly.
 *   const [leaving, exit] = useExit()
 *   <div className={leaving ? "animate-exit-scale" : undefined}> … onClick={() => exit(onDismiss)}
 */
export function useExit(ms = 150) {
  const [leaving, setLeaving] = React.useState(false)
  const exit = React.useCallback(
    (done: () => void) => {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return done()
      setLeaving(true)
      window.setTimeout(() => {
        // done() FIRST: the parent's removal and our reset commit in the same batch, so the element
        // never renders one more visible frame (exit keyframes also hold their end state: fill "both").
        done()
        setLeaving(false)
      }, ms)
    },
    [ms],
  )
  return [leaving, exit] as const
}

/**
 * collapseOut, the space an inline item leaves closes as it goes: its width, padding, border and the gap after it
 * glide to zero, so neighbours (a search field that fills the row, the next chip) move with it instead of snapping
 * once it unmounts. Pair with useExit and the same duration: const undo = collapseOut(el, ms); exit(() => { onDismiss(); undo?.() }).
 */
export function collapseOut(el: HTMLElement | null, ms = 220): (() => void) | undefined {
  if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  const parent = el.parentElement ? getComputedStyle(el.parentElement) : null
  const gap = parent && /flex|grid/.test(parent.display) ? parseFloat(parent.columnGap) || 0 : 0
  const cs = getComputedStyle(el)
  const overflow = el.style.overflow
  el.style.overflow = "hidden"
  const anim = el.animate(
    [
      { width: `${el.getBoundingClientRect().width}px`, minWidth: "0px", paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, borderLeftWidth: cs.borderLeftWidth, borderRightWidth: cs.borderRightWidth, marginRight: cs.marginRight },
      { width: "0px", minWidth: "0px", paddingLeft: "0px", paddingRight: "0px", borderLeftWidth: "0px", borderRightWidth: "0px", marginRight: `${-gap}px` },
    ],
    { duration: ms, easing: "cubic-bezier(0.2, 0, 0.38, 0.9)", fill: "forwards" },
  )
  // Restore: for when the item turns out to stay (the parent kept it). Unmounted, it's a no-op.
  return () => { anim.cancel(); el.style.overflow = overflow }
}
