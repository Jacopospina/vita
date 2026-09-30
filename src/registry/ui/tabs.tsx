import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { useIndicator } from "@/registry/hooks/use-morph"
import { useDragSelect } from "@/registry/hooks/use-drag-select"

/**
 * Tabs — switch between related VIEWS of the same object/page at the same level (Overview · Activity · Settings).
 *   pill      → DEFAULT. Segmented track; a raised pill slides between tabs (lava-lamp) on a spring.
 *   line      → underline that glides; for dense toolbars or when a track would be too heavy
 *   contained → tabs attached to a panel/card (secondary level)
 * Switching filters or modes of ONE dataset → ContentSwitcher. Sequential steps → ProgressIndicator.
 * Hold and nudge to browse: while pressed, each small sideways nudge snaps to the next/previous tab and shows its content.
 */
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn("flex flex-col", className)} {...props} />
}

export function TabsList({ className, variant = "pill", fullWidth, children, onPointerDown, ...props }: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: "pill" | "line" | "contained"; fullWidth?: boolean }) {
  const [ref, rect] = useIndicator<HTMLDivElement>('[role="tab"][data-state="active"]')
  // Hold and nudge: each small sideways nudge snaps to the next/previous tab. A tab activates on a primary
  // mousedown, so stepping = pressing the target tab (works even when the window isn't focused).
  const drag = useDragSelect(
    '[role="tab"]',
    (el) => {
      if (el.getAttribute("data-state") !== "active") el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, button: 0 }))
    },
    { activeSelector: '[data-state="active"]' },
  )
  return (
    <TabsPrimitive.List
      ref={ref}
      data-variant={variant}
      className={cn(
        "group/tabs relative flex overflow-x-auto",
        variant === "pill" && "w-fit max-w-full gap-0.5 scope-md bg-layer-2 p-0.5",
        variant === "line" && "gap-1 border-b border-border-subtle",
        variant === "contained" && "gap-px",
        fullWidth && "*:flex-1",
        "select-none",
        className,
      )}
      {...props}
      onPointerDown={(e) => {
        drag.onPointerDown(e)
        onPointerDown?.(e)
      }}
    >
      {children}
      {variant === "pill" && rect && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute top-0 left-0 rounded-inner-0.5 bg-raised shadow-raised duration-expressive ease-spring", drag.dragging && "scale-95")}
          style={{ width: rect.w, height: rect.h, transform: `translate(${rect.x}px, ${rect.y}px)` }}
        />
      )}
      {variant === "line" && rect && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary motion-expressive"
          style={{ width: rect.w, transform: `translateX(${rect.x}px)` }}
        />
      )}
    </TabsPrimitive.List>
  )
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative inline-flex h-control-md shrink-0 items-center justify-center gap-2 px-inset-lg text-body whitespace-nowrap text-muted-foreground",
        // pill (default): transparent triggers above the sliding pill
        "group-data-[variant=pill]/tabs:z-10 group-data-[variant=pill]/tabs:h-control-sm group-data-[variant=pill]/tabs:rounded-inner-0.5 group-data-[variant=pill]/tabs:px-inset group-data-[variant=pill]/tabs:data-[state=active]:font-medium group-data-[variant=pill]/tabs:data-[state=active]:text-foreground",
        " duration-fast-02 ease-productive focus-ring-inset hover:text-foreground disabled:text-disabled-foreground",
        // line
        "group-data-[variant=line]/tabs:after:absolute group-data-[variant=line]/tabs:after:inset-x-0 group-data-[variant=line]/tabs:after:-bottom-px group-data-[variant=line]/tabs:after:h-0.5",
        " group-data-[variant=line]/tabs:after:duration-moderate-01",
        "group-data-[variant=line]/tabs:data-[state=active]:font-medium group-data-[variant=line]/tabs:data-[state=active]:text-foreground",
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
  return <TabsPrimitive.Content className={cn("pt-4 outline-none data-[state=active]:animate-enter-fade", className)} {...props} />
}
