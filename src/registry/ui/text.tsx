import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/registry/lib/utils"

/**
 * Text & Heading — typography roles.
 * Pick by ROLE, not by size: a page title is `title-1` even if you "want it bigger".
 */
const textVariants = cva("", {
  variants: {
    variant: {
      display: "text-display font-display",
      "large-title": "text-large-title font-display",
      "title-1": "text-title-1",
      "title-2": "text-title-2",
      "title-3": "text-title-3",
      headline: "text-headline",
      "body-lg": "text-body-lg",
      body: "text-body",
      footnote: "text-footnote",
      caption: "text-caption",
      code: "font-mono text-footnote",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      helper: "text-helper",
      primary: "text-primary",
      success: "text-success-foreground",
      warning: "text-warning-foreground",
      error: "text-error-foreground",
      inherit: "",
    },
    weight: { regular: "font-normal", medium: "font-medium", semibold: "font-semibold", auto: "" },
    truncate: { true: "truncate", false: "" },
  },
  defaultVariants: { variant: "body", tone: "default", weight: "auto", truncate: false },
})

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>

const defaultElement: Record<TextVariant, React.ElementType> = {
  display: "h1",
  "large-title": "h1",
  "title-1": "h1",
  "title-2": "h2",
  "title-3": "h3",
  headline: "h4",
  "body-lg": "p",
  body: "p",
  footnote: "p",
  caption: "span",
  code: "code",
}

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: React.ElementType
  asChild?: boolean
}

export function Text({ variant = "body", tone, weight, truncate, as, asChild, className, ...props }: TextProps) {
  const Comp: React.ElementType = asChild ? Slot.Root : (as ?? defaultElement[variant ?? "body"])
  return <Comp className={cn(textVariants({ variant, tone, weight, truncate }), className)} {...props} />
}

export interface HeadingProps extends Omit<TextProps, "variant"> {
  level?: 1 | 2 | 3 | 4
}

/** Heading — semantic level decides the role. Level 1 = page title, 2 = section, 3 = subsection, 4 = group label. */
export function Heading({ level = 2, as, ...props }: HeadingProps) {
  const variant = ({ 1: "title-1", 2: "title-2", 3: "title-3", 4: "headline" } as const)[level]
  return <Text variant={variant} as={as ?? (`h${level}` as React.ElementType)} {...props} />
}

export { textVariants }
