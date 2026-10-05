import * as React from "react"
import { Checkmark } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * Gotcha, the tiniest feedback: a small badge just right of the pointer ("Copied", "Saved", "Done") that follows it
 * for a moment and fades. It sits where the person is already looking, so a small, local action is acknowledged
 * without changing the control or interrupting the page.
 *
 *   gotcha("Copied")                     after a copy, a save, a quick toggle
 *   gotcha("Link copied", { icon: Link })
 *
 * Keyboard: it appears beside the focused control. Touch: just above and right of the tap, and it stays put.
 * Rendered by <Toaster />, so any app with notifications has it.
 * Use instead: a result the person must find later → toast; an error → the field's message or an InlineNotification;
 * a change of state the control itself shows (a toggle, a selected tab) → nothing.
 */

interface Gotcha { id: number; text: string; icon: IconType }
let current: Gotcha | null = null
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Where to show it: the pointer (mouse or pen), the last tap, or the focused control after a key press. */
const last = { x: 0, y: 0, kind: "mouse" as "mouse" | "touch" | "key" }
let tracking = false
function track() {
  if (tracking || typeof window === "undefined") return
  tracking = true
  window.addEventListener("pointermove", (e) => { last.x = e.clientX; last.y = e.clientY; last.kind = e.pointerType === "touch" ? "touch" : "mouse" }, { passive: true, capture: true })
  window.addEventListener("pointerdown", (e) => { last.x = e.clientX; last.y = e.clientY; last.kind = e.pointerType === "touch" ? "touch" : "mouse" }, { passive: true, capture: true })
  window.addEventListener("keydown", () => { last.kind = "key" }, { capture: true })
}

/** Shows a gotcha for about a second and a half. A new one replaces the last. */
export function gotcha(text: string, opts: { icon?: IconType } = {}) {
  current = { id: ++seq, text, icon: opts.icon ?? Checkmark }
  emit()
}

const LIFE = 1500
const GAP = 14 // px right of the pointer, clear of the cursor's arrow

export function GotchaHost() {
  const item = React.useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => current,
    () => null,
  )
  const ref = React.useRef<HTMLDivElement>(null)
  const [leaving, setLeaving] = React.useState<number | null>(null)
  React.useEffect(track, [])

  // Place it: right of the pointer (left of it near the window's right edge), or beside the focused control.
  const place = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    let x = last.x + GAP
    let y = last.y + 4
    if (last.kind === "touch") y = last.y - 40 // above the finger, never under it
    if (last.kind === "key" && document.activeElement && document.activeElement !== document.body) {
      const r = document.activeElement.getBoundingClientRect()
      x = r.right + 8
      y = r.top + r.height / 2 - el.offsetHeight / 2
    }
    if (x + el.offsetWidth > window.innerWidth - 8) x = Math.max(8, (last.kind === "key" ? x - 16 : last.x - GAP) - el.offsetWidth)
    y = Math.min(Math.max(8, y), window.innerHeight - el.offsetHeight - 8)
    // `translate`, not `transform`: the entrance scales with transform, and the position must never glide.
    el.style.translate = `${Math.round(x)}px ${Math.round(y)}px`
  }, [])

  // While it's up, it follows the mouse (touch and keyboard keep it where it appeared).
  React.useLayoutEffect(() => {
    if (!item) return
    place()
    if (last.kind !== "mouse") return
    let frame = 0
    const follow = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place) }
    window.addEventListener("pointermove", follow, { passive: true })
    return () => { window.removeEventListener("pointermove", follow); cancelAnimationFrame(frame) }
  }, [item, place])

  // Its life: up for a moment, then a short exit, then gone.
  React.useEffect(() => {
    if (!item) return
    const out = window.setTimeout(() => setLeaving(item.id), LIFE)
    const gone = window.setTimeout(() => { if (current?.id === item.id) { current = null; emit() } }, LIFE + 200)
    return () => { window.clearTimeout(out); window.clearTimeout(gone) }
  }, [item])

  return (
    <>
      {/* Screen readers hear it once, politely. */}
      <div role="status" aria-live="polite" className="sr-only">{item?.text}</div>
      {item && (
        <div
          key={item.id}
          ref={ref}
          aria-hidden
          className={cn(
            "pointer-events-none fixed top-0 left-0 z-70 flex transition-none items-center gap-1 rounded-full bg-inverse py-0.5 pr-2 pl-1.5 text-caption font-medium text-inverse-foreground shadow-floating",
            leaving === item.id ? "animate-exit-fade" : "animate-enter-scale",
          )}
        >
          <Icon as={item.icon} size="sm" className="text-success" />
          {item.text}
        </div>
      )}
    </>
  )
}
