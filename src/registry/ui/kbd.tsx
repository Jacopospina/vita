import { cn } from "@/registry/lib/utils"
import { isMac, parseCombo } from "@/registry/hooks/use-shortcut"

/**
 * Kbd, shows a shortcut, platform-aware ("mod+s" → ⌘S on Mac, Ctrl+S elsewhere).
 * Shortcuts appear in tooltips and menus, never as standalone instructions.
 */
const glyph: Record<string, string> = { escape: "Esc", tab: "Tab", space: "Space", shift: "⇧", alt: isMac ? "⌥" : "Alt" }

export function formatCombo(combo: string) {
  const { key, mod, shift, alt } = parseCombo(combo)
  const parts = [mod ? (isMac ? "⌘" : "Ctrl") : null, alt ? glyph.alt : null, shift ? glyph.shift : null, glyph[key] ?? key.toUpperCase()].filter(Boolean)
  return isMac ? parts.join("") : parts.join("+")
}

export function Kbd({ keys, className }: { keys: string; className?: string }) {
  return (
    <kbd className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border bg-layer-1 px-1 font-sans text-caption text-muted-foreground", className)}>
      {formatCombo(keys)}
    </kbd>
  )
}
