import * as React from "react"
import { RadioGroup as RadioPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"

/**
 * RadioGroup — exactly ONE choice from 2–6 visible options. All options visible = faster decisions (Hick's law).
 * >6 options → Dropdown/Select. Binary on/off → Toggle or Checkbox.
 */
export interface RadioGroupProps extends React.ComponentProps<typeof RadioPrimitive.Root> {
  legend: React.ReactNode
  hideLegend?: boolean
  helperText?: React.ReactNode
  invalid?: boolean
  invalidText?: React.ReactNode
}

export function RadioGroup({ legend, hideLegend, helperText, invalid, invalidText, orientation = "vertical", className, children, ...props }: RadioGroupProps) {
  const id = React.useId()
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${id}-legend`} className={cn("text-footnote font-medium text-foreground", hideLegend && "sr-only")}>
        {legend}
      </span>
      <RadioPrimitive.Root
        aria-labelledby={`${id}-legend`}
        aria-invalid={invalid || undefined}
        orientation={orientation}
        className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-6")}
        {...props}
      >
        {children}
      </RadioPrimitive.Root>
      {(invalid && invalidText) || helperText ? (
        <p className={cn("text-caption", invalid ? "text-error-foreground" : "text-helper")}>{invalid ? invalidText : helperText}</p>
      ) : null}
    </div>
  )
}

export interface RadioButtonProps extends React.ComponentProps<typeof RadioPrimitive.Item> {
  label: React.ReactNode
  helperText?: React.ReactNode
}

export function RadioButton({ label, helperText, className, id: idProp, ...props }: RadioButtonProps) {
  const auto = React.useId()
  const id = idProp ?? auto
  return (
    <div className={cn("flex items-start gap-2", className)}>
      <RadioPrimitive.Item
        id={id}
        className={cn(
          "peer mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-field",
          "transition-colors duration-fast-01 ease-productive focus-ring",
          "data-[state=checked]:border-primary disabled:cursor-not-allowed disabled:border-disabled-foreground",
        )}
        {...props}
      >
        <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary data-[disabled]:bg-disabled-foreground" />
      </RadioPrimitive.Item>
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-body font-normal peer-disabled:text-disabled-foreground">
          {label}
        </Label>
        {helperText && <p className="text-caption text-helper">{helperText}</p>}
      </div>
    </div>
  )
}
