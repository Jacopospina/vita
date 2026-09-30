import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"
import { AnimatedText } from "@/registry/ui/animated"

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
            // Squircle track; the knob inside is concentric (its radius = track radius − the 2px padding).
            "group/switch peer inline-flex shrink-0 cursor-pointer items-center squircle p-0.5 duration-fast-02 ease-productive focus-ring [--corpus-squircle-r:var(--corpus-radius-sm)]",
            "bg-border-strong data-[state=checked]:bg-success disabled:cursor-not-allowed disabled:bg-layer-3",
            size === "md" ? "h-6 w-11" : "h-4 w-7",
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block squircle bg-background shadow-raised duration-moderate-01 ease-spring [--corpus-squircle-r:calc(var(--corpus-radius-sm)-2px)]",
              // A rectangle knob (wider than tall). Press: it stretches toward where it will travel (anchored on its
              // resting side); release: springs back.
              size === "md"
                ? "h-5 w-6 data-[state=checked]:translate-x-4 group-active/switch:w-7 group-active/switch:data-[state=checked]:translate-x-3"
                : "h-3 w-4 data-[state=checked]:translate-x-2 group-active/switch:w-5 group-active/switch:data-[state=checked]:translate-x-1",
            )}
          />
        </SwitchPrimitive.Root>
        {stateText && <span aria-hidden className="min-w-6 text-footnote text-muted-foreground"><AnimatedText>{checked ? texts.on : texts.off}</AnimatedText></span>}
      </div>
      {labelPosition === "end" && labelEl}
    </div>
  )
}
