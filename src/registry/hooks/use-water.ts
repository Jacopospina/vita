import type * as React from "react"

/**
 * useWater, a surface that answers like Sofia's water (docs/decisions/sofia-is-water.md). Pair with the `water`
 * utility on the element. Three moments, each a one-shot animation the stylesheet keys off a data attribute, removed
 * when it ends so nothing is ever cancelled mid-way (a cancelled animation snaps):
 *
 *   data-sway     the pointer lands on it (mouse only): the surface sways once
 *   data-splash   it is pressed: a ring of water spreads from the point of touch (--vita-splash-x/-y)
 *   data-wobble   it is released (or activated from the keyboard): it wobbles back, the way a drop settles
 *
 * Returns handlers to spread (they chain yours). Reduced motion: the stylesheet stills every animation.
 */
export function useWater<T extends HTMLElement>(
  handlers: {
    onPointerEnter?: React.PointerEventHandler<T>
    onPointerDown?: React.PointerEventHandler<T>
    onClick?: React.MouseEventHandler<T>
    onAnimationEnd?: React.AnimationEventHandler<T>
  } = {},
) {
  // Remove, reflow, add: the same attribute again restarts its animation (a quick second press still splashes).
  const play = (el: HTMLElement, attr: string) => {
    el.removeAttribute(attr)
    void el.offsetWidth
    el.setAttribute(attr, "")
  }
  const aim = (el: HTMLElement, e: React.PointerEvent<T> | null) => {
    if (!e) {
      el.style.removeProperty("--vita-splash-x")
      el.style.removeProperty("--vita-splash-y")
      return
    }
    const r = el.getBoundingClientRect()
    el.style.setProperty("--vita-splash-x", `${(((e.clientX - r.left) / Math.max(1, r.width)) * 100).toFixed(1)}%`)
    el.style.setProperty("--vita-splash-y", `${(((e.clientY - r.top) / Math.max(1, r.height)) * 100).toFixed(1)}%`)
  }
  return {
    onPointerEnter: (e: React.PointerEvent<T>) => {
      handlers.onPointerEnter?.(e)
      if (e.pointerType !== "mouse") return
      play(e.currentTarget, "data-sway")
    },
    onPointerDown: (e: React.PointerEvent<T>) => {
      handlers.onPointerDown?.(e)
      const el = e.currentTarget
      aim(el, e)
      play(el, "data-splash")
    },
    onClick: (e: React.MouseEvent<T>) => {
      handlers.onClick?.(e)
      const el = e.currentTarget
      // From the keyboard there was no press: the ring spreads from the centre instead.
      if (!el.hasAttribute("data-splash")) {
        aim(el, null)
        play(el, "data-splash")
      }
      play(el, "data-wobble")
    },
    onAnimationEnd: (e: React.AnimationEvent<T>) => {
      handlers.onAnimationEnd?.(e)
      if (e.target !== e.currentTarget) return
      const el = e.currentTarget
      if (e.animationName === "vita-sway") el.removeAttribute("data-sway")
      else if (e.animationName === "vita-splash") el.removeAttribute("data-splash")
      else if (e.animationName === "vita-wobble") el.removeAttribute("data-wobble")
    },
  }
}
