import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Information } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { ActionBar } from "@/registry/ui/button"
import { Icon } from "@/registry/ui/icon"

/**
 * Popover — non-modal floating layer anchored to a trigger, opened by CLICK.
 * Holds rich or interactive content (a short form, filters, details). If it needs >1 decision or blocks the page, use Modal.
 */
export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor
export const PopoverClose = PopoverPrimitive.Close

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  caret = false,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & { caret?: boolean }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          "z-50 w-72 overflow-hidden scope-lg glass glass-3 p-3 text-foreground outline-none",
          "data-[state=open]:animate-enter-scale data-[state=closed]:animate-exit-scale origin-(--radix-popover-content-transform-origin)",
          className,
        )}
        {...props}
      >
        {children}
        {caret && <PopoverPrimitive.Arrow className="fill-raised" width={12} height={6} />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

/**
 * Toggletip — an "i" button that opens a small popover with explanation and optional link/action.
 * Use instead of a tooltip whenever the content is interactive or longer than one sentence.
 */
/**
 * PopoverFooter — the popover's action row, exactly like a dialog's: an inset rounded group of joined
 * buttons; the group owns its corners (concentric). Same rules: no Cancel (Esc / click-outside close it).
 */
export function PopoverFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // Same as a dialog: blended actions in one rounded group, 8px from the popover's edges (radius = popover − 8px).
  return <ActionBar className={cn("-mx-1 mt-3 -mb-1 overflow-hidden rounded-inner-2 border-t-0", className)} {...props} />
}

export function Toggletip({ label = "More information", children, align = "start" }: { label?: string; children: React.ReactNode; align?: "start" | "center" | "end" }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className="relative tap inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-ring"
      >
        <Icon as={Information} size="sm" />
      </PopoverTrigger>
      <PopoverContent align={align} caret className="w-64 text-body">
        {children}
      </PopoverContent>
    </Popover>
  )
}
