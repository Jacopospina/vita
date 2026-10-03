import * as React from "react"
import { ChevronDown, OverflowMenuVertical, OverflowMenuHorizontal } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Button, IconButton, type ButtonProps } from "@/registry/ui/button"
import { Icon } from "@/registry/ui/icon"
import { Group } from "@/registry/ui/layout"
import { Menu, MenuContent, MenuTrigger } from "@/registry/ui/menu"

/**
 * MenuButton, a button whose only job is to open a menu of related actions ("Export ▾", "Create ▾").
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
 * ComboButton, a primary action + a chevron for alternatives ("Save" | ▾ "Save as…", "Save as template").
 * One shape (a Group): the group owns the squircle and clips both halves, so they read as one block everywhere,
 * on phones too (where each half's own squircle mask used to round all four corners and split them).
 */
export function ComboButton({ label, onClick, variant = "tertiary", size = "md", children, disabled }: { label: string; onClick?: () => void; variant?: "primary" | "tertiary"; size?: ButtonProps["size"]; children: React.ReactNode; disabled?: boolean }) {
  return (
    <Group className={cn(disabled && "pointer-events-none", variant === "tertiary" && disabled && "border-transparent!")}>
      <Button variant={variant} size={size} onClick={onClick} disabled={disabled}>
        {label}
      </Button>
      {/* The seam between the halves: a hairline in the primary's foreground on the filled button, the outline's colour on the tertiary. */}
      <span aria-hidden className={cn("w-px self-stretch", variant === "primary" ? "bg-primary-foreground/30" : "bg-primary", disabled && "bg-transparent")} />
      <Menu>
        <MenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            aria-label={`More ${label.toLowerCase()} options`}
            className={cn("group/split px-0", size === "sm" ? "w-control-sm" : size === "lg" ? "w-control-lg" : size === "xl" ? "w-12" : "w-control-md")}
          >
            <Icon as={ChevronDown} className="duration-moderate-01 ease-productive group-data-[state=open]/split:rotate-180" />
          </Button>
        </MenuTrigger>
        <MenuContent align="end">{children}</MenuContent>
      </Menu>
    </Group>
  )
}

/**
 * OverflowMenu, the "⋮" for secondary actions on a row, card or tile. Max ~7 items.
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
