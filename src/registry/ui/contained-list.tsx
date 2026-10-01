import * as React from "react"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { ListGroup, ListItem, type ListItemProps } from "@/registry/ui/list-item"

/**
 * ContainedList, a titled list of similar items, each a row that may hold an action (members, connected apps, recent files).
 * Built from the same pieces as every Vita list: a ListGroup (one rounded surface, inset separators) of ListItems
 * (comfortable rows, icon placeholder, title + subtitle, trailing control). The header adds the list's label and a
 * list-level action. Needs sorting/columns → DataTable. Pure text bullets → List. Settings rows → ListSection.
 */
export function ContainedList({ label, action, kind = "on-page", className, children }: {
  label: React.ReactNode
  /** Action for the whole list, e.g. "Add member" button or a Search. */
  action?: React.ReactNode
  /** on-page = section header · disclosed = inside a popover/panel, compact header */
  kind?: "on-page" | "disclosed"
  /** @deprecated Rows follow the system's list-item rhythm; size is ignored. */
  size?: "sm" | "md" | "lg"
  className?: string
  children: React.ReactNode
}) {
  const id = React.useId()
  return (
    <section className={cn("flex w-full flex-col gap-2", className)} aria-labelledby={id}>
      <div className="flex min-h-control-md items-center justify-between gap-2 px-1.5">
        <h3 id={id} className={kind === "on-page" ? "text-headline" : "text-footnote font-semibold text-muted-foreground"}>{label}</h3>
        {action}
      </div>
      <ListGroup>{children}</ListGroup>
    </section>
  )
}

const isIconType = (x: unknown): x is IconType => typeof x === "function" || (typeof x === "object" && x !== null && "render" in x && !React.isValidElement(x))

export function ContainedListItem({ icon, tone, subtitle, action, onClick, href, selected, disabled, className, children }: {
  /** An icon (shown on an IconPlaceholder) or any node (avatar, custom mark). */
  icon?: IconType | React.ReactNode
  tone?: ListItemProps["tone"]
  /** Second line, only when it adds information. */
  subtitle?: React.ReactNode
  /** Trailing action (IconButton / OverflowMenu / Button). With an action the row itself isn't a link. */
  action?: React.ReactNode
  onClick?: () => void
  href?: string
  selected?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <ListItem
      icon={isIconType(icon) ? icon : undefined}
      media={isIconType(icon) ? undefined : (icon as React.ReactNode)}
      tone={tone}
      title={children}
      subtitle={subtitle}
      trailing={action}
      onClick={onClick}
      href={href}
      selected={selected}
      disabled={disabled}
      className={className}
    />
  )
}
