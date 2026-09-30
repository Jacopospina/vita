import * as React from "react"

/**
 * useDragSelect — hold and SWING to browse. Press on a segmented control (Tabs, ContentSwitcher), then give a gentle
 * swing left or right: each swing moves exactly ONE item in that direction — effortless, no aiming, no distance to
 * cover. The next step needs a new swing: a brief pause or a swing the other way. Slow drift doesn't count
 * (unless it travels far). The indicator leans into the swing, then snaps. Mouse/pen only (touch scrolls; tap selects).
 *
 *   const drag = useDragSelect('[role="tab"]', (el) => activate(el), { activeSelector: '[data-state="active"]' })
 *   <div onPointerDown={drag.onPointerDown}>  … indicator: translateX(rect.x + drag.offset)
 */
/** A swing: this much movement… */
const SWING_PX = 12
/** …at at least this speed (px/ms ≈ 150px/s — gentle). */
const SWING_SPEED = 0.15
/** Slow drift still steps once it has travelled this far. */
const DRIFT_PX = 60
/** A pause this long ends the swing, so the next one can step again. */
const SETTLE_MS = 90
/** Lean into the swing (fraction of movement, capped), and resist a little past the ends. */
const LEAN = 0.4
const LEAN_MAX = 10
const RUBBER = 0.2
const RUBBER_MAX = 6

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

export function useDragSelect(itemSelector: string, pick: (item: HTMLElement) => void, { activeSelector }: { activeSelector?: string } = {}) {
  const [dragging, setDragging] = React.useState(false)
  const [offset, setOffset] = React.useState(0)
  // Latest pick callback, so a gesture bound at press time never uses stale state.
  const pickRef = React.useRef(pick)
  React.useEffect(() => {
    pickRef.current = pick
  }, [pick])

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || e.pointerType === "touch") return
      const root = e.currentTarget
      const items = () =>
        Array.from(root.querySelectorAll<HTMLElement>(itemSelector)).filter(
          (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-disabled") !== "true" && !el.hasAttribute("data-disabled"),
        )
      const list = items()
      // Start from the item pressed (it becomes selected), else from the active one.
      const pressed = list.findIndex((el) => el.contains(e.target as Node))
      const active = activeSelector ? list.findIndex((el) => el.matches(activeSelector)) : -1
      let cur = pressed >= 0 ? pressed : Math.max(0, active)
      if (pressed >= 0) pickRef.current(list[pressed])

      let lastX = e.clientX
      let lastT = performance.now()
      let velocity = 0 // px/ms, smoothed
      let swing = 0 // movement in the current swing
      let spent = false // this swing already stepped
      let spentDir = 0
      let settle = 0
      setDragging(true)

      const move = (ev: PointerEvent) => {
        const now = performance.now()
        const delta = ev.clientX - lastX
        const dt = Math.max(1, now - lastT)
        lastX = ev.clientX
        lastT = now
        velocity = velocity * 0.5 + (Math.abs(delta) / dt) * 0.5
        if (delta === 0) return
        const dir = Math.sign(delta)

        // A pause ends the swing; so does swinging the other way.
        window.clearTimeout(settle)
        settle = window.setTimeout(() => {
          spent = false
          swing = 0
          setOffset(0)
        }, SETTLE_MS)
        if (spent && dir !== spentDir) {
          spent = false
          swing = 0
        }
        if (spent) return

        if (Math.sign(swing) !== dir) swing = 0
        swing += delta
        const all = items()
        const next = cur + dir
        const atEnd = next < 0 || next >= all.length
        if (!atEnd && ((Math.abs(swing) >= SWING_PX && velocity >= SWING_SPEED) || Math.abs(swing) >= DRIFT_PX)) {
          cur = next
          pickRef.current(all[next])
          spent = true
          spentDir = dir
          swing = 0
          setOffset(0)
          return
        }
        setOffset(atEnd ? clamp(swing * RUBBER, RUBBER_MAX) : clamp(swing * LEAN, LEAN_MAX))
      }
      const up = () => {
        window.clearTimeout(settle)
        setDragging(false)
        setOffset(0)
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", up)
        window.removeEventListener("pointercancel", up)
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", up)
      window.addEventListener("pointercancel", up)
    },
    [itemSelector, activeSelector],
  )

  return { onPointerDown, dragging, offset }
}
