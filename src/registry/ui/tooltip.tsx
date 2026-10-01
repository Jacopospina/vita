import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"

/**
 * Tooltip — a short, plain-text NAME or HINT for something on hover/focus.
 * Never put interactive content, critical info or long text in a tooltip → use Popover (toggletip).
 */
export function TooltipProvider({ delayDuration = 400, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={200} {...props} />
}

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  /** Opt-out for already-labelled elements when the tooltip would be redundant. */
  disabled?: boolean
}

export function Tooltip({ content, children, side = "top", align = "center", disabled }: TooltipProps) {
  if (disabled || !content) return children
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            // A squircle pill with no pointer: proximity and the 6px offset already say what it belongs to.
            "z-50 max-w-72 squircle bg-inverse px-2 py-1 text-footnote text-inverse-foreground shadow-floating [--corpus-squircle-r:var(--corpus-radius-md)]",
            "data-[state=delayed-open]:animate-enter-fade data-[state=instant-open]:animate-enter-fade data-[state=closed]:animate-exit-fade",
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

/** DefinitionTooltip — dotted-underline term with a definition. For glossary terms in body copy. */
export function DefinitionTooltip({ term, definition }: { term: React.ReactNode; definition: React.ReactNode }) {
  return (
    <Tooltip content={definition} side="bottom" align="start">
      <button type="button" className="cursor-help rounded-sm border-b border-dotted border-border-strong focus-ring">
        {term}
      </button>
    </Tooltip>
  )
}
