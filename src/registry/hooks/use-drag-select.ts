import * as React from "react"

/**
 * useDragSelect — hold and nudge to browse. Press on a segmented control (Tabs, ContentSwitcher), then just HINT a
 * direction and it snaps to the next or previous item — no aiming at targets. Movement is ACCELERATED like the
 * system cursor: slow, careful movement counts for less (a longer move per item), a quick swipe counts for more.
 * The selection indicator follows the pointer live (`offset`, damped) so movement and position always agree;
 * past the first/last item it rubber-bands. Mouse/pen only (on touch the row may scroll; a tap selects).
 *
 *   const drag = useDragSelect('[role="tab"]', (el) => activate(el), { activeSelector: '[data-state="active"]' })
 *   <div onPointerDown={drag.onPointerDown}>  … indicator: translateX(rect.x + drag.offset)
 */
/** Accelerated distance per item. */
const STEP_PX = 64
/** Acceleration curve: gain = clamp(MIN + velocity(px/ms) × SLOPE, MIN, MAX). ~0.1 px/ms → ×0.7; ~1 px/ms → ×1.9. */
const GAIN_MIN = 0.6
const GAIN_MAX = 2.4
const GAIN_SLOPE = 1.3
/** How much of the in-between movement the indicator shows (lean toward the next item). */
const LEAN = 0.5
/** Past the ends, the indicator gives a little, then resists. */
const RUBBER = 0.2

export function useDragSelect(itemSelector: string, pick: (item: HTMLElement) => void, { step = STEP_PX, activeSelector }: { step?: number; activeSelector?: string } = {}) {
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
      let dx = 0 // accelerated distance travelled since the last step
      setDragging(true)

      const move = (ev: PointerEvent) => {
        const all = items()
        const now = performance.now()
        const delta = ev.clientX - lastX
        const dt = Math.max(1, now - lastT)
        velocity = velocity * 0.7 + (Math.abs(delta) / dt) * 0.3
        lastX = ev.clientX
        lastT = now
        const gain = Math.min(GAIN_MAX, Math.max(GAIN_MIN, GAIN_MIN + velocity * GAIN_SLOPE))
        dx += delta * gain
        // Step as many times as the (accelerated) movement covers; carry the remainder so motion steps evenly.
        while (Math.abs(dx) >= step) {
          const dir = Math.sign(dx)
          const next = cur + dir
          if (next < 0 || next >= all.length) {
            dx = dir * Math.min(Math.abs(dx), step) // don't bank distance against the end
            break
          }
          cur = next
          pickRef.current(all[next])
          dx -= dir * step
        }
        const atEnd = (dx < 0 && cur === 0) || (dx > 0 && cur === all.length - 1)
        setOffset(atEnd ? dx * RUBBER : dx * LEAN * 0.6)
      }
      const up = () => {
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
    [itemSelector, step, activeSelector],
  )

  return { onPointerDown, dragging, offset }
}
