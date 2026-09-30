import * as React from "react"
import { Accordion as AccordionPrimitive, Collapsible } from "radix-ui"
import { ChevronDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/**
 * Accordion — progressive disclosure for a LIST of sections the user scans by heading (FAQs, settings groups, filters).
 * Don't hide content most users need; don't nest accordions. One section → use an ExpandableTile or a Disclosure (Collapsible).
 */
export function Accordion({ className, align = "end", size = "md", ...props }: React.ComponentProps<typeof AccordionPrimitive.Root> & { align?: "start" | "end"; size?: "sm" | "md" | "lg" }) {
  return <AccordionPrimitive.Root data-align={align} data-size={size} className={cn("group/accordion w-full border-t border-border-subtle", className)} {...props} />
}

export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("border-b border-border-subtle", className)} {...props} />
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center gap-3 px-4 text-left text-body text-foreground duration-fast-02 ease-productive",
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
      <div className={cn("max-w-prose px-4 pt-1 pb-6 text-body text-muted-foreground", className)}>{children}</div>
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
