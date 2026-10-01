import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Search as SearchIcon } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { IconButton } from "@/registry/ui/button"
import { AnimatedText } from "@/registry/ui/animated"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Option } from "@/registry/ui/option"

/**
 * GlobalSearch — Spotlight for the product. A search button among the header's global actions; clicking it (or ⌘K
 * from anywhere) summons a floating glass panel near the top of the screen: one big field, and results that grow
 * beneath it, grouped by section, the top hit already highlighted. Arrows move, Enter opens, Esc clears — and a second
 * Esc (or a click away) dismisses. No scrim: the page stays visible behind the glass.
 * Searching a list on a page → Search. Filtering a table → the table's toolbar.
 */
export interface GlobalSearchItem {
  id: string
  label: string
  /** Section the result belongs to ("Components", "Settings"…); results are grouped by it. */
  group?: string
  description?: string
  icon?: IconType
  /** What the preview square shows while this result is highlighted. Default: section, title and description. */
  preview?: React.ReactNode | (() => React.ReactNode)
  onSelect: () => void
}

/**
 * Shrinks any content to fit the preview square (never enlarges), centred and inert — a tangible thumbnail.
 * Content that sizes to its container (full-width layouts, shells) would collapse to nothing, so it gets a fixed
 * 640px stage to lay out on, which is then scaled down like a screenshot.
 */
function PreviewFit({ children }: { children: React.ReactNode }) {
  const frame = React.useRef<HTMLDivElement>(null)
  const inner = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  const [stage, setStage] = React.useState(false)
  React.useLayoutEffect(() => {
    const f = frame.current, c = inner.current
    if (!f || !c) return
    const fit = () => {
      if (!stage && c.offsetWidth < 8) return setStage(true)
      setScale(Math.min(1, f.clientWidth / Math.max(1, c.offsetWidth), f.clientHeight / Math.max(1, c.offsetHeight)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(c)
    return () => ro.disconnect()
  }, [stage])
  return (
    <div ref={frame} aria-hidden className="relative flex size-full items-center justify-center overflow-hidden">
      <div
        ref={inner}
        inert
        className={cn("pointer-events-none shrink-0", stage ? "w-160" : "w-max max-w-160")}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}

export function GlobalSearch({ items, placeholder = "Search", shortcut = "mod+k", limit = 8, className }: {
  items: GlobalSearchItem[]
  placeholder?: string
  shortcut?: string
  /** Most results shown at once. */
  limit?: number
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = React.useId()
  // ⌘K is bound by the trigger button itself (its shortcut presses it), so it toggles exactly once.
  const q = query.trim().toLowerCase()
  // Best match first: labels that START with the query, then the rest.
  const results = q
    ? items
        .filter((i) => i.label.toLowerCase().includes(q) || i.group?.toLowerCase().includes(q))
        .sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)))
        .slice(0, limit)
    : []
  const close = () => { setOpen(false); setQuery("") }
  const current = results[active]
  const preview = current ? (typeof current.preview === "function" ? current.preview() : current.preview) : null
  const choose = (i: GlobalSearchItem) => { close(); i.onSelect() }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      {/* The trigger: a search button, like the header's other global actions (its tooltip shows ⌘K). */}
      <DialogPrimitive.Trigger asChild>
        <IconButton icon={SearchIcon} label="Search" shortcut={shortcut} className={className} />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        {/* No scrim, like Spotlight — the overlay only catches the click that dismisses. */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => { if (query) { e.preventDefault(); setQuery(""); setActive(0) } }}
          className="fixed top-[18vh] left-1/2 z-50 w-[min(48rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden scope-xl glass glass-4 text-foreground outline-none data-[state=closed]:animate-exit-scale data-[state=open]:animate-enter-dialog"
        >
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <div className="flex h-16 items-center gap-3 px-4">
            <Icon as={SearchIcon} size="md" className="text-muted-foreground" />
            <input
              autoFocus
              role="combobox"
              aria-label="Search"
              aria-expanded={results.length > 0}
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
              placeholder={placeholder}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0) }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
                if (e.key === "Enter" && results[active]) { e.preventDefault(); choose(results[active]) }
              }}
              className="h-full min-w-0 flex-1 bg-transparent text-title-2 font-normal text-foreground outline-none placeholder:text-placeholder"
            />
          </div>
          {/* Results grow beneath the field (the panel's height morphs), separated by a hairline. */}
          <div className={cn("reveal motion-productive", q && "reveal-open")}>
            <div>
              <div className="flex border-t border-divider">
              <div id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] min-w-0 flex-1 overflow-y-auto p-1.5">
                {results.length === 0 && <p className="px-2.5 py-3 text-body text-muted-foreground">No results for “{query}”</p>}
                {results.map((r, i) => {
                  const header = r.group && r.group !== results[i - 1]?.group ? (i === 0 ? `Top hit · ${r.group}` : r.group) : null
                  return (
                    <React.Fragment key={r.id}>
                      {header && <p role="presentation" className="px-2.5 pt-2 pb-1 text-caption font-medium text-muted-foreground">{header}</p>}
                      <Option
                        id={`${listId}-${i}`}
                        label={r.label}
                        icon={r.icon}
                        highlighted={i === active}
                        onMouseEnter={() => setActive(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(r)}
                      />
                    </React.Fragment>
                  )
                })}
              </div>
              {/* The preview square: what the highlighted result is, before you open it. */}
              {current && (
                <aside aria-live="polite" className="hidden w-60 shrink-0 p-1.5 sm:block">
                  <div className="flex aspect-square flex-col gap-2 overflow-hidden scope-lg bg-layer-1 p-4">
                    {preview != null && preview !== false ? (
                      <PreviewFit key={current.id}>{preview}</PreviewFit>
                    ) : (
                      // No tangible preview for this result: say what it is instead — never an empty square.
                      <>
                        {current.icon && <IconPlaceholder icon={current.icon} tone="brand" size="lg" />}
                        {current.group && <span className="text-caption text-muted-foreground">{current.group}</span>}
                        <span className="text-headline text-foreground"><AnimatedText>{current.label}</AnimatedText></span>
                        {current.description && <p className="line-clamp-6 text-body text-muted-foreground">{current.description}</p>}
                      </>
                    )}
                  </div>
                </aside>
              )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
