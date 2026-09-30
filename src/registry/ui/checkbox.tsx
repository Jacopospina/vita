import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { DrawnMark } from "@/registry/ui/icon"
import { Label, FieldMessage } from "@/registry/ui/form"

/**
 * Checkbox — independent on/off choices that take effect on SUBMIT, or multi-select from a list.
 * Instant effect (a setting) → Toggle. Exactly one of many → Radio.
 */
export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  invalid?: boolean
}

export function Checkbox({ label, helperText, invalid, className, id: idProp, ...props }: CheckboxProps) {
  const [checkedState, setCheckedState] = React.useState(props.defaultChecked ?? false)
  const auto = React.useId()
  const id = idProp ?? auto
  const box = (
    <CheckboxPrimitive.Root
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={helperText ? `${id}-help` : undefined}
      className={cn(
        "peer mt-0.5 flex size-4 shrink-0 items-center justify-center squircle border border-border-strong bg-field [--corpus-squircle-r:22%]", // same proportional squircle as IconPlaceholder
        " duration-fast-01 ease-productive focus-ring",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:border-disabled-foreground disabled:data-[state=checked]:bg-disabled-foreground",
        "aria-invalid:border-error",
        !label && className,
      )}
      {...props}
      onCheckedChange={(c) => {
        setCheckedState(c)
        props.onCheckedChange?.(c)
      }}
    >
      {/* Always mounted: the mark scales in AND out (checked ↔ indeterminate cross-fade). */}
      {/* Always mounted: the check DRAWS its path in, and un-draws on clear; indeterminate draws a dash. */}
      <CheckboxPrimitive.Indicator forceMount className="relative flex size-full items-center justify-center">
        <DrawnMark kind="check" on={props.checked === true || (props.checked === undefined && checkedState === true)} className="absolute size-3.5" />
        <DrawnMark kind="dash" on={props.checked === "indeterminate"} className="absolute size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
  if (!label) return box
  return (
    <div className={cn("flex items-start gap-2", className)}>
      {box}
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-body font-normal peer-disabled:text-disabled-foreground">
          {label}
        </Label>
        {helperText && (
          <p id={`${id}-help`} className="text-caption text-helper">
            {helperText}
          </p>
        )}
      </div>
    </div>
  )
}

/** CheckboxGroup — a labelled set. Use a FormGroup-like legend so screen readers announce the question. */
export function CheckboxGroup({ legend, helperText, invalid, invalidText, orientation = "vertical", className, children }: {
  legend: React.ReactNode
  helperText?: React.ReactNode
  invalid?: boolean
  invalidText?: React.ReactNode
  orientation?: "vertical" | "horizontal"
  className?: string
  children: React.ReactNode
}) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)} aria-invalid={invalid || undefined}>
      <legend className="mb-1 text-footnote font-medium text-foreground">{legend}</legend>
      <div className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6")}>{children}</div>
      <FieldMessage kind={invalid && invalidText ? "error" : "help"}>{invalid && invalidText ? invalidText : helperText}</FieldMessage>
    </fieldset>
  )
}
