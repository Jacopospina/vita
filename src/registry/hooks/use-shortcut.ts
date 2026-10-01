import * as React from "react"

/**
 * useShortcut, bind a LEFT-HAND keyboard shortcut. Vita assumes one hand per device:
 * the right hand stays on the pointer, the left hand on the keyboard. Shortcuts must be reachable with the left hand.
 *
 *   useShortcut("mod+s", save)        ⌘S / Ctrl+S
 *   useShortcut("escape", close)
 *   useShortcut("mod+shift+z", redo)
 *
 * "mod" = ⌘ on Apple platforms, Ctrl elsewhere.
 */
export const LEFT_HAND_KEYS = new Set([
  "escape", "tab", "space", "`", "1", "2", "3", "4", "5",
  "q", "w", "e", "r", "t", "a", "s", "d", "f", "g", "z", "x", "c", "v", "b",
])
const MODIFIERS = new Set(["mod", "shift", "alt", "ctrl", "meta"])

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

export function parseCombo(combo: string) {
  const parts = combo.toLowerCase().split("+").map((p) => p.trim())
  const key = parts.find((p) => !MODIFIERS.has(p)) ?? ""
  return { key, mod: parts.includes("mod"), shift: parts.includes("shift"), alt: parts.includes("alt") }
}

export function isLeftHand(combo: string) {
  return LEFT_HAND_KEYS.has(parseCombo(combo).key)
}

export function useShortcut(combo: string | undefined, handler: (e: KeyboardEvent) => void, { enabled = true }: { enabled?: boolean } = {}) {
  const ref = React.useRef(handler)
  React.useEffect(() => {
    ref.current = handler
  })
  React.useEffect(() => {
    if (!combo || !enabled) return
    if (import.meta.env?.DEV && !isLeftHand(combo)) console.warn(`[vita] Shortcut "${combo}" needs the right hand. Vita shortcuts must use left-hand keys.`)
    const { key, mod, shift, alt } = parseCombo(combo)
    const onKey = (e: KeyboardEvent) => {
      const pressed = e.key === " " ? "space" : e.key.toLowerCase()
      if (pressed !== key) return
      if (mod !== (isMac ? e.metaKey : e.ctrlKey) || shift !== e.shiftKey || alt !== e.altKey) return
      const t = e.target as HTMLElement | null
      // Bare-key shortcuts never fire while typing.
      if (!mod && !alt && key !== "escape" && t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return
      e.preventDefault()
      ref.current(e)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [combo, enabled])
}
