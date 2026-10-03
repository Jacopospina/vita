import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Label } from "@/registry/ui/form"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Toggle (switch), a binary setting that takes effect IMMEDIATELY. No "Save" button after a toggle.
 * If the change only applies on submit → Checkbox.
 * Tap to flip, or hold and drag: the knob follows the finger across the track and lands on the side it was left
 * nearest to, like a phone's switch. Keyboard (Space, Enter) unchanged.
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

/** Moving this far is a drag, not a tap. */
const DRAG_PX = 3

export function Toggle({ label, hideLabel, helperText, stateText, size = "md", labelPosition = "start", className, id: idProp, ...props }: ToggleProps) {
  const auto = React.useId()
  const id = idProp ?? auto
  const [on, setOn] = React.useState(props.checked ?? props.defaultChecked ?? false)
  const checked = props.checked ?? on
  const texts = typeof stateText === "object" ? stateText : { on: "On", off: "Off" }
  const commit = (v: boolean) => {
    setOn(v)
    props.onCheckedChange?.(v)
  }
  // Hold and drag: the knob tracks the pointer (an inline translate, no transition); on release it springs to the
  // nearer side, and the tap's own click is swallowed so the switch doesn't flip back.
  const knob = React.useRef<HTMLSpanElement>(null)
  const dragged = React.useRef(false)
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    props.onPointerDown?.(e)
    if (e.button !== 0 || props.disabled) return
    const track = e.currentTarget
    const id = e.pointerId
    const startX = e.clientX
    let moved = false
    let x = 0
    const travel = () => {
      const k = knob.current
      return k ? track.clientWidth - k.offsetLeft * 2 - k.offsetWidth : 0
    }
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      const dx = ev.clientX - startX
      if (!moved && Math.abs(dx) < DRAG_PX) return
      if (!moved) {
        moved = true
        try { track.setPointerCapture(id) } catch { /* the pointer may already be gone */ }
      }
      const t = travel()
      x = Math.max(0, Math.min(t, (checked ? t : 0) + dx))
      const k = knob.current
      if (k) {
        k.style.transition = "none"
        // `translate`, not `transform`: the resting classes (translate-x-*) set `translate`, so a `transform` would add
        // on top of them and push an "on" knob out of the track. The inline value replaces them while dragging.
        k.style.translate = `${x}px 0`
      }
    }
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (!moved) return
      try { track.releasePointerCapture(id) } catch { /* already released */ }
      const k = knob.current
      if (k) {
        k.style.transition = ""
        k.style.translate = ""
      }
      dragged.current = true
      const next = x > travel() / 2
      if (next !== checked) commit(next)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
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
          // Always controlled from here: a drag decides the state as much as a tap does.
          checked={checked}
          onCheckedChange={commit}
          onPointerDown={onPointerDown}
          onClick={(e) => {
            props.onClick?.(e)
            // A drag already decided the state: the click that ends the same press must not flip it again.
            if (dragged.current) {
              dragged.current = false
              e.preventDefault()
            }
          }}
          className={cn(
            // Squircle track; the knob inside is concentric (its radius = track radius − the 2px padding).
            // Sideways touches belong to the switch (the drag); up and down stays the page's.
            "group/switch peer relative tap inline-flex shrink-0 cursor-pointer touch-pan-y items-center squircle p-0.5 duration-fast-02 ease-productive focus-ring [--vita-squircle-r:var(--vita-radius-sm)]",
            "bg-border-strong data-[state=checked]:bg-success disabled:cursor-not-allowed disabled:bg-layer-3",
            // Hover, on and off: the track moves a step toward the text colour (darker in light, lighter in dark).
            "enabled:hover:bg-[color-mix(in_oklab,var(--vita-border-strong)_80%,var(--vita-foreground))]",
            "enabled:data-[state=checked]:hover:bg-[color-mix(in_oklab,var(--vita-success)_85%,var(--vita-foreground))]",
            size === "md" ? "h-6 w-10" : "h-4 w-7",
          )}
        >
          <SwitchPrimitive.Thumb
            ref={knob}
            className={cn(
              "pointer-events-none block squircle bg-background shadow-raised duration-moderate-01 ease-spring [--vita-squircle-r:calc(var(--vita-radius-sm)-2px)]",
              // A slim rectangle knob (half as wide as tall-ish: 12×20 md, 8×12 sm). Press: it stretches toward where it will travel (anchored on its
              // resting side); release: springs back.
              size === "md"
                ? "h-5 w-3 data-[state=checked]:translate-x-6 group-active/switch:w-4 group-active/switch:data-[state=checked]:translate-x-5"
                : "h-3 w-2 data-[state=checked]:translate-x-4 group-active/switch:w-3 group-active/switch:data-[state=checked]:translate-x-3",
            )}
          />
        </SwitchPrimitive.Root>
        {stateText && <span aria-hidden className="min-w-6 text-footnote text-muted-foreground"><AnimatedText>{checked ? texts.on : texts.off}</AnimatedText></span>}
      </div>
      {labelPosition === "end" && labelEl}
    </div>
  )
}
