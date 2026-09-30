import * as React from "react"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/registry/ui/menu"

/**
 * Breadcrumb — shows WHERE the user is in a hierarchy ≥ 3 levels deep and lets them go up.
 * Not a history trail. Not for flat sites. Current page is the last item, not a link.
 * > 4 levels → collapse the middle into an overflow "…" menu.
 */
export interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items, maxVisible = 4, className, renderLink }: {
  items: BreadcrumbItem[]
  maxVisible?: number
  className?: string
  /** Plug in your router's link. Defaults to <a>. */
  renderLink?: (item: BreadcrumbItem, className: string) => React.ReactNode
}) {
  const collapse = items.length > maxVisible
  const visible: (BreadcrumbItem | "overflow")[] = collapse ? [items[0], "overflow", ...items.slice(-(maxVisible - 2))] : items
  const hidden = collapse ? items.slice(1, items.length - (maxVisible - 2)) : []
  const linkCls = "rounded-sm text-link underline-offset-4 underline decoration-transparent hover:decoration-current focus-ring"
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-footnote">
        {visible.map((it, i) => {
          const last = i === visible.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {it === "overflow" ? (
                <Menu>
                  <MenuTrigger className="rounded-sm px-1 text-link hover:bg-hover focus-ring" aria-label="Show hidden levels">…</MenuTrigger>
                  <MenuContent>
                    {hidden.map((h) => (
                      <MenuItem key={h.label} asChild>
                        <a href={h.href}>{h.label}</a>
                      </MenuItem>
                    ))}
                  </MenuContent>
                </Menu>
              ) : last ? (
                <span aria-current="page" className="text-foreground">{it.label}</span>
              ) : renderLink ? (
                renderLink(it, linkCls)
              ) : (
                <a href={it.href} className={linkCls}>{it.label}</a>
              )}
              {!last && <span aria-hidden className="text-helper">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
