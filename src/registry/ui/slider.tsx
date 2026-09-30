import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"

/**
 * Slider — choose a value (or range) where relative position matters more than precision: volume, opacity, price range.
 * Always pair with a visible value; for exact entry add `withInput`.
 */
export interface SliderProps extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "onValueChange"> {
  label: React.ReactNode
  hideLabel?: boolean
  helperText?: React.ReactNode
  formatValue?: (v: number) => string
  onValueChange?: (value: number[]) => void
  /** Show min/max labels under the track. */
  showBounds?: boolean
}

export function Slider({ label, hideLabel, helperText, formatValue = String, showBounds = true, min = 0, max = 100, className, defaultValue, value, onValueChange, ...props }: SliderProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min])
  const current = value ?? inner
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className={cn("flex items-baseline justify-between", hideLabel && "sr-only")}>
        <Label id={id}>{label}</Label>
        <output aria-live="polite" className="text-footnote text-foreground tabular-nums">
          {current.map(formatValue).join(" – ")}
        </output>
      </div>
      <SliderPrimitive.Root
        aria-labelledby={id}
        min={min}
        max={max}
        value={current}
        onValueChange={(v) => {
          setInner(v)
          onValueChange?.(v)
        }}
        className="relative flex h-5 w-full touch-none items-center select-none data-[disabled]:opacity-50"
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {current.map((_, i) => (
          <SliderPrimitive.Thumb
            key={i}
            aria-label={current.length > 1 ? (i === 0 ? "Minimum" : "Maximum") : undefined}
            className="block size-4 rounded-full border-2 border-primary bg-background shadow-raised transition-transform duration-fast-01 ease-productive hover:scale-110 focus-ring active:scale-110"
          />
        ))}
      </SliderPrimitive.Root>
      {showBounds && (
        <div className="flex justify-between text-caption text-helper tabular-nums" aria-hidden>
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
      {helperText && <p className="text-caption text-helper">{helperText}</p>}
    </div>
  )
}
