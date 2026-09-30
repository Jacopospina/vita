import * as React from "react"
import { ChevronDown } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { FieldShell, fieldClasses, fieldSize, type FieldBaseProps, type FieldSize } from "@/registry/ui/form"
import { Icon } from "@/registry/ui/icon"

/**
 * Select — NATIVE select. Best on mobile, for long option lists (countries), and inside forms that must work without JS.
 * Need icons, descriptions, multi-select or filtering in the list → Dropdown / MultiSelect / Combobox.
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">, FieldBaseProps {
  size?: FieldSize
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className, id, size = "md", placeholder, children, ...props }, ref) => (
    <FieldShell {...{ id, label, hideLabel, helperText, invalid, invalidText, warn, warnText, optional, labelAddon, className }}>
      {(a11y) => (
        <div className="relative">
          <select
            ref={ref}
            {...a11y}
            {...props}
            defaultValue={props.value === undefined ? (props.defaultValue ?? (placeholder ? "" : undefined)) : undefined}
            className={cn(fieldClasses, fieldSize[size], "cursor-pointer appearance-none pr-10")}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <Icon as={ChevronDown} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
        </div>
      )}
    </FieldShell>
  ),
)
Select.displayName = "Select"

export const SelectOption = (props: React.OptionHTMLAttributes<HTMLOptionElement>) => <option {...props} />
export const SelectGroup = (props: React.OptgroupHTMLAttributes<HTMLOptGroupElement>) => <optgroup {...props} />
