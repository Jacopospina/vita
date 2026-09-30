import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"

/**
 * Icon — the only way to render an icon. Renders glyphs from @/registry/icons at Corpus sizes.
 * sm 16 (inline with body text, inside controls) · md 20 (standalone, toolbars, header) · lg 24 (empty states in dense UI) · xl 32 (tiles)
 */
const sizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  as: IconType
  size?: keyof typeof sizes
  /** Provide a label only when the icon carries meaning on its own. Decorative icons stay silent. */
  label?: string
}

const glyphIds = new WeakMap<object, number>()
let glyphSeq = 0
const glyphId = (icon: object) => {
  if (!glyphIds.has(icon)) glyphIds.set(icon, ++glyphSeq)
  return glyphIds.get(icon)!
}

/**
 * SwapIcon — use whenever the glyph depends on state (status, sort direction, check/empty, menu/close).
 * The first glyph renders still; every later change remounts the new glyph with a scale-in. Nothing snaps.
 */
export function SwapIcon({ as, ...props }: IconProps) {
  const [first] = React.useState(() => as)
  const [changed, setChanged] = React.useState(false)
  if (!changed && as !== first) setChanged(true)
  return <Icon key={glyphId(as)} as={as} {...props} className={cn(changed && "animate-enter-scale", props.className)} />
}

export function Icon({ as: Glyph, size = "sm", label, className, ...props }: IconProps) {
  return (
    <Glyph
      size={sizes[size]}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0 fill-current", className)}
      {...(props as object)}
    />
  )
}
