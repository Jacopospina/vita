import * as React from "react"
import { DropdownMenu as MenuPrimitive, ContextMenu as ContextPrimitive } from "radix-ui"
import type { IconType } from "@/registry/icons"
import { Checkmark, ChevronRight } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"

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
  "z-50 min-w-48 overflow-hidden rounded-md border border-border-subtle bg-raised p-1 text-foreground shadow-floating",
  "data-[state=open]:animate-enter-scale data-[state=closed]:animate-exit-scale origin-(--radix-dropdown-menu-content-transform-origin)",
)
const itemClasses = cn(
  "relative flex h-control-sm cursor-default items-center gap-2 rounded-sm px-inset-sm text-body outline-none select-none",
  "data-[highlighted]:bg-hover data-[disabled]:pointer-events-none data-[disabled]:text-disabled-foreground",
)

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
      {shortcut && <kbd className="font-sans text-caption text-helper">{shortcut}</kbd>}
    </MenuPrimitive.Item>
  )
}

export function MenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem className={cn(itemClasses, "pl-8", className)} {...props}>
      <MenuPrimitive.ItemIndicator className="absolute left-2 flex"><Icon as={Checkmark} /></MenuPrimitive.ItemIndicator>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

export function MenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem className={cn(itemClasses, "pl-8", className)} {...props}>
      <MenuPrimitive.ItemIndicator className="absolute left-2 flex"><Icon as={Checkmark} /></MenuPrimitive.ItemIndicator>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

export function MenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label className={cn("px-inset-sm pt-2 pb-1 text-caption font-medium text-helper", className)} {...props} />
}

export function MenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-border-subtle", className)} {...props} />
}

export function MenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof MenuPrimitive.SubTrigger>) {
  return (
    <MenuPrimitive.SubTrigger className={cn(itemClasses, "data-[state=open]:bg-hover", className)} {...props}>
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
