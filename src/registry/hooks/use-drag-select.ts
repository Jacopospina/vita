import * as React from "react"

/**
 * useDragSelect — hold and nudge to browse. Press on a segmented control (Tabs, ContentSwitcher), then just HINT a
 * direction: every deliberate horizontal nudge (≈48px) snaps to the next or previous item — no aiming at targets.
 * Each step re-anchors, so keep nudging to keep stepping. Mouse/pen only (on touch the row may scroll; tap selects).
 *
 *   const drag = useDragSelect('[role="tab"]', (el) => activate(el))
 *   <div onPointerDown={drag.onPointerDown}>
 */
/** Distance of one deliberate nudge. */
const STEP_PX = 48
/** Minimum time between steps, so one quick flick never skips several items. */
const STEP_COOLDOWN_MS = 180

export function useDragSelect(itemSelector: string, pick: (item: HTMLElement) => void, { step = STEP_PX, activeSelector }: { step?: number; activeSelector?: string } = {}) {
  const [dragging, setDragging] = React.useState(false)
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
      let lastStep = 0
      setDragging(true)

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - anchor
        if (Math.abs(dx) < step) return
        const now = performance.now()
        if (now - lastStep < STEP_COOLDOWN_MS) {
          anchor = ev.clientX // movement during the cooldown doesn't bank a step
          return
        }
        lastStep = now
        const all = items()
        const next = cur + Math.sign(dx)
        anchor = ev.clientX // re-anchor: another nudge = another step
        if (next < 0 || next >= all.length) return
        cur = next
        pickRef.current(all[next])
      }
      const up = () => {
        setDragging(false)
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

  return { onPointerDown, dragging }
}
