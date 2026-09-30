import * as React from "react"
import { ChevronDown, OverflowMenuVertical, OverflowMenuHorizontal } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Button, IconButton, type ButtonProps } from "@/registry/ui/button"
import { Icon } from "@/registry/ui/icon"
import { Menu, MenuContent, MenuTrigger } from "@/registry/ui/menu"

/**
 * MenuButton — a button whose only job is to open a menu of related actions ("Export ▾", "Create ▾").
 * No default action. If one action dominates → ComboButton. Row-level secondary actions → OverflowMenu.
 */
export function MenuButton({ label, variant = "tertiary", size, children, align = "start" }: { label: string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; children: React.ReactNode; align?: "start" | "end" }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button variant={variant} size={size} className="group">
          {label}
          <Icon as={ChevronDown} className=" duration-moderate-01 ease-productive group-data-[state=open]:rotate-180" />
        </Button>
      </MenuTrigger>
      <MenuContent align={align}>{children}</MenuContent>
    </Menu>
  )
}

/**
 * ComboButton — a primary action + a chevron for alternatives ("Save" | ▾ "Save as…", "Save as template").
 */
export function ComboButton({ label, onClick, variant = "tertiary", size = "md", children, disabled }: { label: string; onClick?: () => void; variant?: "primary" | "tertiary"; size?: ButtonProps["size"]; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className="inline-flex" role="group">
      <Button variant={variant} size={size} onClick={onClick} disabled={disabled} className="rounded-r-none">
        {label}
      </Button>
      <Menu>
        <MenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            aria-label={`More ${label.toLowerCase()} options`}
            className={cn("rounded-l-none px-0", size === "sm" ? "w-control-sm" : size === "lg" ? "w-control-lg" : "w-control-md", variant === "primary" ? "border-l border-primary-foreground/30" : "-ml-px")}
          >
            <Icon as={ChevronDown} />
          </Button>
        </MenuTrigger>
        <MenuContent align="end">{children}</MenuContent>
      </Menu>
    </div>
  )
}

/**
 * OverflowMenu — the "⋮" for secondary actions on a row, card or tile. Max ~7 items.
 */
export function OverflowMenu({ label = "Options", orientation = "vertical", size = "sm", children, align = "end" }: { label?: string; orientation?: "vertical" | "horizontal"; size?: ButtonProps["size"]; children: React.ReactNode; align?: "start" | "end" }) {
  return (
    <Menu>
      <MenuTrigger asChild>
        <IconButton icon={orientation === "vertical" ? OverflowMenuVertical : OverflowMenuHorizontal} label={label} size={size} />
      </MenuTrigger>
      <MenuContent align={align}>{children}</MenuContent>
    </Menu>
  )
}
