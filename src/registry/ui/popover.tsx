import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Information } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
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
          "z-50 w-72 scope-lg border border-border-subtle bg-raised p-3 text-foreground shadow-floating outline-none",
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
export function Toggletip({ label = "More information", children, align = "start" }: { label?: string; children: React.ReactNode; align?: "start" | "center" | "end" }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className="inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-ring"
      >
        <Icon as={Information} size="sm" />
      </PopoverTrigger>
      <PopoverContent align={align} caret className="w-64 text-body">
        {children}
      </PopoverContent>
    </Popover>
  )
}
