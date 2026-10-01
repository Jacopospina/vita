import * as React from "react"
import { useFlip } from "@/registry/hooks/use-flip"
import { Select as SelectPrimitive, Popover as PopoverPrimitive } from "radix-ui"
import { ChevronDown, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon, DrawnMark } from "@/registry/ui/icon"
import { AnimatedText, AnimatedNumber } from "@/registry/ui/animated"
import { listClasses, itemClasses, tickClasses, Option } from "@/registry/ui/option"

export interface DropdownItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export { listClasses, itemClasses, tickClasses } from "@/registry/ui/option"

/**
 * Dropdown — pick ONE option from a custom-rendered list (icons, descriptions, consistent styling across OSs).
 * 2–6 options visible at once → RadioGroup. >20 options → Combobox (filterable). Mobile-heavy/long lists → native Select.
 */
export interface DropdownProps extends FieldBaseProps {
  items: DropdownItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  placeholder?: string
  size?: FieldSize
  disabled?: boolean
  className?: string
  /** "inline" = label and value on one line, borderless; for toolbars and filters. */
  type?: "default" | "inline"
}

export function Dropdown({ items, value, defaultValue, onValueChange, placeholder = "Choose an option", size = "md", disabled, className, type = "default", ...field }: DropdownProps) {
  const [current, setCurrent] = useControllable<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined)
  const selected = items.find((i) => i.value === current)
  return (
    <FieldShell {...field} filled={!!selected || type === "inline"} bare={type === "inline"} floatOnFocus={false} className={className}>
      {(a11y) => (
        <SelectPrimitive.Root value={current} onValueChange={setCurrent} disabled={disabled}>
          <SelectPrimitive.Trigger
            {...a11y}
            className={cn(
              type === "default" ? [fieldClasses, fieldSize[size]] : "h-control-sm rounded-md px-2 text-body hover:bg-hover focus-ring",
              "group flex items-center justify-between gap-2 text-left",
            )}
          >
            <span className="truncate"><SelectPrimitive.Value placeholder={type === "inline" ? placeholder : ""}>{selected ? <AnimatedText>{selected.label}</AnimatedText> : undefined}</SelectPrimitive.Value></span>
            <SelectPrimitive.Icon className={cn("text-muted-foreground duration-moderate-01 ease-productive group-data-[state=open]:rotate-180", type === "default" && "absolute top-1/2 right-3 -mt-2")}>
              <Icon as={ChevronDown} />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content position="popper" sideOffset={4} className={listClasses}>
              <SelectPrimitive.Viewport className="p-0">
                {items.map((it) => (
                  <SelectPrimitive.Item key={it.value} value={it.value} disabled={it.disabled} className={itemClasses}>
                    <div className="flex flex-col">
                      <SelectPrimitive.ItemText>{it.label}</SelectPrimitive.ItemText>
                      {it.description && <span className="text-caption text-helper">{it.description}</span>}
                    </div>
                    <DrawnMark on={it.value === current} className={tickClasses} />
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </FieldShell>
  )
}

/* ------------------------------------------------------------------ */

interface ListboxPopoverProps extends FieldBaseProps {
  items: DropdownItem[]
  size?: FieldSize
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Combobox — Dropdown + type-to-filter. Use for long lists (>20) where users know what they're looking for.
 */
export function Combobox({ items, value, defaultValue = "", onValueChange, size = "md", disabled, className, placeholder = "Type to filter", ...field }: ListboxPopoverProps & { value?: string; defaultValue?: string; onValueChange?: (v: string) => void }) {
  const [val, setVal] = useControllable(value, defaultValue, onValueChange)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = React.useId()
  const selected = items.find((i) => i.value === val)
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
  // Filtering glides the remaining options into place (FLIP) — armed only once the list has finished opening, so
  // the opening itself (positioning, width settling) never makes options glide.
  const options = React.useRef<HTMLUListElement>(null)
  const [armed, setArmed] = React.useState(false)
  React.useEffect(() => {
    const t = window.setTimeout(() => setArmed(open), open ? 200 : 0)
    return () => window.clearTimeout(t)
  }, [open])
  useFlip(options, open && armed)
  const anchor = React.useRef<HTMLDivElement>(null)
  const commit = (it: DropdownItem) => {
    setVal(it.value)
    setQuery("")
    setOpen(false)
  }
  return (
    <FieldShell {...field} className={className}>
      {(a11y) => (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Anchor asChild>
            <div ref={anchor} className="relative">
              <input
                {...a11y}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
                disabled={disabled}
                placeholder={selected?.label ?? placeholder ?? " "}
                value={open ? query : (selected?.label ?? "")}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                  setOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
                  if (e.key === "Enter" && filtered[active]) { e.preventDefault(); commit(filtered[active]) }
                  if (e.key === "Escape") setOpen(false)
                }}
                className={cn(fieldClasses, fieldSize[size], "pr-16")}
              />
              {val && (
                <button type="button" aria-label="Clear selection" onClick={() => setVal("")} className="absolute top-1/2 right-8 flex size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus-ring">
                  <Icon as={Close} />
                </button>
              )}
              <Icon as={ChevronDown} className={cn("pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground duration-moderate-01 ease-productive", open && "rotate-180")} />
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              onOpenAutoFocus={(e) => e.preventDefault()}
              // The field is the anchor, not a trigger: pressing it must not count as "outside" (that closed and
              // instantly reopened the list — the blink).
              onInteractOutside={(e) => { if (anchor.current?.contains(e.target as Node)) e.preventDefault() }}
              align="start"
              sideOffset={4}
              className={cn(listClasses, "w-(--radix-popover-trigger-width) min-w-0 overflow-y-auto")}
            >
              <ul ref={options} id={listId} role="listbox">
                {filtered.length === 0 && <li className="px-2.5 py-2 text-body text-muted-foreground">No results</li>}
                {filtered.map((it, i) => (
                  <li
                    key={it.value}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={it.value === val}
                    aria-disabled={it.disabled}
                    data-highlighted={i === active ? "" : undefined}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => !it.disabled && commit(it)}
                    className={itemClasses}
                  >
                    {it.label}
                    <DrawnMark on={it.value === val} className={tickClasses} />
                  </li>
                ))}
              </ul>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
    </FieldShell>
  )
}

/**
 * MultiSelect — choose SEVERAL options from a list too long for a CheckboxGroup (> ~6). Selected count shows as a tag.
 */
/** The MultiSelect's options: whole rows toggle (click, Enter or Space); a tick in the left slot shows what's chosen. */
function MultiOptions({ items, selected, onToggle }: { items: DropdownItem[]; selected: string[]; onToggle: (v: string) => void }) {
  const [active, setActive] = React.useState(0)
  const rows = React.useRef<(HTMLDivElement | null)[]>([])
  const move = (i: number) => {
    const n = Math.max(0, Math.min(items.length - 1, i))
    setActive(n)
    rows.current[n]?.focus()
  }
  return (
    <div
      role="listbox"
      aria-multiselectable
      className="flex flex-col"
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); move(active + 1) }
        if (e.key === "ArrowUp") { e.preventDefault(); move(active - 1) }
        if (e.key === "Home") { e.preventDefault(); move(0) }
        if (e.key === "End") { e.preventDefault(); move(items.length - 1) }
      }}
    >
      {items.map((it, i) => (
        <Option
          key={it.value}
          ref={(el) => { rows.current[i] = el }}
          label={it.label}
          description={it.description}
          selected={selected.includes(it.value)}
          highlighted={i === active}
          disabled={it.disabled}
          tabIndex={i === active ? 0 : -1}
          onMouseEnter={() => setActive(i)}
          onClick={() => !it.disabled && onToggle(it.value)}
          onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !it.disabled) { e.preventDefault(); onToggle(it.value) } }}
        />
      ))}
    </div>
  )
}

export function MultiSelect({ items, value, defaultValue = [], onValueChange, size = "md", disabled, className, ...field }: ListboxPopoverProps & { value?: string[]; defaultValue?: string[]; onValueChange?: (v: string[]) => void }) {
  const [val, setVal] = useControllable(value, defaultValue, onValueChange)
  const toggle = (v: string) => setVal(val.includes(v) ? val.filter((x) => x !== v) : [...val, v])
  return (
    <FieldShell {...field} filled={val.length > 0} fadeLabel={val.length > 0} floatOnFocus={false} className={className}>
      {(a11y) => (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger {...a11y} disabled={disabled} className={cn(fieldClasses, fieldSize[size], "group/ms relative flex items-center gap-2 pr-10 text-left", val.length > 0 && "pt-0")}>
            <span
              aria-hidden={val.length === 0 || undefined}
              className={cn(
                "inline-flex h-6 shrink-0 items-center gap-1 overflow-hidden rounded-full bg-inverse text-caption font-medium text-inverse-foreground duration-moderate-01 ease-spring",
                val.length > 0 ? "max-w-16 pr-1 pl-2 opacity-100" : "pointer-events-none -mr-2 max-w-0 scale-75 px-0 opacity-0",
              )}
            >
              <AnimatedNumber value={val.length} />
              <span
                role="button"
                tabIndex={val.length > 0 ? 0 : -1}
                aria-label="Clear all selected items"
                onClick={(e) => { e.stopPropagation(); setVal([]) }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setVal([]) } }}
                className="flex size-4 items-center justify-center rounded-full hover:bg-hover focus-ring"
              >
                <Icon as={Close} size="sm" />
              </span>
            </span>
            <span className="flex-1 truncate">
              <AnimatedText>{val.length === 0 ? " " : items.filter((i) => val.includes(i.value)).map((i) => i.label).join(", ")}</AnimatedText>
            </span>
            <Icon as={ChevronDown} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground duration-moderate-01 ease-productive group-data-[state=open]/ms:rotate-180" />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content align="start" sideOffset={4} className={cn(listClasses, "w-(--radix-popover-trigger-width) min-w-0 overflow-y-auto")}>
              <MultiOptions items={items} selected={val} onToggle={toggle} />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
    </FieldShell>
  )
}
