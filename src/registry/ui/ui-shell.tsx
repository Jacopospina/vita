import * as React from "react"
import type { IconType } from "@/registry/icons"
import { Close, Menu as MenuIcon, ChevronDown } from "@/registry/icons"
import { Collapsible } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton, ActionBar } from "@/registry/ui/button"

/**
 * UI Shell — the persistent frame of a product. Three parts:
 *   Header      → product name, global nav, global actions (search, notifications, help, user). 48px, always visible.
 *   LeftPanel   → side navigation between the product's main areas: a floating, frosted-glass sidebar inset from the
 *                 window edges (concentric radius), with Finder-style sections (small header, collapses on hover chevron).
 *                 Rail (icons) or expanded.
 *   RightPanel  → contextual/global panels (notifications, help, AI assistant) that slide over the content.
 * Build every app screen inside <Shell>. Never build a custom header or nav.
 */

const ShellCtx = React.createContext<{ navOpen: boolean; setNavOpen: (o: boolean) => void }>({ navOpen: false, setNavOpen: () => {} })

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  const [navOpen, setNavOpen] = React.useState(false)
  return (
    <ShellCtx.Provider value={{ navOpen, setNavOpen }}>
      <div className={cn("flex h-dvh flex-col bg-background text-foreground", className)}>{children}</div>
    </ShellCtx.Provider>
  )
}

export function ShellBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("relative flex min-h-0 flex-1", className)}>{children}</div>
}

export function ShellMain({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <main id="main-content" className={cn("min-w-0 flex-1 overflow-y-auto", className)} {...props}>{children}</main>
}

/* ---------------- Header ---------------- */

export function Header({ productName, prefix, href = "/", children, actions, className }: {
  productName: string
  /** Company/platform prefix, e.g. "Corpus" in "Corpus [Insights]". */
  prefix?: string
  href?: string
  /** HeaderNav */
  children?: React.ReactNode
  /** HeaderGlobalAction[] */
  actions?: React.ReactNode
  className?: string
}) {
  const { navOpen, setNavOpen } = React.useContext(ShellCtx)
  return (
    <header className={cn("sticky top-0 z-40 flex h-12 shrink-0 items-center border-b border-border-subtle bg-background/85 backdrop-blur-xl backdrop-saturate-150", className)}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to main content
      </a>
      <IconButton icon={navOpen ? Close : MenuIcon} label={navOpen ? "Close menu" : "Open menu"} onClick={() => setNavOpen(!navOpen)} className="size-12 rounded-none lg:hidden" />
      <a href={href} className="flex h-full items-center gap-1 px-3 text-body whitespace-nowrap focus-ring-inset">
        {prefix && <span className="font-normal text-muted-foreground">{prefix}</span>}
        <span className="font-semibold">{productName}</span>
      </a>
      {children && <nav aria-label={productName} className="hidden h-full items-center lg:flex">{children}</nav>}
      <div className="ml-auto flex h-full items-center">{actions}</div>
    </header>
  )
}

export function HeaderNavItem({ href, active, children, onClick }: { href?: string; active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-full items-center px-3 text-body text-muted-foreground duration-fast-02 hover:bg-hover hover:text-foreground focus-ring-inset",
        "after:absolute after:inset-x-8 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:motion-expressive",
        active && "text-foreground after:inset-x-4 after:bg-primary",
      )}
    >
      {children}
    </a>
  )
}

export const HeaderGlobalAction = React.forwardRef<HTMLButtonElement, { icon: IconType; label: string; active?: boolean; badge?: boolean; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ icon, label, active, badge, className, ...props }, ref) => (
    <span className="relative flex h-full">
      <IconButton ref={ref} icon={icon} label={label} pressed={active} className={cn("h-12 w-12 rounded-none", className)} {...props} />
      {badge && <span aria-hidden className="pointer-events-none absolute top-3 right-3 size-2 rounded-full bg-error ring-2 ring-background" />}
    </span>
  ),
)
HeaderGlobalAction.displayName = "HeaderGlobalAction"

/* ---------------- Left panel (side nav) ---------------- */

export function LeftPanel({ children, rail, className, label = "Side navigation" }: { children: React.ReactNode; rail?: boolean; className?: string; label?: string }) {
  const { navOpen, setNavOpen } = React.useContext(ShellCtx)
  return (
    <>
      {navOpen && <div className="fixed inset-0 top-12 z-30 animate-enter-fade bg-overlay lg:hidden" onClick={() => setNavOpen(false)} />}
      <nav
        aria-label={label}
        data-rail={rail || undefined}
        className={cn(
          // Floating sidebar: frosted glass, inset from the window, rounded; rows inside are concentric (rounded-inner-2).
          "group/nav z-30 flex shrink-0 flex-col overflow-y-auto glass scope-xl p-2",
          "fixed top-14 bottom-2 left-2 w-60 -translate-x-[calc(100%+1rem)] duration-moderate-02 ease-productive",
          "lg:static lg:m-2 lg:mr-0 lg:translate-x-0",
          navOpen && "translate-x-0",
          rail && "lg:absolute lg:inset-y-0 lg:w-12 lg:hover:w-60",
          className,
        )}
      >
        {children}
      </nav>
      {rail && <div className="hidden w-14 shrink-0 lg:block" aria-hidden />}
    </>
  )
}

export function SideNavItem({ href, icon, active, children, onClick }: { href?: string; icon?: IconType; active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Finder row: compact, accent icon + label, soft grey highlight when selected.
        "relative flex h-control-sm shrink-0 items-center gap-2 rounded-inner-2 px-2 text-body whitespace-nowrap text-foreground duration-fast-02",
        "hover:bg-hover focus-ring-inset",
        active && "bg-active font-medium",
      )}
    >
      {icon && <Icon as={icon} className="text-primary" />}
      <span className="truncate group-data-[rail]/nav:lg:opacity-0 group-data-[rail]/nav:lg:group-hover/nav:opacity-100">{children}</span>
    </a>
  )
}

export function SideNavMenu({ icon, title, defaultOpen, children }: { icon?: IconType; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      <Collapsible.Trigger className="group flex h-control-sm w-full items-center gap-2 rounded-inner-2 px-2 text-body text-foreground hover:bg-hover focus-ring-inset">
        {icon && <Icon as={icon} className="text-primary" />}
        <span className="flex-1 truncate text-left">{title}</span>
        <Icon as={ChevronDown} className=" duration-moderate-01 group-data-[state=open]:rotate-180" />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="flex flex-col py-0.5 [&>a]:pl-8">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

/**
 * SideNavSection — a Finder-style group: small muted header ("Favourites", "Locations") over its rows.
 * `collapsible`: a disclosure chevron appears on hover at the header's end; the rows fold away (reveal, not snap).
 */
export function SideNavSection({ title, collapsible, defaultOpen = true, children }: { title?: string; collapsible?: boolean; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const header = "flex h-6 w-full items-end justify-between px-2 pb-1 text-caption font-semibold text-muted-foreground group-data-[rail]/nav:lg:opacity-0 group-data-[rail]/nav:lg:group-hover/nav:opacity-100"
  if (!collapsible) {
    return (
      <div className="flex flex-col gap-px pt-2 first:pt-0">
        {title && <p className={header}>{title}</p>}
        {children}
      </div>
    )
  }
  return (
    <div className="group/sec flex flex-col pt-2 first:pt-0">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className={cn(header, "rounded-inner-2 text-left focus-ring-inset")}>
        <span className="truncate">{title}</span>
        <Icon as={ChevronDown} size="sm" className={cn("opacity-0 duration-moderate-01 group-hover/sec:opacity-100 group-focus-within/sec:opacity-100", !open && "-rotate-90")} />
      </button>
      <div className={cn("reveal motion-productive", open && "reveal-open")} inert={!open || undefined}>
        <div className="flex flex-col gap-px">{children}</div>
      </div>
    </div>
  )
}

/* ---------------- Right panel ---------------- */

/** RightPanel — slides over content from the right. Non-modal: the page stays usable. Width 320 (sm) · 400 (md) · 560 (lg). */
export function RightPanel({ open, onOpenChange, title, children, footer, size = "md", className }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  children: React.ReactNode
  /** Primary action(s) only — rendered as a full-bleed ActionBar. Never a Cancel: × and Escape close the panel. */
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const [mounted, setMounted] = React.useState(open)
  if (open && !mounted) setMounted(true)
  React.useEffect(() => {
    if (open) return
    const t = setTimeout(() => setMounted(false), 160) // let the exit animation finish
    return () => clearTimeout(t)
  }, [open])
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])
  if (!mounted) return null
  return (
    <aside
      aria-label={title}
      className={cn(
        "absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-border-subtle bg-raised shadow-overlay",
        size === "sm" ? "sm:w-80" : size === "lg" ? "sm:w-140" : "sm:w-100",
        open ? "animate-enter-panel-right" : "animate-exit-panel-right",
        className,
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle pl-4">
        <h2 className="text-headline">{title}</h2>
        <IconButton icon={Close} label="Close panel" onClick={() => onOpenChange(false)} className="size-12 rounded-none" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      {footer && <ActionBar>{footer}</ActionBar>}
    </aside>
  )
}
