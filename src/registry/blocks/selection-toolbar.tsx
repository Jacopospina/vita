import * as React from "react"
import { ChevronLeft, ChevronRight, Copy, Cut, Paste, TrashCan } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { useExit } from "@/registry/hooks/use-exit"
import { useCoarsePointer } from "@/registry/hooks/use-media"

/**
 * SelectionToolbar, the capsule of actions that floats over text the person has just selected: Cut, Copy, Paste and
 * Delete in editable text, Copy and your own actions (Ask AI, Comment, Translate) in text they can only read. More
 * actions than fit page sideways behind a chevron. For formatting an editor's text, use the Text toolbar pattern;
 * for actions on a whole item, a Menu.
 */

export interface SelectionContext {
  /** The selected text. */
  text: string
  /** True when the selection is inside a field or editable text. */
  editable: boolean
}

export interface SelectionAction {
  id: string
  label: string
  icon?: IconType
  /** danger: removes something (Delete). */
  tone?: "default" | "danger"
  /** Only offered when the selection can be edited (Cut, Paste, Delete). */
  editableOnly?: boolean
  onSelect: (selection: SelectionContext) => void | Promise<void>
}

const run = (command: string) => document.execCommand(command)

/** The clipboard set, in the order people expect: Cut, Copy, Paste, Delete. */
export const editActions: SelectionAction[] = [
  { id: "cut", label: "Cut", icon: Cut, editableOnly: true, onSelect: () => void run("cut") },
  { id: "copy", label: "Copy", icon: Copy, onSelect: ({ text }) => navigator.clipboard?.writeText(text) },
  {
    id: "paste",
    label: "Paste",
    icon: Paste,
    editableOnly: true,
    onSelect: async () => {
      const text = await navigator.clipboard?.readText?.().catch(() => "")
      if (text) document.execCommand("insertText", false, text)
    },
  },
  { id: "delete", label: "Delete", icon: TrashCan, tone: "danger", editableOnly: true, onSelect: () => void run("delete") },
]

interface Rect { top: number; bottom: number; left: number; width: number }

/** Where the selection is: a text range, or a field with a selection inside it. */
function readSelection(root: HTMLElement): (SelectionContext & { rect: Rect }) | null {
  const active = document.activeElement
  if ((active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) && root.contains(active)) {
    const { selectionStart: a, selectionEnd: b } = active
    if (a == null || b == null || a === b) return null
    const r = active.getBoundingClientRect()
    return { text: active.value.slice(a, b), editable: !active.readOnly && !active.disabled, rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width } }
  }
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return null
  const text = sel.toString()
  if (!text.trim()) return null
  const r = range.getBoundingClientRect()
  const host = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement
  return { text, editable: !!host?.closest("[contenteditable=''],[contenteditable='true']"), rect: { top: r.top, bottom: r.bottom, left: r.left, width: r.width } }
}

const GAP = 8
const EDGE = 8

export function SelectionToolbar({ actions = editActions, perPage = 4, label = "Selection actions", className, children }: {
  /** Defaults to the clipboard set; add your own after it. Editable-only actions hide in read-only text. */
  actions?: SelectionAction[]
  /** Actions per page before the chevron. */
  perPage?: number
  label?: string
  className?: string
  /** The text it watches: selections outside it are left to the browser. */
  children: React.ReactNode
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const [sel, setSel] = React.useState<(SelectionContext & { rect: Rect }) | null>(null)
  const [page, setPage] = React.useState(0)
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null)
  const [leaving, exit] = useExit(110)
  const touch = useCoarsePointer()

  const available = React.useMemo(() => actions.filter((a) => sel?.editable || !a.editableOnly), [actions, sel?.editable])
  const pages = Math.max(1, Math.ceil(available.length / perPage))
  const shown = available.slice(page * perPage, page * perPage + perPage)

  // Shows the moment the selection is made (pointer or keyboard released), never while it's still being dragged.
  React.useEffect(() => {
    const el = root.current
    if (!el) return
    // After the browser has finished updating the selection for this release.
    const settle = () => window.setTimeout(() => {
      const next = readSelection(el)
      setSel(next)
      setPage(0)
    }, 0)
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey || e.key === "Shift" || (e.key === "a" && (e.metaKey || e.ctrlKey))) settle() }
    const onChange = () => { if (!readSelection(el)) setSel((s) => (s ? null : s)) }
    el.addEventListener("pointerup", settle)
    el.addEventListener("keyup", onKey)
    document.addEventListener("selectionchange", onChange)
    return () => {
      el.removeEventListener("pointerup", settle)
      el.removeEventListener("keyup", onKey)
      document.removeEventListener("selectionchange", onChange)
    }
  }, [])

  // Above the selection, centred; below it when there's no room, and always below under a finger (the phone's own
  // menu sits above). Follows the text as the page scrolls.
  React.useLayoutEffect(() => {
    if (!sel || !root.current) return setPos(null)
    const place = () => {
      const now = readSelection(root.current!)
      const r = now?.rect ?? sel.rect
      const w = bar.current?.offsetWidth ?? 0
      const h = bar.current?.offsetHeight ?? 0
      const above = r.top - GAP - h
      const top = !touch && above >= EDGE ? above : r.bottom + GAP
      const left = Math.min(Math.max(EDGE, r.left + r.width / 2 - w / 2), window.innerWidth - w - EDGE)
      setPos({ top, left })
    }
    place()
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
    }
  }, [sel, touch, page])

  const close = React.useCallback(() => exit(() => setSel(null)), [exit])

  React.useEffect(() => {
    if (!sel) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [sel, close])

  const choose = async (a: SelectionAction) => {
    if (!sel) return
    await a.onSelect({ text: sel.text, editable: sel.editable })
    close()
  }

  // Roving focus: one Tab stop, arrows move between actions.
  const onBarKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return
    const items = [...(bar.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(i + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length]?.focus()
    e.preventDefault()
  }

  return (
    <div ref={root} className={className}>
      {children}
      {sel && available.length > 0 && (
        <div
          ref={bar}
          role="toolbar"
          aria-label={label}
          onKeyDown={onBarKey}
          // Pressing an action must not clear the selection it acts on.
          onPointerDown={(e) => e.preventDefault()}
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          className={cn(
            "fixed z-50 flex h-control-lg items-center rounded-pill glass glass-3 p-1 text-body",
            leaving ? "animate-exit-scale" : "animate-enter-surface",
          )}
        >
          {page > 0 && (
            <PageButton icon={ChevronLeft} label="Previous actions" onClick={() => setPage((p) => p - 1)} />
          )}
          {/* A page swap cross-fades in place; the capsule's width follows. */}
          <div key={page} className="flex h-full items-center animate-enter-fade">
            {shown.map((a, i) => (
              <React.Fragment key={a.id}>
                {i > 0 && <span aria-hidden="true" className="h-4 w-px shrink-0 bg-divider" />}
                <button
                  type="button"
                  tabIndex={i === 0 && page === 0 ? 0 : -1}
                  onClick={() => void choose(a)}
                  className={cn(
                    "flex h-full items-center rounded-pill px-3 whitespace-nowrap focus-ring",
                    "duration-fast-02 ease-productive hover:bg-hover active:scale-97 active:bg-active active:duration-fast-01 motion-reduce:active:scale-100",
                    a.tone === "danger" ? "text-error-foreground" : "text-foreground",
                  )}
                >
                  {a.label}
                </button>
              </React.Fragment>
            ))}
          </div>
          {page < pages - 1 && (
            <PageButton icon={ChevronRight} label="More actions" onClick={() => setPage((p) => p + 1)} />
          )}
        </div>
      )}
    </div>
  )
}

/** Sideways chevrons page the actions (they open to the side, decision: disclosure chevrons). */
function PageButton({ icon, label, onClick }: { icon: IconType; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onClick={onClick}
      className="flex aspect-square h-full shrink-0 items-center justify-center rounded-full bg-layer-2 text-foreground focus-ring duration-fast-02 ease-productive hover:bg-hover active:scale-95 active:bg-active active:duration-fast-01 motion-reduce:active:scale-100"
    >
      <Icon as={icon} />
    </button>
  )
}
