import * as React from "react"
import type { IconType } from "@/registry/icons"
import { CaretDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * TreeView, navigate or select within a HIERARCHY of unknown depth (file systems, org units, taxonomies).
 * ≤ 2 levels → Side nav or Accordion. Needs columns → DataTable with expandable rows.
 * Keyboard: ↑/↓ move, → expand/enter child, ← collapse/go to parent, Enter/Space select.
 */
export interface TreeNode {
  id: string
  label: string
  icon?: IconType
  children?: TreeNode[]
  disabled?: boolean
}

export function TreeView({ nodes, label, selected, onSelect, defaultExpanded = [], size = "sm", className }: {
  nodes: TreeNode[]
  label: string
  selected?: string
  onSelect?: (id: string) => void
  defaultExpanded?: string[]
  size?: "xs" | "sm"
  className?: string
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded))
  const [focused, setFocused] = React.useState<string | undefined>(selected ?? nodes[0]?.id)
  const refs = React.useRef(new Map<string, HTMLLIElement>())

  const flat: { node: TreeNode; parent?: string; depth: number }[] = []
  const walk = (list: TreeNode[], depth: number, parent?: string) =>
    list.forEach((n) => {
      flat.push({ node: n, parent, depth })
      if (n.children && expanded.has(n.id)) walk(n.children, depth + 1, n.id)
    })
  walk(nodes, 0)

  const toggle = (id: string, open?: boolean) =>
    setExpanded((s) => {
      const next = new Set(s)
      const willOpen = open ?? !next.has(id)
      if (willOpen) next.add(id)
      else next.delete(id)
      return next
    })
  const focus = (id?: string) => {
    if (!id) return
    setFocused(id)
    refs.current.get(id)?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const { node, parent } = flat[i]
    const has = !!node.children?.length
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focus(flat[i + 1]?.node.id); break
      case "ArrowUp": e.preventDefault(); focus(flat[i - 1]?.node.id); break
      case "ArrowRight": e.preventDefault(); if (has && !expanded.has(node.id)) toggle(node.id, true); else if (has) focus(node.children![0].id); break
      case "ArrowLeft": e.preventDefault(); if (has && expanded.has(node.id)) toggle(node.id, false); else focus(parent); break
      case "Enter": case " ": e.preventDefault(); if (!node.disabled) onSelect?.(node.id); break
    }
  }

  const renderLevel = (list: TreeNode[], depth: number): React.ReactNode =>
    list.map((n) => {
      const i = flat.findIndex((f) => f.node.id === n.id)
      const has = !!n.children?.length
      const open = expanded.has(n.id)
      const isSel = selected === n.id
      return (
        <li
          key={n.id}
          ref={(el) => { if (el) refs.current.set(n.id, el); else refs.current.delete(n.id) }}
          role="treeitem"
          aria-expanded={has ? open : undefined}
          aria-selected={isSel}
          aria-disabled={n.disabled || undefined}
          tabIndex={focused === n.id ? 0 : -1}
          onKeyDown={(e) => { e.stopPropagation(); onKeyDown(e, i) }}
          className="outline-none focus-visible:[&>div]:outline-1 focus-visible:[&>div]:-outline-offset-1 focus-visible:[&>div]:focus-halo-inset focus-visible:[&>div]:outline-(--vita-ring)"
        >
          <div
            onClick={() => { setFocused(n.id); if (!n.disabled) onSelect?.(n.id); if (has) toggle(n.id) }}
            style={{ paddingLeft: `calc(${depth} * 1.5rem + 0.5rem)` }}
            className={cn(
              "relative flex cursor-pointer items-center gap-2 rounded-md pr-2 text-body duration-fast-02",
              size === "xs" ? "h-control-xs" : "h-control-sm",
              "hover:bg-hover",
              // The selection mark sits inside the row, a short pill clear of its rounded corners (never a flat edge).
              "before:absolute before:inset-y-2 before:left-1 before:w-0.5 before:rounded-full before:bg-transparent before:duration-moderate-01",
              isSel && "bg-selected font-medium text-selected-foreground before:inset-y-1.5 before:bg-primary",
              n.disabled && "pointer-events-none text-disabled-foreground",
            )}
          >
            <span className="flex size-4 items-center justify-center">
              {has && <Icon as={CaretDown} className={cn(" duration-moderate-01 ease-productive", open && "rotate-180")} />}
            </span>
            {n.icon && <Icon as={n.icon} className="text-muted-foreground" />}
            <span className="truncate">{n.label}</span>
          </div>
          {has && (
            <div className={cn("reveal motion-productive", open && "reveal-open")} inert={!open || undefined}>
              <ul role="group">{renderLevel(n.children!, depth + 1)}</ul>
            </div>
          )}
        </li>
      )
    })

  return (
    <ul role="tree" aria-label={label} className={cn("flex w-full flex-col", className)}>
      {renderLevel(nodes, 0)}
    </ul>
  )
}
