import * as React from "react"
import { Toolbar as ToolbarPrimitive } from "radix-ui"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"

/**
 * Toolbar — a row of related controls with roving focus (one Tab stop, arrows move within). Used by the Text toolbar pattern,
 * table toolbars and canvas tools. Group with separators; icons need labels (tooltips).
 */
export function Toolbar({ className, label, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Root> & { label: string }) {
  return <ToolbarPrimitive.Root aria-label={label} className={cn("flex h-control-md w-fit items-center gap-0.5 rounded-md border border-border-subtle bg-raised p-0.5 shadow-raised", className)} {...props} />
}

const btn = "inline-flex h-full aspect-square items-center justify-center rounded-sm text-muted-foreground transition-colors duration-fast-02 hover:bg-hover hover:text-foreground focus-ring data-[state=on]:bg-selected data-[state=on]:text-selected-foreground disabled:text-disabled-foreground"

export function ToolbarButton({ icon, label, className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Button> & { icon: IconType; label: string }) {
  return (
    <Tooltip content={label}>
      <ToolbarPrimitive.Button aria-label={label} className={cn(btn, className)} {...props}>
        <Icon as={icon} />
      </ToolbarPrimitive.Button>
    </Tooltip>
  )
}

export function ToolbarToggleGroup(props: React.ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  return <ToolbarPrimitive.ToggleGroup className="flex h-full items-center gap-0.5" {...props} />
}

export function ToolbarToggle({ icon, label, className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & { icon: IconType; label: string }) {
  return (
    <Tooltip content={label}>
      <ToolbarPrimitive.ToggleItem aria-label={label} className={cn(btn, className)} {...props}>
        <Icon as={icon} />
      </ToolbarPrimitive.ToggleItem>
    </Tooltip>
  )
}

export function ToolbarSeparator() {
  return <ToolbarPrimitive.Separator className="mx-1 h-5 w-px bg-border-subtle" />
}
