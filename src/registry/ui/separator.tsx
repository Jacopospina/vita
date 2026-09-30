import { Separator as SeparatorPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"

/** Separator — prefer whitespace first. Use a rule only when spacing alone can't separate groups. */
export function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn("shrink-0 bg-border-subtle", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
      {...props}
    />
  )
}
