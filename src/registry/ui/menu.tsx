import * as React from "react"
import { DropdownMenu as MenuPrimitive, ContextMenu as ContextPrimitive } from "radix-ui"
import type { IconType } from "@/registry/icons"
import { ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon, DrawnMark } from "@/registry/ui/icon"

/**
 * Menu — a temporary list of ACTIONS (verbs). Not for choosing a value (→ Dropdown) and not for navigation (→ links/Side nav).
 * Order: most frequent first · group with separators · destructive last, in danger color.
 */
export const Menu = MenuPrimitive.Root
export const MenuTrigger = MenuPrimitive.Trigger
export const MenuGroup = MenuPrimitive.Group
export const MenuSub = MenuPrimitive.Sub
export const MenuRadioGroup = MenuPrimitive.RadioGroup

const contentClasses = cn(
  // Menu: 6px inset, 28px rows, 10px side padding, concentric 6px row radius (12 − 6), accent highlight.
  "z-50 min-w-48 overflow-hidden scope-lg glass glass-3 p-1.5 text-foreground",
  "data-[state=open]:animate-enter-scale data-[state=closed]:animate-exit-scale origin-(--radix-dropdown-menu-content-transform-origin)",
)
const itemClasses = cn(
  "group/mi relative flex h-control-md cursor-default items-center gap-2 rounded-inner-1.5 px-2.5 text-body outline-none select-none",
  "data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground",
)

// The mark is always drawn in the DOM; the item's data-state un-draws it (dashoffset 1) when unchecked.
const indicatorClasses = "absolute left-2.5 flex [&[data-state=unchecked]_path]:[stroke-dashoffset:1]"

export function MenuContent({ className, sideOffset = 4, align = "start", ...props }: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content sideOffset={sideOffset} align={align} className={cn(contentClasses, className)} {...props} />
    </MenuPrimitive.Portal>
  )
}

export interface MenuItemProps extends React.ComponentProps<typeof MenuPrimitive.Item> {
  icon?: IconType
  shortcut?: string
  danger?: boolean
}

export function MenuItem({ icon, shortcut, danger, className, children, ...props }: MenuItemProps) {
  return (
    <MenuPrimitive.Item className={cn(itemClasses, danger && "text-error-foreground data-[highlighted]:bg-error data-[highlighted]:text-primary-foreground", className)} {...props}>
      {icon && <Icon as={icon} />}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <kbd className="font-sans text-caption text-helper group-data-[highlighted]/mi:text-primary-foreground/80">{shortcut}</kbd>}
    </MenuPrimitive.Item>
  )
}

export function MenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem className={cn(itemClasses, "pl-8", className)} {...props}>
      <MenuPrimitive.ItemIndicator forceMount className={indicatorClasses}><DrawnMark on /></MenuPrimitive.ItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export function MenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem className={cn(itemClasses, "pl-8", className)} {...props}>
      <MenuPrimitive.ItemIndicator forceMount className={indicatorClasses}><DrawnMark on /></MenuPrimitive.ItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function MenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn("px-2.5 pt-2 pb-1 text-caption font-medium text-helper", className)} {...props} />
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn("mx-2.5 my-1.5 h-px bg-divider", className)} {...props} />
}

export function MenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.SubTrigger>) {
  return (
    <MenuPrimitive.SubTrigger className={cn(itemClasses, "data-[state=open]:bg-primary data-[state=open]:text-primary-foreground", className)} {...props}>
      <span className="flex-1">{children}</span>
      <Icon as={ChevronRight} />
    </MenuPrimitive.SubTrigger>
  )
}

export function MenuSubContent({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent className={cn(contentClasses, className)} {...props} />
    </MenuPrimitive.Portal>
  )
}

/* Context menu: same visuals, opened with right-click / long-press. Always duplicate its actions somewhere visible. */
export const ContextMenu = ContextPrimitive.Root
export const ContextMenuTrigger = ContextPrimitive.Trigger
export function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof ContextPrimitive.Content>) {
  return (
    <ContextPrimitive.Portal>
      <ContextPrimitive.Content className={cn(contentClasses, className)} {...props} />
    </ContextPrimitive.Portal>
  )
}
export function ContextMenuItem({ icon, danger, className, children, ...props }: React.ComponentProps<typeof ContextPrimitive.Item> & { icon?: IconType; danger?: boolean }) {
  return (
    <ContextPrimitive.Item className={cn(itemClasses, danger && "text-error-foreground data-[highlighted]:bg-error data-[highlighted]:text-primary-foreground", className)} {...props}>
      {icon && <Icon as={icon} />}
      {children}
    </ContextPrimitive.Item>
  )
}
