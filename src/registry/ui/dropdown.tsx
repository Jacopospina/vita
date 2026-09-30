import * as React from "react"
import { Select as SelectPrimitive, Popover as PopoverPrimitive } from "radix-ui"
import { Checkmark, ChevronDown, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"
import { Checkbox } from "@/registry/ui/checkbox"

export interface DropdownItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

const listClasses = cn(
  "z-50 max-h-80 min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-border-subtle bg-raised p-1 text-foreground shadow-floating",
  "data-[state=open]:animate-enter-scale data-[state=closed]:animate-exit-scale",
)
const itemClasses = cn(
  "relative flex min-h-control-sm w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-inset-sm text-body outline-none select-none",
  "data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground",
)

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
  return (
    <FieldShell {...field} className={className}>
      {(a11y) => (
        <SelectPrimitive.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
          <SelectPrimitive.Trigger
            {...a11y}
            className={cn(
              type === "default" ? [fieldClasses, fieldSize[size]] : "h-control-sm rounded-md px-2 text-body hover:bg-hover focus-ring",
              "flex items-center justify-between gap-2 text-left data-[placeholder]:text-placeholder",
            )}
          >
            <span className="truncate"><SelectPrimitive.Value placeholder={placeholder} /></span>
            <SelectPrimitive.Icon className="text-muted-foreground transition-transform duration-moderate-01 ease-productive">
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
                    <SelectPrimitive.ItemIndicator className="absolute right-2 flex text-primary">
                      <Icon as={Checkmark} />
                    </SelectPrimitive.ItemIndicator>
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
            <div className="relative">
              <input
                {...a11y}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
                disabled={disabled}
                placeholder={selected?.label ?? placeholder}
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
              <Icon as={ChevronDown} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              onOpenAutoFocus={(e) => e.preventDefault()}
              align="start"
              sideOffset={4}
              className={cn(listClasses, "w-(--radix-popover-trigger-width) min-w-0 overflow-y-auto")}
            >
              <ul id={listId} role="listbox">
                {filtered.length === 0 && <li className="px-inset-sm py-2 text-body text-muted-foreground">No results</li>}
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
                    {it.value === val && <Icon as={Checkmark} className="absolute right-2 text-primary" />}
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
export function MultiSelect({ items, value, defaultValue = [], onValueChange, size = "md", disabled, className, placeholder = "Choose options", ...field }: ListboxPopoverProps & { value?: string[]; defaultValue?: string[]; onValueChange?: (v: string[]) => void }) {
  const [val, setVal] = useControllable(value, defaultValue, onValueChange)
  const toggle = (v: string) => setVal(val.includes(v) ? val.filter((x) => x !== v) : [...val, v])
  return (
    <FieldShell {...field} className={className}>
      {(a11y) => (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger {...a11y} disabled={disabled} className={cn(fieldClasses, fieldSize[size], "flex items-center gap-2 text-left")}>
            {val.length > 0 ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-inverse pr-1 pl-2 text-caption font-medium text-inverse-foreground">
                {val.length}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear all selected items"
                  onClick={(e) => { e.stopPropagation(); setVal([]) }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setVal([]) } }}
                  className="flex size-4 items-center justify-center rounded-full hover:bg-hover focus-ring"
                >
                  <Icon as={Close} size="sm" />
                </span>
              </span>
            ) : null}
            <span className={cn("flex-1 truncate", val.length === 0 && "text-placeholder")}>
              {val.length === 0 ? placeholder : items.filter((i) => val.includes(i.value)).map((i) => i.label).join(", ")}
            </span>
            <Icon as={ChevronDown} className="text-muted-foreground" />
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content align="start" sideOffset={4} className={cn(listClasses, "w-(--radix-popover-trigger-width) min-w-0 overflow-y-auto")}>
              <div role="listbox" aria-multiselectable className="flex flex-col">
                {items.map((it) => (
                  <div key={it.value} className="rounded-sm px-inset-sm py-2 hover:bg-hover">
                    <Checkbox label={it.label} checked={val.includes(it.value)} disabled={it.disabled} onCheckedChange={() => toggle(it.value)} />
                  </div>
                ))}
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
    </FieldShell>
  )
}
