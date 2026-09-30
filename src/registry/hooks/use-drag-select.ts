import * as React from "react"

/**
 * useDragSelect — hold and nudge to browse. Press on a segmented control (Tabs, ContentSwitcher), then just HINT a
 * direction: every ~20px of horizontal movement snaps to the next or previous item — no aiming at targets.
 * The selection indicator follows the pointer live (`offset`, damped) so movement and position always agree;
 * past the first/last item it rubber-bands. Mouse/pen only (on touch the row may scroll; a tap selects).
 *
 *   const drag = useDragSelect('[role="tab"]', (el) => activate(el), { activeSelector: '[data-state="active"]' })
 *   <div onPointerDown={drag.onPointerDown}>  … indicator: translateX(rect.x + drag.offset)
 */
const STEP_PX = 20
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
      let anchor = e.clientX
      setDragging(true)

      const move = (ev: PointerEvent) => {
        const all = items()
        let dx = ev.clientX - anchor
        // Step as many times as the movement covers; carry the remainder so continuous motion steps evenly.
        while (Math.abs(dx) >= step) {
          const dir = Math.sign(dx)
          const next = cur + dir
          if (next < 0 || next >= all.length) break
          cur = next
          pickRef.current(all[next])
          anchor += dir * step
          dx -= dir * step
        }
        const atEnd = (dx < 0 && cur === 0) || (dx > 0 && cur === all.length - 1)
        setOffset(atEnd ? dx * RUBBER : dx * LEAN)
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
