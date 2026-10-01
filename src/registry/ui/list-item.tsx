import * as React from "react"
import { ChevronRight } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconPlaceholder, type IconPlaceholderTone } from "@/registry/ui/icon-placeholder"

/**
 * ListItem — the settings-style row: leading icon placeholder · title (+ subtitle) · trailing control on the far right.
 * ListGroup joins rows that BELONG together into one card (zero gap, the card owns fill + radius, rows are flat,
 * separators are inset). Different groups stand apart. ListSection gives a run of groups a heading.
 *
 *   navigation row   onClick / href, no trailing → chevron on the far right, whole row is the target
 *   control row      trailing = Toggle / Button / Dropdown / value text — the row itself is not clickable
 */

export interface ListItemProps {
  /** Leading glyph, drawn on a small squircle tile. */
  icon?: IconType
  /** Colors the glyph on the neutral placeholder. */
  tone?: IconPlaceholderTone
  /** Leading media instead of an icon placeholder — avatar, device image, app mark. */
  media?: React.ReactNode
  title: React.ReactNode
  /** Second line, only when it adds information (model, owner, state). */
  subtitle?: React.ReactNode
  /** Quiet value shown before the chevron, e.g. "On", "3 agents". */
  value?: React.ReactNode
  /** Control on the far right: Toggle, Button, Tag, Dropdown. Replaces the chevron. */
  trailing?: React.ReactNode
  onClick?: () => void
  href?: string
  selected?: boolean
  disabled?: boolean
  className?: string
}

export function ListItem({ icon, tone = "neutral", media, title, subtitle, value, trailing, onClick, href, selected, disabled, className }: ListItemProps) {
  const navigable = !trailing && (!!onClick || !!href)
  const body = (
    <>
      {media ? (
        <span className="flex shrink-0 items-center">{media}</span>
      ) : icon ? (
        <IconPlaceholder icon={icon} tone={tone} size="md" />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-body">{title}</span>
        {subtitle && <span className="truncate text-footnote text-muted-foreground">{subtitle}</span>}
      </span>
      {value && <span className="shrink-0 text-body text-muted-foreground">{value}</span>}
      {trailing && <span className="flex shrink-0 items-center">{trailing}</span>}
      {navigable && <Icon as={ChevronRight} size="sm" className="shrink-0 text-muted-foreground duration-fast-02 group-hover/row:translate-x-0.5" />}
    </>
  )
  const row = cn(
    "group/row relative flex w-full min-h-control-xl items-center gap-2.5 rounded-inner-1 py-1.5 pr-2.5 pl-1.5 text-left text-foreground",
    // inset separator between rows; it fades when either neighbour is hovered/selected
    "before:absolute before:right-2.5 before:left-1.5 before:top-0 before:h-px before:bg-divider before:duration-fast-02 group-first/item:before:opacity-0",
    navigable && "duration-fast-02 hover:bg-hover hover:before:opacity-0 active:bg-active focus-ring-inset",
    selected && "bg-selected text-selected-foreground before:opacity-0",
    disabled && "pointer-events-none text-disabled-foreground",
  )
  return (
    <li className={cn("group/item list-none", className)}>
      {navigable && href ? (
        <a href={href} aria-current={selected || undefined} className={row}>{body}</a>
      ) : navigable ? (
        <button type="button" disabled={disabled} aria-current={selected || undefined} onClick={onClick} className={row}>{body}</button>
      ) : (
        <div className={row}>{body}</div>
      )}
    </li>
  )
}

/** ListGroup — rows that belong together, joined into one card. A single row on its own is a group of one. */
export function ListGroup({ className, children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    // Concentric: the group's radius (lg) minus its 4px padding is the rows' radius (rounded-inner-1) — plain rounding on
    // both, so the curves stay parallel (a squircle outside would read rounder than the formula).
    <ul role="list" className={cn("flex flex-col scope-lg border border-border-subtle bg-layer-2 p-1", className)} {...props}>
      {children}
    </ul>
  )
}

/**
 * ListSection — one or more ListGroups, with an optional heading and note. It OWNS the gap between groups
 * (different topics stand apart); never space groups with a loose Stack.
 */
export function ListSection({ title, description, className, children }: { title?: React.ReactNode; description?: React.ReactNode; className?: string; children: React.ReactNode }) {
  const id = React.useId()
  return (
    <section aria-labelledby={title ? id : undefined} className={cn("flex flex-col gap-3", className)}>
      {(title || description) && (
        <header className="flex flex-col px-1.5 pt-2">
          {title && <h3 id={id} className="text-headline">{title}</h3>}
          {description && <p className="text-footnote text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
