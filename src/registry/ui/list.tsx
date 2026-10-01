import * as React from "react"
import { cn } from "@/registry/lib/utils"

/**
 * List, typographic lists inside content (instructions, feature bullets). Not interactive.
 * Interactive/selectable rows → ContainedList. Comparing attributes across rows → StructuredList / DataTable.
 */
export function UnorderedList({ className, nested, ...props }: React.HTMLAttributes<HTMLUListElement> & { nested?: boolean }) {
  return <ul className={cn("flex list-disc flex-col gap-1 pl-5 text-body marker:text-muted-foreground", nested && "mt-1", className)} {...props} />
}

export function OrderedList({ className, nested, ...props }: React.OlHTMLAttributes<HTMLOListElement> & { nested?: boolean }) {
  return <ol className={cn("flex list-decimal flex-col gap-1 pl-5 text-body marker:text-muted-foreground marker:tabular-nums", nested && "mt-1 list-[lower-alpha]", className)} {...props} />
}

export function ListItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("pl-1", className)} {...props} />
}
