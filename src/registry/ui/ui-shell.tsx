import * as React from "react"
import type { IconType } from "@/registry/icons"
import { Close, Menu as MenuIcon, ChevronDown } from "@/registry/icons"
import { Collapsible } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton, ActionBar } from "@/registry/ui/button"
import { useIndicator } from "@/registry/hooks/use-morph"

/**
 * UI Shell, the persistent frame of a product. Three parts:
 *   Header      → product name, global nav, global actions (search, notifications, help, user). A floating, frosted-glass
 *                 bar inset 8px from the window, like the LeftPanel; items inside are concentric pills. Always visible.
 *   LeftPanel   → side navigation between the product's main areas: a floating, frosted-glass sidebar inset from the
 *                 window edges (concentric radius), with Finder-style sections (small header, collapses on hover chevron).
 *                 Rail (icons) or expanded.
 *   RightPanel  → contextual/global panels (notifications, help, AI assistant) that slide over the content.
 * Build every app screen inside <Shell>. Never build a custom header or nav.
 */

type NavKind = "none" | "full" | "rail"
const ShellCtx = React.createContext<{ navOpen: boolean; setNavOpen: (o: boolean) => void; nav: NavKind; setNav: (n: NavKind) => void }>({
  navOpen: false, setNavOpen: () => {}, nav: "none", setNav: () => {},
})

/**
 * Layering: the page scrolls UNDER the shell. ShellMain fills the window; the Header, LeftPanel and RightPanel float
 * above it on their glass tiers, and ShellMain is padded so content starts below and beside them. Scrolled content
 * passes beneath the frosted header, that's what makes the material visible.
 */
export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  const [navOpen, setNavOpen] = React.useState(false)
  const [nav, setNav] = React.useState<NavKind>("none")
  // The mobile menu closes when you go somewhere (a route change) or press Escape.
  React.useEffect(() => {
    if (!navOpen) return
    const close = () => setNavOpen(false)
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("hashchange", close)
    window.addEventListener("popstate", close)
    window.addEventListener("keydown", esc)
    return () => {
      window.removeEventListener("hashchange", close)
      window.removeEventListener("popstate", close)
      window.removeEventListener("keydown", esc)
    }
  }, [navOpen])
  return (
    <ShellCtx.Provider value={{ navOpen, setNavOpen, nav, setNav }}>
      <div className={cn("relative h-dvh overflow-hidden bg-background text-foreground", className)}>{children}</div>
    </ShellCtx.Provider>
  )
}

export function ShellBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("absolute inset-0", className)}>{children}</div>
}

export function ShellMain({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const { nav } = React.useContext(ShellCtx)
  // Full-window scroller. Top padding clears the floating header (8 + 48 + 8); on large screens the left padding
  // clears the floating side nav (8 + 240 + 8, or 8 + 48 + 8 for the rail). Also the containing block for anything
  // absolutely positioned inside it, so nothing stretches the document.
  return (
    <main
      id="main-content"
      className={cn("absolute inset-0 overflow-y-auto pt-16 [--vita-shell-top:4rem]", nav === "full" && "lg:pl-64", nav === "rail" && "lg:pl-16", className)}
      {...props}
    >
      {children}
    </main>
  )
}

/* ---------------- Header ---------------- */

/** Header items: 32px concentric pills inside the floating bar (radius = bar radius − its 8px padding). */
const pill = "h-8 rounded-inner-2 [corner-shape:round]"

export function Header({ productName, prefix, logo, badge, href = "/", children, actions, className }: {
  productName: string
  /** A small label right after the name, e.g. a release stage (<Tag size="sm" tone="neutral">Draft</Tag>). */
  badge?: React.ReactNode
  /** The product's mark, shown before its name (about 20px). */
  logo?: React.ReactNode
  /** Company/platform prefix, e.g. "Vita" in "Vita [Insights]". */
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
    // Floating bar: same material as the LeftPanel (glass, 8px inset, concentric radius); rows inside are rounded-inner-2.
    <header className={cn("absolute inset-x-2 top-2 z-40 flex h-12 items-center gap-1 glass glass-2 scope-xl p-2", className)}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to main content
      </a>
      <IconButton icon={navOpen ? Close : MenuIcon} label={navOpen ? "Close menu" : "Open menu"} onClick={() => setNavOpen(!navOpen)} className={cn(pill, "w-8 lg:hidden")} />
      <a href={href} className="flex h-8 items-center gap-1 rounded-inner-2 px-3 text-body whitespace-nowrap duration-fast-02 hover:bg-hover focus-ring-inset">
        {logo && <span aria-hidden className="mr-1 flex shrink-0">{logo}</span>}
        {prefix && <span className="font-normal text-muted-foreground">{prefix}</span>}
        <span className="font-semibold">{productName}</span>
      </a>
      {badge && <span className="-ml-2 mr-1 flex shrink-0 items-center">{badge}</span>}
      {children && <HeaderNav label={productName}>{children}</HeaderNav>}
      <div className="ml-auto flex items-center gap-1">{actions}</div>
    </header>
  )
}

/** The header's nav: one highlight slides between links when the page changes (lava lamp), like the tabs pill. */
function HeaderNav({ label, children }: { label: string; children: React.ReactNode }) {
  const [ref, rect] = useIndicator<HTMLElement>('[aria-current="page"]')
  return (
    <nav ref={ref} aria-label={label} className="relative hidden items-center gap-1 lg:flex">
      {rect && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute top-0 left-0 rounded-inner-2 bg-active duration-expressive ease-spring", !rect.slide && "transition-none")}
          style={{ width: rect.w, height: rect.h, transform: `translate(${rect.x}px, ${rect.y}px)` }}
        />
      )}
      {children}
    </nav>
  )
}

export function HeaderNavItem({ href, active, children, onClick }: { href?: string; active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Same row treatment as the sidebar: a concentric pill, soft grey when current.
        "relative flex h-8 items-center rounded-inner-2 px-3 text-body text-muted-foreground duration-fast-02 hover:bg-hover hover:text-foreground focus-ring-inset",
        // The current page's highlight is the sliding indicator in HeaderNav, not a fill of its own.
        active && "font-medium text-foreground",
      )}
    >
      {children}
    </a>
  )
}

/** HeaderSeparator, a small dot between groups of global actions (search · theme and links). */
export function HeaderSeparator() {
  return <span aria-hidden className="mx-1.5 size-1 shrink-0 rounded-full bg-border-strong" />
}

export const HeaderGlobalAction = React.forwardRef<HTMLButtonElement, { icon: IconType; label: string; active?: boolean; badge?: boolean; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ icon, label, active, badge, className, ...props }, ref) => (
    <span className="relative flex">
      <IconButton ref={ref} icon={icon} label={label} pressed={active} className={cn(pill, "w-8", className)} {...props} />
      {badge && <span aria-hidden className="pointer-events-none absolute top-1 right-1 size-2 rounded-full bg-error ring-2 ring-raised" />}
    </span>
  ),
)
HeaderGlobalAction.displayName = "HeaderGlobalAction"

/* ---------------- Left panel (side nav) ---------------- */

export function LeftPanel({ children, rail, mobileOnly, className, label = "Side navigation" }: {
  children: React.ReactNode
  rail?: boolean
  /** Only the small-screen menu (opened from the header): pages without a sidebar still get a working menu. */
  mobileOnly?: boolean
  className?: string
  label?: string
}) {
  const { navOpen, setNavOpen, setNav } = React.useContext(ShellCtx)
  // Tell the shell how much room to leave for us (none when we only exist as the mobile menu).
  React.useEffect(() => {
    if (mobileOnly) return
    setNav(rail ? "rail" : "full")
    return () => setNav("none")
  }, [rail, mobileOnly, setNav])
  return (
    <>
      {navOpen && <div className="absolute inset-0 top-16 z-30 animate-enter-fade bg-overlay lg:hidden" onClick={() => setNavOpen(false)} />}
      <nav
        aria-label={label}
        data-rail={rail || undefined}
        className={cn(
          // Floating sidebar: frosted glass, inset from the window, rounded; rows inside are concentric (rounded-inner-2).
          "group/nav z-30 flex shrink-0 flex-col overflow-y-auto glass glass-1 scope-xl p-2",
          // Floats over the scrolling page, below the header (top-16 = 8 + 48 + 8), inset 8px like the header.
          "absolute top-16 bottom-2 left-2 w-60 -translate-x-[calc(100%+1rem)] duration-moderate-02 ease-productive",
          mobileOnly ? "lg:hidden" : "lg:translate-x-0",
          // Open over the page on a small screen it's a sheet, not a sidebar: solid, so nothing behind competes with it.
          navOpen && "translate-x-0 max-lg:bg-raised!",
          rail && "lg:w-12 lg:hover:w-60",
          className,
        )}
      >
        {children}
      </nav>
    </>
  )
}

/**
 * In a collapsed rail, rows keep their icons exactly centred: the rail is 48px with 8px padding and a 1px glass
 * border, so the row's side padding is (48 − 16) / 2 − 8 − 1 = 7px. The same padding holds when the rail expands
 * on hover, so the icons never jump.
 */
const railRow = "group-data-[rail]/nav:lg:px-[calc((var(--spacing)*12-1rem)/2-var(--spacing)*2-1px)]"
const railHidden = "group-data-[rail]/nav:lg:opacity-0 group-data-[rail]/nav:lg:group-hover/nav:opacity-100"

export function SideNavItem({ href, icon, active, children, onClick }: { href?: string; icon?: IconType; active?: boolean; children: React.ReactNode; onClick?: () => void }) {
  const { setNavOpen } = React.useContext(ShellCtx)
  return (
    <a
      href={href}
      onClick={() => { onClick?.(); setNavOpen(false) }}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Finder row: compact, accent icon + label, soft grey highlight when selected.
        "relative flex h-control-md shrink-0 items-center gap-2 rounded-inner-2 px-2.5 text-body-lg whitespace-nowrap text-foreground duration-fast-02 max-lg:text-body",
        railRow,
        "hover:bg-hover focus-ring-inset",
        active && "bg-active font-medium",
      )}
    >
      {icon && <Icon as={icon} className="text-primary" />}
      <span className={cn("truncate", railHidden)}>{children}</span>
    </a>
  )
}

export function SideNavMenu({ icon, title, defaultOpen, children }: { icon?: IconType; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <Collapsible.Root defaultOpen={defaultOpen}>
      {/* Same row as SideNavItem (height, padding, type), so a menu and a link line up, and centre in the rail. */}
      <Collapsible.Trigger className={cn("group flex h-control-md w-full items-center gap-2 rounded-inner-2 px-2.5 text-body-lg whitespace-nowrap text-foreground duration-fast-02 hover:bg-hover focus-ring-inset", railRow)}>
        {icon && <Icon as={icon} className="text-primary" />}
        <span className={cn("flex-1 truncate text-left", railHidden)}>{title}</span>
        <Icon as={ChevronDown} className={cn("duration-moderate-01 group-data-[state=open]:rotate-180", railHidden)} />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
        <div className="flex flex-col py-0.5 [&>a]:pl-8">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

/**
 * SideNavSection, a Finder-style group: small muted header ("Favourites", "Locations") over its rows.
 * `collapsible`: a disclosure chevron appears on hover at the header's end; the rows fold away (reveal, not snap).
 */
export function SideNavSection({ title, collapsible, defaultOpen = true, open: openProp, onOpenChange, children }: {
  title?: string
  collapsible?: boolean
  defaultOpen?: boolean
  /** Controlled: pass `open` + `onOpenChange` to keep one section open at a time (an accordion of sections). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [own, setOwn] = React.useState(defaultOpen)
  const open = openProp ?? own
  const setOpen = (fn: (o: boolean) => boolean) => {
    const next = fn(open)
    if (openProp === undefined) setOwn(next)
    onOpenChange?.(next)
  }
  const header = "flex h-8 w-full items-end justify-between px-2.5 pb-1 text-footnote font-semibold text-muted-foreground group-data-[rail]/nav:lg:opacity-0 group-data-[rail]/nav:lg:group-hover/nav:opacity-100"
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
        {/* Always visible: a collapsible section says so before anyone hovers it. */}
        <Icon as={ChevronDown} size="sm" className={cn("duration-moderate-01", open && "rotate-180")} />
      </button>
      <div className={cn("reveal motion-productive", open && "reveal-open")} inert={!open || undefined}>
        <div className="flex flex-col gap-px">{children}</div>
      </div>
    </div>
  )
}

/* ---------------- Right panel ---------------- */

/** RightPanel, slides over content from the right. Non-modal: the page stays usable. Width 320 (sm) · 400 (md) · 560 (lg). */
export function RightPanel({ open, onOpenChange, title, children, footer, size = "md", className }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  children: React.ReactNode
  /** Primary action(s) only, rendered as an inset ActionBar. Never a Cancel: × and Escape close the panel. */
  footer?: React.ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const [mounted, setMounted] = React.useState(open)
  if (open && !mounted) setMounted(true)
  const panel = React.useRef<HTMLElement>(null)
  // Unmount when the exit animation ends (whatever the motion speed), with a fallback if it never fires.
  React.useEffect(() => {
    if (open) return
    const t = setTimeout(() => setMounted(false), 1000)
    return () => clearTimeout(t)
  }, [open])
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])
  // Focus moves into the panel when it opens and returns to whatever opened it when it closes.
  React.useEffect(() => {
    if (!open) return
    const trigger = document.activeElement as HTMLElement | null
    const el = panel.current
    el?.focus({ preventScroll: true })
    return () => {
      // Only hand focus back if it's still with the panel (the user may have moved on to the page).
      if (trigger?.isConnected && (!el || el.contains(document.activeElement) || document.activeElement === document.body)) trigger.focus({ preventScroll: true })
    }
  }, [open])
  if (!mounted) return null
  return (
    <aside
      ref={panel}
      tabIndex={-1}
      aria-label={title}
      onAnimationEnd={(e) => { if (!open && e.target === e.currentTarget) setMounted(false) }}
      className={cn(
        // Floating, like the left panel: the same 8px inset from the window, the same radius (scope-xl) and
        // 8px padding, so everything inside is concentric (rounded-inner-2 = 16 − 8). It sits on the TOP shell
        // layer (above the side nav and header), so it gets the matching, stronger glass tier.
        "absolute top-16 right-2 bottom-2 left-2 z-50 flex flex-col glass glass-3 scope-xl p-2 outline-none sm:left-auto",
        size === "sm" ? "sm:w-80" : size === "lg" ? "sm:w-140" : "sm:w-100",
        open ? "animate-enter-panel-right" : "pointer-events-none animate-exit-panel-right",
        className,
      )}
    >
      {/* Header row: 32px, like the global header's pills, the title's centre sits on the header bar's centre. */}
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 pl-2.5">
        <h2 className="truncate text-headline">{title}</h2>
        <IconButton icon={Close} label="Close panel" shortcut="escape" tooltipSide="left" onClick={() => onOpenChange(false)} className="size-8 rounded-inner-2 px-0" />
      </div>
      {/* The body is its own surface: full height between header and footer, scrolling on its own, solid (no blur)
          so what you read never shimmers over the page. A subtle border defines its edge on the glass. Concentric with the panel (rounded-inner-2 = 16 − 8). */}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-inner-2 border border-border-subtle bg-background p-3">{children}</div>
      {footer && <ActionBar className="mt-2 overflow-hidden rounded-inner-2 border-t-0">{footer}</ActionBar>}
    </aside>
  )
}
