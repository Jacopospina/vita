import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * IconTile — a glyph on a small squircle tile: the leading visual of list rows, notifications, banners and
 * settings pages. The ONE way to put an icon on a tile; never hand-roll a colored square.
 *
 *   filled  colored tile, white glyph → categories (settings rows, app/agent marks)
 *   soft    neutral tile, colored glyph → semantic kinds (notifications: the glyph's color carries the kind)
 *
 * Need a bare icon inline with text → Icon. Need a big illustrative mark → Pictogram.
 */
const tones = {
  neutral: { filled: "bg-muted-foreground text-background", soft: "text-foreground" },
  brand: { filled: "bg-primary text-primary-foreground", soft: "text-primary" },
  info: { filled: "bg-info text-primary-foreground", soft: "text-info" },
  success: { filled: "bg-success text-primary-foreground", soft: "text-success" },
  warning: { filled: "bg-warning text-primary-foreground", soft: "text-warning" },
  error: { filled: "bg-error text-primary-foreground", soft: "text-error" },
} as const

// Tile size → glyph size; the tile radius follows the tile (concentric with its container).
const sizes = {
  sm: { tile: "size-6 [--corpus-squircle-r:var(--corpus-radius-sm)]", icon: "sm" },
  md: { tile: "size-8 [--corpus-squircle-r:var(--corpus-radius-sm)]", icon: "md" },
  lg: { tile: "size-10 [--corpus-squircle-r:var(--corpus-radius-md)]", icon: "md" },
} as const

export type IconTileTone = keyof typeof tones

export interface IconTileProps {
  /** An icon type, or any node (agent/app mark, avatar image). */
  icon: IconType | React.ReactNode
  tone?: IconTileTone
  variant?: "filled" | "soft"
  /** sm 24 · list rows · md 32 · compact headers · lg 40 · notifications and banners */
  size?: keyof typeof sizes
  /** Draw the glyph in on mount (notifications). */
  draw?: boolean
  className?: string
}

const isIconType = (x: unknown): x is IconType =>
  typeof x === "function" || (typeof x === "object" && x !== null && "render" in x && !React.isValidElement(x))

export function IconTile({ icon, tone = "neutral", variant = "filled", size = "sm", draw, className }: IconTileProps) {
  const s = sizes[size]
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center squircle duration-moderate-01",
        s.tile,
        variant === "soft" && "bg-background/70 shadow-raised",
        tones[tone][variant],
        className,
      )}
    >
      {isIconType(icon) ? <Icon as={icon} size={s.icon} draw={draw ? "in" : undefined} /> : icon}
    </span>
  )
}
