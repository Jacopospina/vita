import * as React from "react"
import { ToggleGroup } from "radix-ui"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"
import { useIndicator } from "@/registry/hooks/use-morph"

/**
 * ContentSwitcher — switch between alternate presentations of the SAME content (List | Grid, Day | Week | Month).
 * A segmented control. 2–5 segments, equal importance, one always selected.
 * Different content per option → Tabs.
 * Hold and drag across it to browse: the segment under the pointer is selected as you pass it — no aiming, no clicking.
 */
export interface ContentSwitcherItem {
  value: string
  label: string
  icon?: IconType
  disabled?: boolean
}

export function ContentSwitcher({
  items,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  iconOnly,
  label,
  className,
}: {
  items: ContentSwitcherItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  size?: "sm" | "md" | "lg"
  /** Icon-only segments (each still needs a label → tooltip). */
  iconOnly?: boolean
  /** Accessible name for the group. */
  label: string
  className?: string
}) {
  const [inner, setInner] = React.useState(defaultValue ?? items[0]?.value)
  const current = value ?? inner
  const [ref, rect] = useIndicator<HTMLDivElement>('[data-state="on"]')
  // Latest selection, so drag handlers (bound at press time) never act on a stale value.
  const latest = React.useRef(current)
  React.useEffect(() => {
    latest.current = current
  }, [current])
  const select = (v: string) => {
    if (v === latest.current) return
    latest.current = v
    setInner(v)
    onValueChange?.(v)
  }
  // Hold-and-drag: while the pointer is down, whichever segment it's over becomes selected (live browse).
  const [dragging, setDragging] = React.useState(false)
  const pick = (root: HTMLElement, x: number) => {
    const hit = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-value]")).find((b) => {
      const r = b.getBoundingClientRect()
      return x >= r.left && x <= r.right && !b.disabled
    })
    if (hit?.dataset.value) select(hit.dataset.value)
  }
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.pointerType === "touch") return // touch scrolls; tap still selects
    const root = e.currentTarget
    pick(root, e.clientX)
    setDragging(true)
    const move = (ev: PointerEvent) => pick(root, ev.clientX)
    const up = () => {
      setDragging(false)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }
  return (
    <ToggleGroup.Root
      ref={ref}
      type="single"
      aria-label={label}
      value={current}
      onValueChange={(v) => {
        if (v) select(v) // always one selected
      }}
      onPointerDown={onPointerDown}
      className={cn(
        "relative inline-flex w-fit touch-none items-center gap-0.5 scope-md bg-layer-2 p-0.5 select-none",
        size === "sm" ? "h-control-sm" : size === "lg" ? "h-control-lg" : "h-control-md",
        className,
      )}
    >
      {rect && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute top-0 left-0 rounded-inner-0.5 bg-raised shadow-raised duration-moderate-02 ease-spring", dragging && "scale-95")}
          style={{ width: rect.w, height: rect.h, transform: `translate(${rect.x}px, ${rect.y}px)` }}
        />
      )}
      {items.map((it) => {
        const btn = (
          <ToggleGroup.Item
            key={it.value}
            value={it.value}
            data-value={it.value}
            disabled={it.disabled}
            aria-label={iconOnly ? it.label : undefined}
            className={cn(
              "relative z-10 inline-flex h-full min-w-0 flex-1 items-center justify-center gap-2 rounded-inner-0.5 px-3 text-body text-muted-foreground whitespace-nowrap",
              " duration-fast-02 ease-productive focus-ring hover:text-foreground",
              "data-[state=on]:font-medium data-[state=on]:text-foreground",
              "disabled:text-disabled-foreground",
              iconOnly && "aspect-square px-0",
            )}
          >
            {it.icon && <Icon as={it.icon} />}
            {!iconOnly && it.label}
          </ToggleGroup.Item>
        )
        return iconOnly ? <Tooltip key={it.value} content={it.label}>{btn}</Tooltip> : btn
      })}
    </ToggleGroup.Root>
  )
}
