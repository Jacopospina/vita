import * as React from "react"

/**
 * useHoldToPick, a phone's way through a list of options: hold the field, the list opens; keep the thumb down and
 * slide, the option under it highlights as the thumb passes; lift, and that option is chosen and the list closes.
 * A plain tap opens the list as before. Touch only: with a mouse the list already does this natively
 * (press, drag, release).
 *
 * The trigger keeps the pointer (capture), so the options are found under the thumb (elementFromPoint) and
 * highlighted the way the list highlights them itself: by focus. Near the list's top or bottom edge, it scrolls.
 *
 *   const hold = useHoldToPick({ open: () => setOpen(true) })
 *   <Trigger {...hold} />   (spreads onPointerDown / onPointerMove / onPointerUp / onPointerCancel / onClick)
 */
/** Holding this long opens the list; a tap ends sooner. */
const HOLD_MS = 220
/** Moving this far before the hold is a scroll, not a hold. */
const SLOP = 8
/** Within this distance of the list's top or bottom edge the list scrolls under the thumb. */
const EDGE = 28

export function useHoldToPick({ open, item = '[data-radix-select-viewport] [role="option"]' }: { open: () => void; item?: string }) {
  const state = React.useRef<{ id: number; x: number; y: number; timer: number; held: boolean; last: Element | null } | null>(null)
  const swallow = React.useRef(false)

  const optionAt = (x: number, y: number) => document.elementFromPoint(x, y)?.closest<HTMLElement>(`${item}:not([data-disabled]):not([aria-disabled="true"])`) ?? null

  const finish = (trigger: HTMLElement) => {
    const s = state.current
    if (!s) return
    window.clearTimeout(s.timer)
    if (s.held) {
      try { trigger.releasePointerCapture(s.id) } catch { /* already released */ }
    }
    state.current = null
  }

  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "touch" || e.button !== 0) return
      const trigger = e.currentTarget
      const id = e.pointerId
      const timer = window.setTimeout(() => {
        const s = state.current
        if (!s || s.id !== id) return
        s.held = true
        swallow.current = true // the tap's click would open the list again after the pick
        try { trigger.setPointerCapture(id) } catch { /* the pointer may already be gone */ }
        open()
      }, HOLD_MS)
      state.current = { id, x: e.clientX, y: e.clientY, timer, held: false, last: null }
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const s = state.current
      if (!s || s.id !== e.pointerId) return
      if (!s.held) {
        if (Math.abs(e.clientX - s.x) > SLOP || Math.abs(e.clientY - s.y) > SLOP) finish(e.currentTarget)
        return
      }
      const el = optionAt(e.clientX, e.clientY)
      if (el && el !== s.last) {
        s.last = el
        el.focus({ preventScroll: true })
      }
      // The list scrolls when the thumb reaches its edge.
      const list = (el ?? s.last)?.closest<HTMLElement>('[role="listbox"], [data-radix-select-viewport]')
      const box = list?.closest<HTMLElement>("[data-radix-select-viewport]") ?? list
      if (box) {
        const r = box.getBoundingClientRect()
        if (e.clientY < r.top + EDGE) box.scrollTop -= 6
        else if (e.clientY > r.bottom - EDGE) box.scrollTop += 6
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const s = state.current
      if (!s || s.id !== e.pointerId) return
      const held = s.held
      finish(e.currentTarget)
      if (!held) return
      // Lifted on an option: that's the choice. Lifted elsewhere: the list stays open, as after a tap.
      const el = optionAt(e.clientX, e.clientY)
      if (el) el.click()
      else swallow.current = false
    },
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => finish(e.currentTarget),
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (!swallow.current) return
      swallow.current = false
      e.preventDefault()
    },
  }
}
