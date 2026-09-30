import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Breadcrumb, type BreadcrumbItem } from "@/registry/ui/breadcrumb"

/**
 * PageHeader — the top of every page inside the shell: breadcrumb → title (+ status) → description → page actions → tabs.
 * Exactly one per page. Page actions: max 1 primary + 2 secondary; the rest go in an OverflowMenu.
 */
export function PageHeader({ breadcrumb, title, status, description, actions, tabs, className }: {
  breadcrumb?: BreadcrumbItem[]
  title: React.ReactNode
  /** A Tag or StatusIndicator next to the title. */
  status?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  /** TabsList for page-level tabs; renders flush at the bottom. */
  tabs?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-3 border-b border-border-subtle bg-background px-4 pt-5 md:px-5", !tabs && "pb-5", className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-title-1">{title}</h1>
            {status}
          </div>
          {description && <p className="max-w-prose text-body text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {tabs && <div className="-mb-px">{tabs}</div>}
    </header>
  )
}
