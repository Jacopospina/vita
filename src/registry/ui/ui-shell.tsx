import * as React from "react"
import type { IconType } from "@/registry/icons"
import { Close, Menu as MenuIcon, ChevronDown } from "@/registry/icons"
import { Collapsible } from "radix-ui"
import { cn } from "@/registry/lib/utils"
import { Truncate } from "@/registry/ui/truncate"
import { Button, IconButton, ActionBar } from "@/registry/ui/button"
import { Tooltip } from "@/registry/ui/tooltip"
import { Icon } from "@/registry/ui/icon"
import { useIndicator } from "@/registry/hooks/use-morph"

/**
 * UI Shell, the persistent frame of a product. Three parts:
 *   Header      → product name, global nav, global actions (search, notifications, help, user). A floating, frosted-glass
 *                 bar inset 8px from the window, like the LeftPanel; items inside are concentric pills. Always visible.
 *                 On a phone it sits at the BOTTOM, within the thumb's reach, compact: a centred pill as wide as its
 *                 contents (menu, the mark, the global actions).
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
  // clears the floating side nav (8 + 240 + 8, or 8 + 48 + 8 for the rail). On a phone the header is at the bottom,
  // so the room moves there. The same room is kept on the right, so page
  // content sits centred on the SCREEN, under the centred header, never pushed right by the side nav.
  // Also the containing block for anything absolutely positioned inside it, so nothing
  // stretches the document. Only vertical scrolling: a stray wide element never pans the page sideways.
  return (
    <main
      id="main-content"
      className={cn("absolute inset-0 overflow-x-hidden overflow-y-auto pt-17 [--vita-shell-top:calc(var(--spacing)*17)] max-sm:pt-0 max-sm:pb-16 max-sm:[--vita-shell-top:0px]", nav === "full" && "lg:px-64", nav === "rail" && "lg:px-16", className)}
      {...props}
    >
      {children}
    </main>
  )
}

/* ---------------- Header ---------------- */

/** Header actions are Vita buttons at 32px, in their own squircle (a button's corners are never overridden). */

export function Header({ productName, prefix, logo, badge, href = "/", children, actions, className }: {
  productName: string
  /** A small label right after the name, e.g. a release stage. */
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
    // Phone: a compact pill at the bottom, centred, as wide as what it holds (the name folds into the mark).
    <header
      className={cn(
        // Never wider than 1024px: on a wide screen the bar stays a compact, centred object, not a strip edge to edge.
        // 12px (sm) from the top of the window; everything below it starts at top-17 (12 + 48 + 8).
        "absolute inset-x-2 top-3 z-40 mx-auto flex h-12 max-w-5xl items-center gap-1 glass glass-2 scope-xl p-2",
        // Arrives first, before the page: drops in from above (rises from below on a phone, where it sits at the
        // bottom). Movement only, no blur: a filter on the glass bar would cut it off from its backdrop.
        "animate-drop-in max-sm:animate-enter-list",
        "max-sm:top-auto max-sm:bottom-2 max-sm:mx-auto max-sm:w-fit max-sm:max-w-full",
        className,
      )}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to main content
      </a>
      <IconButton icon={navOpen ? Close : MenuIcon} label={navOpen ? "Close menu" : "Open menu"} onClick={() => setNavOpen(!navOpen)} className="size-8 lg:hidden" />
      <a href={href} aria-label={`${prefix ? `${prefix} ` : ""}${productName}, home`} className={cn("flex h-8 items-center gap-1 rounded-inner-2 px-3 text-body whitespace-nowrap duration-fast-02 hover:bg-hover focus-ring-inset", logo && "max-sm:w-8 max-sm:justify-center max-sm:px-0")}>
        {logo && <span aria-hidden className="mr-1 flex shrink-0 max-sm:mr-0">{logo}</span>}
        {/* With a mark, the words step aside on a phone: the mark is the name. */}
        {prefix && <span className={cn("font-normal text-muted-foreground", logo && "max-sm:hidden")}>{prefix}</span>}
        <span className={cn("font-semibold", logo && "max-sm:hidden")}>{productName}</span>
      </a>
      {badge && <span className="-ml-2 mr-1 flex shrink-0 items-center max-sm:hidden">{badge}</span>}
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

/** `value` (a count, say) sits beside the icon in the same button: still one header action, named by its tooltip. */
export const HeaderGlobalAction = React.forwardRef<HTMLButtonElement, { icon: IconType; label: string; active?: boolean; badge?: boolean; value?: React.ReactNode; onClick?: () => void } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value">>(
  ({ icon, label, active, badge, value, className, ...props }, ref) => (
    <span className="relative flex">
      {value === undefined ? (
        <IconButton ref={ref} icon={icon} label={label} pressed={active} className={cn("size-8", className)} {...props} />
      ) : (
        <Tooltip content={label} side="bottom">
          {/* The Button as it is (its squircle and icon slot, far right), only as tall as the other header actions (32px). */}
          <Button ref={ref} variant="ghost" size="sm" icon={icon} aria-label={label} aria-pressed={active} className={cn("h-8", active && "bg-selected text-selected-foreground", className)} {...props}>
            <span className="font-normal tabular-nums">{value}</span>
          </Button>
        </Tooltip>
      )}
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
      {/* The dim covers the whole window on a phone, under the bottom header (z-40), which stays live above it. */}
      {navOpen && <div className="absolute inset-0 top-17 z-30 animate-enter-fade bg-overlay max-sm:top-0 lg:hidden" onClick={() => setNavOpen(false)} />}
      <nav
        aria-label={label}
        data-rail={rail || undefined}
        className={cn(
          // Floating sidebar: frosted glass, inset from the window, rounded; rows inside are concentric (rounded-inner-2).
          // The frost lives on a layer behind the rows, not on the nav itself: an element that blurs its backdrop hides
          // its own content from any glass inside it, so a sticky glass control (a filter) could not frost the rows.
          "group/nav z-30 flex shrink-0 flex-col overflow-hidden glass glass-1 backdrop-filter-none! scope-xl",
          // Floats over the scrolling page, below the header (top-17 = 12 above it + 48 tall + 8 below), inset 8px at the sides.
          // On a phone the header is at the bottom, so the sheet keeps clear of it there instead.
          "absolute top-17 bottom-2 left-2 w-60 -translate-x-[calc(100%+1rem)] duration-moderate-02 ease-productive max-sm:top-2 max-sm:bottom-16",
          // A phone gets the whole width (inset like the header), so every row is a full-width target.
          "max-sm:right-2 max-sm:w-auto",
          mobileOnly ? "lg:hidden" : "lg:translate-x-0",
          // Open over the page on a small screen it's a sheet, not a sidebar: solid, so nothing behind competes with it.
          navOpen && "translate-x-0 max-lg:bg-raised!",
          rail && "lg:w-12 lg:hover:w-60",
          className,
        )}
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 glass glass-1 border-0! bg-transparent! shadow-none" />
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto p-2">{children}</div>
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

/**
 * A long label never widens the nav: it truncates and glides to its end on hover (Truncate ticker). `badge` sits
 * at the row's end, outside the label, so it always stays visible (a "Setup" tag, a count).
 */
export function SideNavItem({ href, icon, active, badge, children, onClick }: { href?: string; icon?: IconType; active?: boolean; badge?: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
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
      {typeof children === "string"
        ? <Truncate mode="ticker" className={cn("flex-1", railHidden)}>{children}</Truncate>
        : <span className={cn("min-w-0 flex-1 truncate", railHidden)}>{children}</span>}
      {badge && <span className={cn("flex shrink-0", railHidden)}>{badge}</span>}
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
        "absolute top-17 right-2 bottom-2 left-2 z-50 flex flex-col glass glass-3 scope-xl p-2 outline-none max-sm:top-2 max-sm:bottom-16 sm:left-auto",
        size === "sm" ? "sm:w-80" : size === "lg" ? "sm:w-140" : "sm:w-100",
        open ? "animate-enter-panel-right" : "pointer-events-none animate-exit-panel-right",
        className,
      )}
    >
      {/* Header row: 32px, like the global header's actions, the title's centre sits on the header bar's centre. */}
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 pl-2.5">
        <h2 className="truncate text-headline">{title}</h2>
        <IconButton icon={Close} label="Close panel" shortcut="escape" tooltipSide="left" onClick={() => onOpenChange(false)} className="size-8 px-0" />
      </div>
      {/* The body is its own surface: full height between header and footer, scrolling on its own, solid (no blur)
          so what you read never shimmers over the page. A subtle border defines its edge on the glass. Concentric with the panel (rounded-inner-2 = 16 − 8). */}
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto rounded-inner-2 border border-border-subtle bg-background p-3">{children}</div>
      {footer && <ActionBar className="mt-2 overflow-hidden rounded-inner-2 border-t-0">{footer}</ActionBar>}
    </aside>
  )
}
