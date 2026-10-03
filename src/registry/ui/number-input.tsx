import * as React from "react"
import { Add, Subtract } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"
import { AnimatedNumber } from "@/registry/ui/animated"

/**
 * NumberInput, precise numeric entry with steppers. For a range where precision matters less than feel, use Slider.
 * For IDs, phone numbers, card numbers → TextInput with inputMode="numeric" (they are not quantities).
 */
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "type">, FieldBaseProps {
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  size?: FieldSize
  /** Unit shown inside the field, e.g. "kg", "%". */
  unit?: string
}

/** Held this long, a press starts repeating: longer than any tap (so rapid taps step once each), short enough to
    feel immediate. */
const HOLD_MS = 380

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className, id, value, defaultValue = null, onValueChange, min, max, step = 1, size = "md", unit, disabled, readOnly, ...props }, ref) => {
    const [val, setVal] = useControllable<number | null>(value, defaultValue, onValueChange)
    const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
    // Values swap digit by digit: stepper/arrow changes show a rolling overlay over the (transparent) input text.
    // While the user TYPES, the raw input shows, typing is never delayed or animated.
    const [typing, setTyping] = React.useState(false)
    // Latest value for press-and-hold repeats (the interval must not read a stale closure).
    const latest = React.useRef(val)
    React.useEffect(() => {
      latest.current = val
    }, [val])
    const bump = (dir: 1 | -1) => {
      setTyping(false)
      const next = clamp(Number(((latest.current ?? 0) + dir * step).toFixed(10)))
      latest.current = next
      setVal(next)
    }
    // Press-and-hold: one step at once; held past HOLD_MS it keeps stepping, accelerating, until release or a bound.
    const hold = React.useRef<number[]>([])
    const stop = () => {
      hold.current.forEach((t) => window.clearTimeout(t))
      hold.current = []
    }
    const release = stop
    React.useEffect(() => stop, [])
    const press = (dir: 1 | -1) => (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault() // keep focus where it is
      // The press stays with this button even if the finger drifts a little: the hold keeps going until it lifts.
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* the pointer may already be gone */ }
      stop()
      bump(dir)
      // A hold, like a phone's stepper: one step now, a pause long enough that a tap never double-steps (HOLD_MS),
      // then steady steps that speed up the longer you hold.
      let delay = 150
      const repeat = () => {
        const at = latest.current ?? 0
        if ((dir > 0 && max !== undefined && at >= max) || (dir < 0 && min !== undefined && at <= min)) return stop()
        bump(dir)
        delay = Math.max(40, delay * 0.88)
        hold.current.push(window.setTimeout(repeat, delay))
      }
      hold.current.push(window.setTimeout(repeat, HOLD_MS))
    }
    const holdProps = (dir: 1 | -1) => ({
      onPointerDown: press(dir),
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
      // A long press is a hold, never the browser's: no context menu, no callout, no text selection.
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      // Keyboard / assistive tech activation (no pointer): a single step.
      onClick: (e: React.MouseEvent) => {
        if (e.detail === 0) bump(dir)
      },
    })
    const rolling = !typing && val !== null
    const outOfRange = val !== null && ((min !== undefined && val < min) || (max !== undefined && val > max))
    // Square steppers: width follows the field height at every size.
    // touch-none: the hold is the button's (no scroll, no pointercancel); select-none + no callout: a long press never
    // selects the field's number or opens the browser's menu.
    const stepBtn = "flex aspect-square h-full touch-none items-center justify-center text-muted-foreground select-none [-webkit-touch-callout:none] hover:bg-hover hover:text-foreground focus-ring-inset disabled:text-disabled-foreground disabled:hover:bg-transparent"
    return (
      <FieldShell {...{ id, label, hideLabel, helperText, invalid: invalid || outOfRange, invalidText: invalidText ?? (outOfRange ? `Enter a value from ${min ?? "−∞"} to ${max ?? "∞"}` : undefined), warn, warnText, optional, labelAddon, className }}>
        {(a11y) => (
          <div className="relative flex">
            <input
              ref={ref}
              type="number"
              inputMode="decimal"
              {...a11y}
              {...props}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={props.placeholder ?? " "}
              value={val ?? ""}
              onChange={(e) => setVal(e.target.value === "" ? null : Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") setTyping(false)
                else if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") setTyping(true)
                props.onKeyDown?.(e)
              }}
              onBlur={(e) => {
                setTyping(false)
                props.onBlur?.(e)
              }}
              className={cn(fieldClasses, fieldSize[size], "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none", "pr-20", rolling && "text-transparent caret-foreground")}
            />
            {rolling && (
              // Same box, padding and type as the input, so the rolling digits sit exactly on the real text.
              <span aria-hidden className={cn(fieldSize[size], "pointer-events-none absolute inset-y-0 left-0 flex items-center border border-transparent text-body text-foreground tabular-nums", disabled && "text-disabled-foreground")}>
                <AnimatedNumber value={val} format={{ maximumFractionDigits: 10, useGrouping: false }} />
              </span>
            )}
            {unit && <span className="pointer-events-none absolute top-1/2 right-20 -translate-y-1/2 pr-2 text-body text-muted-foreground">{unit}</span>}
            {!readOnly && (
              <div className="absolute inset-y-px right-px flex overflow-hidden rounded-r-md select-none [-webkit-touch-callout:none]">
                <button type="button" tabIndex={-1} aria-label="Decrement" disabled={disabled || (min !== undefined && (val ?? 0) <= min)} {...holdProps(-1)} className={stepBtn}>
                  <Icon as={Subtract} />
                </button>
                <span aria-hidden className="w-px self-stretch bg-border-subtle" />
                <button type="button" tabIndex={-1} aria-label="Increment" disabled={disabled || (max !== undefined && (val ?? 0) >= max)} {...holdProps(1)} className={stepBtn}>
                  <Icon as={Add} />
                </button>
              </div>
            )}
          </div>
        )}
      </FieldShell>
    )
  },
)
NumberInput.displayName = "NumberInput"
