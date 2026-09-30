import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"

/**
 * Toggle (switch) — a binary setting that takes effect IMMEDIATELY. No "Save" button after a toggle.
 * If the change only applies on submit → Checkbox.
 */
export interface ToggleProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  label: React.ReactNode
  hideLabel?: boolean
  helperText?: React.ReactNode
  /** Show "On/Off" state text next to the switch. Recommended when the label is a noun. */
  stateText?: boolean | { on: string; off: string }
  size?: "sm" | "md"
  labelPosition?: "start" | "end"
}

export function Toggle({ label, hideLabel, helperText, stateText, size = "md", labelPosition = "start", className, id: idProp, ...props }: ToggleProps) {
  const auto = React.useId()
  const id = idProp ?? auto
  const [on, setOn] = React.useState(props.checked ?? props.defaultChecked ?? false)
  const checked = props.checked ?? on
  const texts = typeof stateText === "object" ? stateText : { on: "On", off: "Off" }
  const labelEl = (
    <div className={cn("flex flex-col gap-0.5", hideLabel && "sr-only")}>
      <Label htmlFor={id} className="text-body font-normal">{label}</Label>
      {helperText && <p className="text-caption text-helper">{helperText}</p>}
    </div>
  )
  return (
    <div className={cn("flex items-center gap-3", labelPosition === "start" && "justify-between", className)}>
      {labelPosition === "start" && labelEl}
      <div className="flex items-center gap-2">
        <SwitchPrimitive.Root
          id={id}
          {...props}
          onCheckedChange={(v) => {
            setOn(v)
            props.onCheckedChange?.(v)
          }}
          className={cn(
            "peer inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-fast-02 ease-productive focus-ring",
            "bg-border-strong data-[state=checked]:bg-success disabled:cursor-not-allowed disabled:bg-layer-3",
            size === "md" ? "h-6 w-11" : "h-4 w-7",
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block rounded-full bg-background shadow-raised transition-transform duration-moderate-01 ease-spring",
              size === "md" ? "size-5 data-[state=checked]:translate-x-5" : "size-3 data-[state=checked]:translate-x-3",
            )}
          />
        </SwitchPrimitive.Root>
        {stateText && <span aria-hidden className="min-w-6 text-footnote text-muted-foreground">{checked ? texts.on : texts.off}</span>}
      </div>
      {labelPosition === "end" && labelEl}
    </div>
  )
}
