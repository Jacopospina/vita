import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"

/**
 * Tabs — switch between related VIEWS of the same object/page at the same level (Overview · Activity · Settings).
 *   line      → page-level navigation within a context (default)
 *   contained → tabs attached to a panel/card (secondary level)
 * Switching filters or modes of ONE dataset → ContentSwitcher. Sequential steps → ProgressIndicator.
 */
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("flex flex-col", className)} {...props} />
}

export function TabsList({ className, variant = "line", fullWidth, ...props }: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "line" | "contained"; fullWidth?: boolean }) {
  return (
    <TabsPrimitive.List
      data-variant={variant}
      className={cn(
        "group/tabs flex overflow-x-auto",
        variant === "line" ? "gap-1 border-b border-border-subtle" : "gap-px",
        fullWidth && "*:flex-1",
        className,
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative inline-flex h-control-md shrink-0 items-center justify-center gap-2 px-inset-lg text-body whitespace-nowrap text-muted-foreground",
        "transition-colors duration-fast-02 ease-productive focus-ring-inset hover:text-foreground disabled:text-disabled-foreground",
        // line
        "group-data-[variant=line]/tabs:after:absolute group-data-[variant=line]/tabs:after:inset-x-0 group-data-[variant=line]/tabs:after:-bottom-px group-data-[variant=line]/tabs:after:h-0.5",
        "group-data-[variant=line]/tabs:after:transition-colors group-data-[variant=line]/tabs:after:duration-moderate-01",
        "group-data-[variant=line]/tabs:data-[state=active]:font-medium group-data-[variant=line]/tabs:data-[state=active]:text-foreground group-data-[variant=line]/tabs:data-[state=active]:after:bg-primary",
        // contained
        "group-data-[variant=contained]/tabs:bg-layer-2 group-data-[variant=contained]/tabs:hover:bg-layer-3",
        "group-data-[variant=contained]/tabs:first:rounded-tl-md group-data-[variant=contained]/tabs:last:rounded-tr-md",
        "group-data-[variant=contained]/tabs:data-[state=active]:bg-layer-1 group-data-[variant=contained]/tabs:data-[state=active]:font-medium group-data-[variant=contained]/tabs:data-[state=active]:text-foreground",
        "group-data-[variant=contained]/tabs:data-[state=active]:shadow-[inset_0_2px_0_var(--corpus-primary)]",
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("pt-6 outline-none data-[state=active]:animate-enter-fade", className)} {...props} />
}
