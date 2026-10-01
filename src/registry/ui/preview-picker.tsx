import * as React from "react"
import { RadioGroup as RadioPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * PreviewPicker: choose one option by seeing what it does. Each option is a small tile that SHOWS its effect (a
 * corner, a spacing, a size, a speed) with a short name under it; form follows function, so nobody has to translate
 * a number into a feeling. One row, equal tiles; the chosen one is ringed, and its name sits beside the label.
 *
 *   <PreviewPicker label="Corner radius" value={v} onValueChange={setV}
 *     items={[{ value: "0", label: "Square", preview: <Corner r={0} /> }, …]} />
 *
 * Keyboard: arrows move and choose, like any radio group.
 * Not for: colours → SwatchPicker; options that are words, not effects → ContentSwitcher or RadioGroup.
 */
export interface PreviewItem {
  value: string
  label: string
  /** What choosing it looks like (drawn inside the tile). */
  preview: React.ReactNode
}

export interface PreviewPickerProps {
  label: React.ReactNode
  items: PreviewItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  hideLabel?: boolean
  className?: string
}

export function PreviewPicker({ label, items, value, defaultValue, onValueChange, hideLabel, className }: PreviewPickerProps) {
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
        className="grid auto-cols-fr grid-flow-col gap-1.5"
      >
        {items.map((item) => (
          <RadioPrimitive.Item
            key={item.value}
            value={item.value}
            aria-label={item.label}
            className={cn(
              "group flex min-w-0 flex-col items-center gap-1 rounded-inner-1 p-1 text-caption text-muted-foreground focus-ring",
              "duration-moderate-02 ease-expressive hover:bg-hover",
              "aria-checked:text-foreground",
            )}
          >
            <span aria-hidden className="flex h-10 w-full items-center justify-center overflow-hidden rounded-inner-2 bg-layer-2 text-foreground duration-moderate-02 ease-expressive group-aria-checked:bg-background group-aria-checked:shadow-[inset_0_0_0_2px_var(--vita-foreground)]">
              {item.preview}
            </span>
            <span className="w-full truncate text-center">{item.label}</span>
          </RadioPrimitive.Item>
        ))}
      </RadioPrimitive.Root>
    </div>
  )
}
