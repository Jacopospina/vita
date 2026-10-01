import * as React from "react"

/**
 * useFlip — NOTHING JUMPS. When a container's children move because something appeared, disappeared
 * or changed size, each child glides from its old position to the new one (FLIP), productive motion.
 * Opt-in: lists that gain, lose or reorder items (Stack `flip`, chat, toasts, chips, filtered options). Static layout
 * never uses it — reflow from fonts or resizing must not move anything.
 */
export function useFlip<T extends HTMLElement>(ref: React.RefObject<T | null>, enabled = true) {
  React.useEffect(() => {
    const el = ref.current
    if (!el || !enabled || typeof window === "undefined") return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    const cache = new WeakMap<Element, { x: number; y: number }>()
    const kids = () => Array.from(el.children) as HTMLElement[]
    // Hidden (display:none, a closed panel, an inactive tab) → every child measures 0,0. Recording that would make
    // children "fly in from the top left" when it appears, so positions are only kept while the container is laid out.
    const visible = () => el.offsetParent !== null || getComputedStyle(el).position === "fixed"
    // Positions INSIDE the container. offsetTop is relative to the nearest positioned ancestor; when that isn't the
    // container, the container's own move would count too — and a parent FLIP compensates for it already (double jump).
    const pos = (c: HTMLElement) =>
      c.offsetParent === el || c.offsetParent !== el.offsetParent
        ? { x: c.offsetLeft, y: c.offsetTop }
        : { x: c.offsetLeft - el.offsetLeft, y: c.offsetTop - el.offsetTop }
    const snap = () => {
      if (!visible()) return kids().forEach((c) => cache.delete(c))
      kids().forEach((c) => cache.set(c, pos(c)))
    }

    // Runs in observer callbacks: after layout, before paint — so the jump is never seen.
    const settle = () => {
      // While the page boots (fonts, layout settling) children only get re-measured — nothing glides into place
      // from a pre-layout position. Same when the tab is hidden.
      if (document.documentElement.hasAttribute("data-corpus-booting") || document.visibilityState !== "visible" || !visible()) return snap()
      for (const c of kids()) {
        const prev = cache.get(c)
        if (!prev) continue
        const now = pos(c)
        const dx = prev.x - now.x
        const dy = prev.y - now.y
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          c.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], {
            duration: 240,
            easing: "cubic-bezier(0.2, 0, 0.38, 0.9)",
            composite: "add",
          })
        }
      }
      snap()
    }

    snap()
    const ro = new ResizeObserver(settle)
    const watch = () => {
      ro.disconnect()
      ro.observe(el)
      kids().forEach((c) => ro.observe(c))
    }
    watch()
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.type === "childList" && r.target === el)) watch()
      settle()
    })
    mo.observe(el, { childList: true, subtree: true, characterData: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [ref, enabled])
}
