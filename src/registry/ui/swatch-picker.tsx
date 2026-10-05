import * as React from "react"
import { RadioGroup as RadioPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Tooltip } from "@/registry/ui/tooltip"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * SwatchPicker: choose one colour from a small set of circles. You see every option at once and pick the one you
 * recognise; the chosen colour's name sits next to the label. A ring eases onto the chosen circle.
 *
 *   <SwatchPicker label="Brand colour" value={v} onValueChange={setV} items={[{ value: "blue", label: "Blue", color: "oklch(0.6 0.22 257)" }]} />
 *
 * One row, every circle the same diameter (24px small, 32px medium). Keyboard: arrows move and choose, like any radio group. Each circle has its name as tooltip and accessible name.
 * Not for: a precise, continuous colour (hex, any hue) → a Slider or text field; more than ~14 colours → Dropdown.
 */
export interface SwatchItem {
  value: string
  label: string
  /** Any CSS colour (oklch, a palette variable, hex). */
  color: string
}

export interface SwatchPickerProps {
  label: React.ReactNode
  items: SwatchItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: "sm" | "md"
  /** Hide the visible label (still announced). */
  hideLabel?: boolean
  className?: string
}

export function SwatchPicker({ label, items, value, defaultValue, onValueChange, size = "md", hideLabel, className }: SwatchPickerProps) {
  const id = React.useId()
  const [own, setOwn] = React.useState(defaultValue ?? items[0]?.value)
  const current = value ?? own
  const chosen = items.find((i) => i.value === current)
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${id}-label`} className={cn("flex items-baseline gap-1.5 text-footnote font-medium text-foreground", hideLabel && "sr-only")}>
        {label}
        {chosen && <span className="font-normal text-muted-foreground"><AnimatedText>{chosen.label}</AnimatedText></span>}
      </span>
      <RadioPrimitive.Root
        aria-labelledby={`${id}-label`}
        orientation="horizontal"
        loop
        value={current}
        onValueChange={(v) => {
          if (value === undefined) setOwn(v)
          onValueChange?.(v)
        }}
        // One row, always, and every circle the same diameter: a fixed size small enough for a dozen-odd colours.
        className="flex flex-nowrap gap-1"
      >
        {items.map((item) => (
          <Tooltip key={item.value} content={item.label}>
            <RadioPrimitive.Item
              value={item.value}
              aria-label={item.label}
              className={cn(
                "group tap relative shrink-0 rounded-full p-0.5 focus-ring",
                size === "sm" ? "size-6" : "size-8",
              )}
            >
              {/* The ring is the circle's own outline, so ring and colour always share one centre (a ring on the
                  button and a scaled circle inside it snap to different pixels at fractional sizes). A hairline on
                  hover; on the chosen circle it grows, with a gap, as the circle steps in. aria-checked, not
                  data-state: the Tooltip trigger writes its own data-state on the same element. */}
              <span
                aria-hidden
                className={cn(
                  "block size-full rounded-full shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--vita-foreground)_12%,transparent)] duration-moderate-02 ease-expressive",
                  "outline-[1.5px] outline-offset-[0.5px] outline-transparent group-hover:outline-(--vita-border-strong)",
                  "group-aria-checked:scale-90 group-aria-checked:outline-[2.25px] group-aria-checked:outline-offset-[1.25px] group-aria-checked:outline-(--vita-foreground)",
                )}
                style={{ backgroundColor: item.color }}
              />
            </RadioPrimitive.Item>
          </Tooltip>
        ))}
      </RadioPrimitive.Root>
    </div>
  )
}
