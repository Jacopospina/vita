import * as React from "react"
import { ToggleGroup } from "radix-ui"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"

/**
 * ContentSwitcher — switch between alternate presentations of the SAME content (List | Grid, Day | Week | Month).
 * A segmented control. 2–5 segments, equal importance, one always selected.
 * Different content per option → Tabs.
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
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={current}
      onValueChange={(v) => {
        if (!v) return // always one selected
        setInner(v)
        onValueChange?.(v)
      }}
      className={cn(
        "inline-flex w-fit items-center gap-0.5 rounded-md bg-layer-2 p-0.5",
        size === "sm" ? "h-control-sm" : size === "lg" ? "h-control-lg" : "h-control-md",
        className,
      )}
    >
      {items.map((it) => {
        const btn = (
          <ToggleGroup.Item
            key={it.value}
            value={it.value}
            disabled={it.disabled}
            aria-label={iconOnly ? it.label : undefined}
            className={cn(
              "inline-flex h-full min-w-0 flex-1 items-center justify-center gap-2 rounded-sm px-3 text-body text-muted-foreground whitespace-nowrap",
              "transition-[background-color,color,box-shadow] duration-fast-02 ease-productive focus-ring hover:text-foreground",
              "data-[state=on]:bg-raised data-[state=on]:font-medium data-[state=on]:text-foreground data-[state=on]:shadow-raised",
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
