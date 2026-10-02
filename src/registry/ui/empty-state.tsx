import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Pictogram, type PictogramProps } from "@/registry/ui/pictogram"

/**
 * EmptyState, what a region shows when it has nothing to show. Three causes, three messages:
 *   first-use   → explain the value + ONE primary action to create the first item
 *   no-results  → say nothing matched + offer to clear filters/search
 *   error       → say what failed + how to recover (retry), never blame the user
 * Title = what's happening, description = why / what next (≤ 2 lines), action = the next step.
 */
export function EmptyState({ pictogram, title, description, action, secondaryAction, size = "md", className }: {
  pictogram?: PictogramProps["as"]
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  /** sm = inside tables/panels · md = page region · lg = whole page, first-use */
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  return (
    // Full height of its container, centred both ways: an empty space is the empty state, not a strip at the top.
    <div className={cn("flex min-h-full w-full min-w-0 flex-1 flex-col items-center justify-center self-stretch text-center", size === "sm" ? "gap-1.5 px-4 py-6" : size === "lg" ? "gap-3 px-5 py-16" : "gap-2 px-5 py-10", className)}>
      {pictogram && <Pictogram as={pictogram} size={size === "lg" ? "xl" : size === "sm" ? "md" : "lg"} tone="neutral" className="mb-2" />}
      {/* Long queries are one unbroken word: they break anywhere rather than leave the container. */}
      <h3 className={cn("max-w-full [overflow-wrap:anywhere]", size === "lg" ? "text-title-2" : size === "sm" ? "text-headline" : "text-title-3")}>{title}</h3>
      {description && <p className="max-w-md text-body text-muted-foreground [overflow-wrap:anywhere]">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
