import * as React from "react"
import { RadioGroup as RadioPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label, FieldMessage } from "@/registry/ui/form"

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
      <FieldMessage kind={invalid && invalidText ? "error" : "help"}>{invalid && invalidText ? invalidText : helperText}</FieldMessage>
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
          "peer relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-border-strong bg-field",
          "duration-moderate-02 ease-productive focus-ring active:scale-90",
          "data-[state=checked]:border-primary data-[state=checked]:ease-expressive",
          "disabled:cursor-not-allowed disabled:border-disabled-foreground",
          "aria-invalid:border-error aria-invalid:[--corpus-ring:var(--corpus-error)]",
        )}
        {...props}
      >
        {/*
          Always mounted so BOTH directions choreograph.
          Select (expressive):  the fill disc springs out from the centre → the dot pops in, blur → sharp.
          Deselect (productive): the dot shrinks first → the disc shrinks back into the centre, revealing the empty ring.
        */}
        <RadioPrimitive.Indicator
          forceMount
          className={cn(
            "group/ind absolute -inset-px flex scale-0 items-center justify-center rounded-full bg-primary opacity-0 delay-75 duration-moderate-02 ease-productive",
            "data-[state=checked]:scale-100 data-[state=checked]:opacity-100 data-[state=checked]:delay-0 data-[state=checked]:ease-spring",
            "data-[disabled]:bg-disabled-foreground",
          )}
        >
          <span className="size-1.5 scale-0 rounded-full bg-primary-foreground opacity-0 blur-xs duration-moderate-01 ease-productive group-data-[state=checked]/ind:scale-100 group-data-[state=checked]/ind:opacity-100 group-data-[state=checked]/ind:blur-none group-data-[state=checked]/ind:delay-75 group-data-[state=checked]/ind:ease-spring" />
        </RadioPrimitive.Indicator>
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
