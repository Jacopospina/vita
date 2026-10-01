import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * IconPlaceholder, the leading visual slot: a colored glyph on a neutral squircle tile.
 * ONE look everywhere; only the size changes:
 *   sm 24 → dense rows, inline marks · md 32 → list items · lg 40 → notifications, toast banners
 * The glyph's tone carries the category or the kind. Never hand-roll an icon-on-a-square.
 *
 * Need a bare icon inline with text → Icon. Need a big illustrative mark → Pictogram.
 */
const tones = {
  neutral: "text-foreground",
  brand: "text-primary",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
} as const

// Tile size → glyph size. The radius is proportional (22% of the tile), so every size is the same shape.
const sizes = {
  sm: { tile: "size-6", icon: "sm" },
  md: { tile: "size-8", icon: "md" },
  lg: { tile: "size-10", icon: "md" },
} as const

export type IconPlaceholderTone = keyof typeof tones
export type IconPlaceholderSize = keyof typeof sizes

export interface IconPlaceholderProps {
  /** An icon type, or any node (agent/app mark, avatar image). */
  icon: IconType | React.ReactNode
  tone?: IconPlaceholderTone
  /** sm 24 · md 32 · lg 40 */
  size?: IconPlaceholderSize
  /** Draw the glyph in on mount (notifications). */
  draw?: boolean
  /** tint (default): a faint dark wash, for white or raised surfaces · solid: a white tile, for grey list groups. */
  surface?: "tint" | "solid"
  className?: string
}

const isIconType = (x: unknown): x is IconType =>
  typeof x === "function" || (typeof x === "object" && x !== null && "render" in x && !React.isValidElement(x))

export function IconPlaceholder({ icon, tone = "neutral", size = "md", draw, surface = "tint", className }: IconPlaceholderProps) {
  const s = sizes[size]
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center squircle duration-moderate-01 [--vita-squircle-r:22%]",
        surface === "solid" ? "bg-icon-surface-solid" : "bg-icon-surface",
        s.tile,
        tones[tone],
        className,
      )}
    >
      {isIconType(icon) ? <Icon as={icon} size={s.icon} draw={draw ? "in" : undefined} /> : icon}
    </span>
  )
}
