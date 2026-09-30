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
