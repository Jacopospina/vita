import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { ChevronDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { DrawnMark, Icon } from "@/registry/ui/icon"
import { listClasses, itemClasses } from "@/registry/ui/dropdown"
import { AnimatedText } from "@/registry/ui/animated"

/**
 * Select — pick ONE value, composed with <SelectOption>/<SelectGroup> children.
 * Corpus NEVER uses the operating system's dropdown: this is the same custom listbox as Dropdown
 * (floating label, drawn checkmark, choreography). Use Dropdown when your options are data (`items`).
 */
export interface SelectProps extends FieldBaseProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: FieldSize
  disabled?: boolean
  name?: string
  className?: string
  children?: React.ReactNode
  /** @deprecated The floating label replaces placeholders. Kept for compatibility; ignored. */
  placeholder?: string
}

/** Collect value → label from SelectOption children (for the trigger's animated value). */
function labels(children: React.ReactNode, map = new Map<string, string>()) {
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement<{ value?: string; children?: React.ReactNode }>(c)) return
    if (c.type === SelectOption && c.props.value !== undefined) map.set(c.props.value, String(c.props.children ?? c.props.value))
    else labels(c.props.children, map)
  })
  return map
}

export function Select({ value, defaultValue, onValueChange, size = "md", disabled, name, className, children, placeholder: _placeholder, ...field }: SelectProps) {
  void _placeholder
  const [current, setCurrent] = useControllable<string | undefined>(value, defaultValue, onValueChange as ((v: string | undefined) => void) | undefined)
  const label = current ? labels(children).get(current) : undefined
  return (
    <FieldShell {...field} filled={!!current} floatOnFocus={false} className={className}>
      {(a11y) => (
        <SelectPrimitive.Root value={current} onValueChange={setCurrent} disabled={disabled} name={name}>
          <SelectPrimitive.Trigger {...a11y} className={cn(fieldClasses, fieldSize[size], "group relative flex items-center gap-2 pr-10 text-left")}>
            <span className="truncate">
              <SelectPrimitive.Value placeholder="">{label ? <AnimatedText>{label}</AnimatedText> : undefined}</SelectPrimitive.Value>
            </span>
            <SelectPrimitive.Icon className="absolute top-1/2 right-3 -mt-2 text-muted-foreground duration-moderate-01 ease-productive group-data-[state=open]:rotate-180">
              <Icon as={ChevronDown} />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content position="popper" sideOffset={4} className={listClasses}>
              <SelectPrimitive.Viewport className="p-0">{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </FieldShell>
  )
}

export function SelectOption({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Item value={value} disabled={disabled} className={cn(itemClasses, "[&[data-state=unchecked]_path]:[stroke-dashoffset:1]")}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <DrawnMark on className="absolute right-2 text-primary" />
    </SelectPrimitive.Item>
  )
}

export function SelectGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <SelectPrimitive.Group>
      <SelectPrimitive.Label className="px-2.5 pt-2 pb-1 text-caption font-medium text-helper">{label}</SelectPrimitive.Label>
      {children}
    </SelectPrimitive.Group>
  )
}
