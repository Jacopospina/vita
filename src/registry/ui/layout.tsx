import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/registry/lib/utils"
import { useFlip } from "@/registry/hooks/use-flip"

/**
 * Layout primitives. Spacing scale (2·4·8·12·16·24·32·40·48·64·80·96·160 px).
 * Desktop-native rhythm. Gap names: none 0 · 3xs 2 · 2xs 4 · xs 6 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 32 · 3xl 48
 */
const gap = {
  none: "gap-0",
  "3xs": "gap-0.5",
  "2xs": "gap-1",
  xs: "gap-1.5",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-5",
  "2xl": "gap-8",
  "3xl": "gap-12",
} as const

const stackVariants = cva("flex", {
  variants: {
    direction: { column: "flex-col", row: "flex-row" },
    gap,
    align: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch", baseline: "items-baseline" },
    justify: { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" },
    wrap: { true: "flex-wrap", false: "" },
  },
  defaultVariants: { direction: "column", gap: "md", align: "stretch", justify: "start", wrap: false },
})

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackVariants> {
  asChild?: boolean
  /**
   * Opt in to layout glide (FLIP): children glide when items are added, removed or reordered (lists, threads,
   * stacks of chips). Off by default — static layout never moves; reflow (fonts, resizing) is instant.
   */
  flip?: boolean
}

/** Stack — vertical rhythm . The default container for anything laid out top-to-bottom. */
export function Stack({ className, direction, gap, align, justify, wrap, asChild, flip = false, ...props }: StackProps) {
  const Comp = asChild ? Slot.Root : "div"
  const ref = React.useRef<HTMLDivElement>(null)
  useFlip(ref, flip)
  return <Comp ref={ref} className={cn(stackVariants({ direction, gap, align, justify, wrap }), className)} {...props} />
}

/**
 * Inline — horizontal row of DIFFERENT components (a button and a status, a field and a toggletip):
 * vertically centred, 12px apart by default. Things that belong together touch instead — use Group.
 */
export function Inline({ gap = "md", align = "center", ...props }: Omit<StackProps, "direction">) {
  return <Stack direction="row" gap={gap} align={align} {...props} />
}

/**
 * Group — BELONGING HAS NO GAPS. Items that belong together touch: zero gap, shared edges,
 * only the outer corners rounded. Use for button sets, segmented actions, swatch strips, input + button.
 */
export function Group({ orientation = "horizontal", fill, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical"; fill?: boolean }) {
  return (
    <div
      role="group"
      className={cn(
        // The GROUP owns the shape: radius, clipping and the single outer outline.
        "flex w-fit gap-0 overflow-hidden squircle",
        // Children lose their own corners, borders and individual tilt; focus draws inside.
        "*:rounded-none *:[--corpus-squircle-r:0px] *:border-0 *:transform-none *:focus-visible:-outline-offset-2",
        // Outline-style members (tertiary, danger-tertiary) → one outline around the whole group.
        "has-[>.border-primary]:border has-[>.border-primary]:border-primary has-[>.border-error]:border has-[>.border-error]:border-error",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        fill && "*:flex-1",
        className,
      )}
      {...props}
    />
  )
}

/** Spacer — pushes siblings apart inside an Inline/Stack. */
export function Spacer() {
  return <div aria-hidden className="flex-1" />
}

/* ---------------- 16-column grid ---------------- */

// The gutter sets BOTH directions: the gap between rows always equals the gap between columns.
// rowGap is only an explicit override (e.g. "none" for flush rows).
const gridVariants = cva("grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16", {
  variants: {
    gutter: { wide: "gap-5", narrow: "gap-3", condensed: "gap-px" },
    rowGap: { none: "gap-y-0", md: "gap-y-3", lg: "gap-y-5" },
  },
  defaultVariants: { gutter: "wide" },
})

export interface GridProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof gridVariants> {}

/** Grid — 16 columns (lg) · 8 (md) · 4 (sm). Gutter (both directions): wide 20px for content, narrow 12px for dense data, condensed 1px for tiles. */
export function Grid({ className, gutter, rowGap, ...props }: GridProps) {
  return <div className={cn(gridVariants({ gutter, rowGap }), className)} {...props} />
}

type Span = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | "full"
const smSpan: Record<string, string> = { 1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4", full: "col-span-full" }
const mdSpan: Record<string, string> = { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 5: "md:col-span-5", 6: "md:col-span-6", 7: "md:col-span-7", 8: "md:col-span-8", full: "md:col-span-full" }
const lgSpan: Record<string, string> = {
  1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8",
  9: "lg:col-span-9", 10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12", 13: "lg:col-span-13", 14: "lg:col-span-14", 15: "lg:col-span-15", 16: "lg:col-span-16", full: "lg:col-span-full",
}

export interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  sm?: Span
  md?: Span
  lg?: Span
}

export function Column({ sm = "full", md, lg, className, ...props }: ColumnProps) {
  return <div className={cn(smSpan[String(sm)] ?? "col-span-full", md && mdSpan[String(md)], lg && lgSpan[String(lg)], className)} {...props} />
}

/** Container — page content width. `readable` caps line length (~70ch) for long-form content. */
export function Container({ width = "wide", className, ...props }: React.HTMLAttributes<HTMLDivElement> & { width?: "wide" | "readable" | "full" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-5",
        width === "wide" && "max-w-7xl",
        width === "readable" && "max-w-prose",
        className,
      )}
      {...props}
    />
  )
}
