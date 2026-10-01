import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { Launch } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

/** Link, navigation. If it changes data, it's a Button, not a Link. */
const linkVariants = cva(
  "inline-flex items-center gap-1 rounded-sm text-link underline-offset-4 duration-fast-02 ease-productive focus-ring underline decoration-transparent hover:decoration-current visited:text-link-visited",
  {
    variants: {
      size: { sm: "text-footnote", md: "text-body", lg: "text-body-lg" },
      inline: { true: "decoration-current", false: "" },
      disabled: { true: "pointer-events-none text-disabled-foreground decoration-transparent", false: "" },
    },
    defaultVariants: { size: "md", inline: false, disabled: false },
  },
)

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  asChild?: boolean
  /** Opens in a new tab with the launch icon + accessible hint. */
  external?: boolean
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, size, inline, disabled, asChild, external, children, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "a"
    return (
      <Comp
        ref={ref}
        className={cn(linkVariants({ size, inline, disabled }), className)}
        aria-disabled={disabled || undefined}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
        {...props}
      >
        {asChild ? children : (
          <>
            {children}
            {external && (
              <>
                <Icon as={Launch} size="sm" />
                <span className="sr-only">(opens in a new tab)</span>
              </>
            )}
          </>
        )}
      </Comp>
    )
  },
)
Link.displayName = "Link"
