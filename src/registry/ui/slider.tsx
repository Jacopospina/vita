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
}

export function Slider({ label, hideLabel, helperText, formatValue = String, showBounds = true, min = 0, max = 100, className, defaultValue, value, onValueChange, onValueCommit, onPointerDown, ...props }: SliderProps) {
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
        className={cn("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50", single ? "h-7" : "h-5")}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-border">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {current.map((v, i) => (
          <SliderPrimitive.Thumb
            key={i}
            // The knob needs its own name: the slider's label for one knob, Minimum / Maximum for a range.
            aria-labelledby={single ? id : undefined}
            aria-label={single ? undefined : i === 0 ? "Minimum" : "Maximum"}
            aria-valuetext={formatValue(v)}
            className={cn(
              "relative tap block rounded-full border-2 border-primary bg-background shadow-raised duration-moderate-01 ease-productive focus-ring",
              single ? "flex h-6 items-center justify-center text-caption text-foreground" : "size-4 hover:scale-110 active:scale-110",
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
 * knob only lands on the steps, the current step's name rides in the knob, and every step is named (and clickable)
 * under the track. Same content at a different scale → StepSlider; different content → Tabs or ContentSwitcher.
 *
 *   <StepSlider label="Size" steps={[{ value: "md", label: "48" }, { value: "lg", label: "64" }]} value={size} onValueChange={setSize} />
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
        disabled={disabled}
      />
      {/* Every step, named where it sits on the track; a click lands the knob there. */}
      <div aria-hidden className="relative h-5 text-caption text-helper">
        {steps.map((s, i) => (
          <button
            key={s.value}
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={() => choose(i)}
            className={cn(
              "absolute top-0 rounded-sm px-1 whitespace-nowrap duration-fast-02 hover:text-foreground",
              i === index && "font-medium text-foreground",
              i === 0 ? "left-0" : i === last ? "right-0" : "-translate-x-1/2",
            )}
            style={i === 0 || i === last ? undefined : { left: `${(i / last) * 100}%` }}
          >
            {s.label}
          </button>
        ))}
      </div>
      {helperText && <p className="text-caption text-helper">{helperText}</p>}
    </div>
  )
}
