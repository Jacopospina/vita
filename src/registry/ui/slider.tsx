import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"
import { AnimatedNumber, AnimatedText } from "@/registry/ui/animated"

/**
 * Slider, choose a value (or range) where relative position matters more than precision: volume, opacity, price range.
 * Always pair with a visible value; for exact entry add `withInput`.
 * Single value → the value lives IN the knob (the eye is already there). Range → both values beside the label.
 */
export interface SliderProps extends Omit<React.ComponentProps<typeof SliderPrimitive.Root>, "onValueChange"> {
  label: React.ReactNode
  hideLabel?: boolean
  helperText?: React.ReactNode
  formatValue?: (v: number) => string
  onValueChange?: (value: number[]) => void
  /** Show min/max labels under the track. */
  showBounds?: boolean
  /** Number of step positions; shows dots on the track at each stop (StepSlider). */
  segments?: number
}

export function Slider({ label, hideLabel, helperText, formatValue = String, showBounds = true, segments, min = 0, max = 100, className, defaultValue, value, onValueChange, onValueCommit, onPointerDown, ...props }: SliderProps) {
  const id = React.useId()
  const [inner, setInner] = React.useState<number[]>(defaultValue ?? [min])
  const current = value ?? inner
  const single = current.length === 1
  // While dragging, the value pops out ABOVE the knob (the finger/pointer would hide it); on release it drops back in.
  const [dragging, setDragging] = React.useState(false)
  React.useEffect(() => {
    if (!dragging) return
    const end = () => setDragging(false)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
    return () => {
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
    }
  }, [dragging])
  // Values always swap digit by digit (AnimatedText rolls numeric strings).
  const shown = (v: number) => (formatValue === String ? <AnimatedNumber value={v} /> : <AnimatedText>{formatValue(v)}</AnimatedText>)
  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className={cn("flex items-baseline justify-between", hideLabel && "sr-only")}>
        <Label id={id}>{label}</Label>
        {!single && (
          <output aria-live="polite" className="text-footnote text-foreground tabular-nums">
            {current.map((v, i) => <React.Fragment key={i}>{i > 0 && " – "}{shown(v)}</React.Fragment>)}
          </output>
        )}
      </div>
      <div className="relative">
      <SliderPrimitive.Root
        aria-labelledby={id}
        min={min}
        max={max}
        value={current}
        onValueChange={(v) => {
          setInner(v)
          onValueChange?.(v)
        }}
        onValueCommit={(v) => {
          setDragging(false)
          onValueCommit?.(v)
        }}
        onPointerDown={(e) => {
          if (single) setDragging(true)
          onPointerDown?.(e)
        }}
        className={cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50", single ? "h-7" : "h-5", segments && segments > 1 && "px-2.5")}
        {...props}
      >
        <SliderPrimitive.Track className={cn("relative grow rounded-full bg-border", segments && segments > 1 ? "h-3" : "h-1")}>
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
        </SliderPrimitive.Track>
        {segments && segments > 1 && (
          <div aria-hidden className="pointer-events-none absolute inset-x-2.5 top-1/2 flex -translate-y-1/2 justify-between px-1">
            {Array.from({ length: segments }, (_, i) => (
              <span key={i} className="size-1.5 rounded-full" style={{ backgroundColor: "#fff" }} />
            ))}
          </div>
        )}
        {current.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            // The knob needs its own name: the slider's label for one knob, Minimum / Maximum for a range.
            aria-labelledby={single ? id : undefined}
            aria-label={single ? undefined : i === 0 ? "Minimum" : "Maximum"}
            aria-valuetext={formatValue(v)}
            className={cn(
              "relative tap block rounded-full border-2 border-primary bg-background shadow-raised duration-moderate-01 ease-productive focus-ring",
              // w-max: the knob hugs its label wherever it sits. At the track's end it has almost no room, and a
              // shrink-to-fit knob would collapse its label to nothing, leaving the word spilling over the border.
              single ? "flex h-6 w-max items-center justify-center text-caption text-foreground" : "size-4 hover:scale-110 active:scale-110",
              single && (dragging ? "min-w-6 px-0" : "min-w-8 px-1.5"), // dragging: a perfect 24px circle
            )}
          >
            {single && (
              <>
                {/* Sizer: keeps the knob wide enough for the value while it rests inside; collapses while it's out. */}
                <span aria-hidden className={cn("reveal-x duration-moderate-01 ease-productive", !dragging && "reveal-x-open")}>
                  <span>
                    <span className="invisible">{formatValue(v)}</span>
                  </span>
                </span>
                {/* The value itself. Out: springs up into a bubble 4px above the knob (expressive). Back: drops into the knob (productive). */}
                <span
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-1/2 origin-bottom -translate-x-1/2 -translate-y-1/2 rounded-full whitespace-nowrap",
                    dragging
                      ? "translate-y-[calc(-100%-var(--spacing)*4)] scale-110 bg-inverse px-2 py-0.5 text-inverse-foreground shadow-overlay duration-moderate-02 ease-spring"
                      : "bg-transparent px-0 py-0 text-foreground shadow-none duration-moderate-01 ease-productive",
                  )}
                >
                  {shown(v)}
                </span>
              </>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      </div>
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

/**
 * StepSlider, choose one of a few ORDERED steps of the same thing: a size, a density, a level. Not free-form: the
 * knob only lands on the steps, and the current step's name rides in the knob. Name steps by what people choose
 * ("Small", "Large"), not by the number behind them. Same content at a different scale → StepSlider; different
 * content → Tabs or ContentSwitcher.
 *
 *   <StepSlider label="Size" steps={[{ value: "md", label: "Small" }, { value: "lg", label: "Medium" }]} value={size} onValueChange={setSize} />
 */
export interface StepSliderProps {
  label: React.ReactNode
  steps: { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  hideLabel?: boolean
  helperText?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function StepSlider({ label, steps, value, defaultValue, onValueChange, hideLabel, helperText, disabled, className }: StepSliderProps) {
  const [own, setOwn] = React.useState(defaultValue ?? steps[0]?.value)
  const current = value ?? own
  const index = Math.max(0, steps.findIndex((s) => s.value === current))
  const last = Math.max(1, steps.length - 1)
  const choose = (i: number) => {
    const v = steps[i]?.value
    if (v === undefined || v === current) return
    if (value === undefined) setOwn(v)
    onValueChange?.(v)
  }
  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <Slider
        label={label}
        hideLabel={hideLabel}
        min={0}
        max={last}
        step={1}
        value={[index]}
        onValueChange={([i]) => choose(i)}
        formatValue={(i) => steps[i]?.label ?? ""}
        showBounds={false}
        segments={steps.length}
        disabled={disabled}
      />
      {helperText && <p className="text-caption text-helper">{helperText}</p>}
    </div>
  )
}
