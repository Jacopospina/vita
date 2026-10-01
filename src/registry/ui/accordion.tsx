import * as React from "react"
import { Accordion as AccordionPrimitive, Collapsible } from "radix-ui"
import { ChevronDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * Accordion — progressive disclosure for a LIST of sections the user scans by heading (FAQs, settings groups, filters).
 * Don't hide content most users need; don't nest accordions. One section → use an ExpandableTile or a Disclosure (Collapsible).
 * Sections belong together: one rounded surface, concentric rounded rows, inset separators (like ListGroup).
 */
export function Accordion({ className, align = "end", size = "md", ...props }: React.ComponentProps<typeof AccordionPrimitive.Root> & { align?: "start" | "end"; size?: "sm" | "md" | "lg" }) {
  return <AccordionPrimitive.Root data-align={align} data-size={size} className={cn("group/accordion flex w-full flex-col scope-lg border border-border-subtle bg-layer-2 p-1", className)} {...props} />
}

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        // inset separator above every section but the first; it fades when the row below is hovered
        "group/item relative before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-border before:duration-fast-02 first:before:opacity-0 has-[button:hover]:before:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center gap-2 rounded-inner-1 px-3 text-left text-body text-foreground duration-fast-02 ease-productive",
          "h-control-md group-data-[size=sm]/accordion:h-control-sm group-data-[size=lg]/accordion:h-control-lg",
          "hover:bg-hover focus-ring-inset disabled:text-disabled-foreground",
          "group-data-[align=start]/accordion:flex-row-reverse group-data-[align=start]/accordion:justify-end",
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <Icon as={ChevronDown} className="text-muted-foreground duration-moderate-01 ease-productive group-data-[state=open]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand" {...props}>
      <div className={cn("max-w-prose px-3 pt-0.5 pb-4 text-body text-muted-foreground", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

/** Disclosure — a single show/hide ("Show advanced options"). Trigger is usually a ghost Button via asChild. */
export const Disclosure = Collapsible.Root
export const DisclosureTrigger = Collapsible.Trigger
export function DisclosureContent({ className, children, ...props }: React.ComponentProps<typeof Collapsible.Content>) {
  return (
    <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand" {...props}>
      <div className={cn("pt-4", className)}>{children}</div>
    </Collapsible.Content>
  )
}
