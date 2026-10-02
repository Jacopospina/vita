import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * Avatar: a person, at a glance. Their photo when there is one; otherwise their initials, white on a soft
 * grey gradient. Three sizes: sm 24 (dense rows, mentions), md 32 (messages, lists), lg 40 (headers, profiles).
 *
 *   <Avatar name="Indie Novak" />            → "IN"
 *   <Avatar name="Indie Novak" src={url} />  → the photo, initials while it loads or if it fails
 *
 * Not for: an agent, an app or an icon → IconPlaceholder; the AI working → Thinking.
 */
const sizes = {
  sm: "size-6 text-caption",
  md: "size-8 text-body",
  lg: "size-10 text-headline",
} as const

/** Up to two initials: the first letters of the first and last names. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] ?? "")
  return (first + last).toUpperCase()
}

export interface AvatarProps {
  /** The person's name: their initials, and the accessible name. */
  name: string
  /** A photo. Initials show while it loads and if it fails. */
  src?: string
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const photo = src && !failed
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-primary-foreground select-none",
        // The fallback: a soft grey gradient (neutral: a person, not a status or a brand), deep enough for white initials.
        "bg-linear-to-b from-[var(--vita-palette-gray-400)] to-[var(--vita-palette-gray-600)]",
        sizes[size],
        className,
      )}
    >
      <span aria-hidden className={cn("duration-moderate-01", photo && loaded && "opacity-0")}>{initials(name)}</span>
      {photo && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 size-full object-cover duration-moderate-02 ease-productive", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </span>
  )
}
