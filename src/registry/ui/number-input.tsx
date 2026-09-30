import * as React from "react"
import { Add, Subtract } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"

/**
 * NumberInput — precise numeric entry with steppers. For a range where precision matters less than feel, use Slider.
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

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className, id, value, defaultValue = null, onValueChange, min, max, step = 1, size = "md", unit, disabled, readOnly, ...props }, ref) => {
    const [val, setVal] = useControllable<number | null>(value, defaultValue, onValueChange)
    const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))
    const bump = (dir: 1 | -1) => setVal(clamp(Number(((val ?? 0) + dir * step).toFixed(10))))
    const outOfRange = val !== null && ((min !== undefined && val < min) || (max !== undefined && val > max))
    const stepBtn = "flex w-control-sm items-center justify-center text-muted-foreground transition-colors hover:bg-hover hover:text-foreground focus-ring-inset disabled:text-disabled-foreground disabled:hover:bg-transparent"
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
              value={val ?? ""}
              onChange={(e) => setVal(e.target.value === "" ? null : Number(e.target.value))}
              className={cn(fieldClasses, fieldSize[size], "tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none", "pr-20")}
            />
            {unit && <span className="pointer-events-none absolute top-1/2 right-20 -translate-y-1/2 pr-2 text-body text-muted-foreground">{unit}</span>}
            {!readOnly && (
              <div className="absolute inset-y-px right-px flex overflow-hidden rounded-r-md">
                <button type="button" tabIndex={-1} aria-label="Decrement" disabled={disabled || (min !== undefined && (val ?? 0) <= min)} onClick={() => bump(-1)} className={stepBtn}>
                  <Icon as={Subtract} />
                </button>
                <span aria-hidden className="my-2 w-px bg-border-subtle" />
                <button type="button" tabIndex={-1} aria-label="Increment" disabled={disabled || (max !== undefined && (val ?? 0) >= max)} onClick={() => bump(1)} className={stepBtn}>
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
