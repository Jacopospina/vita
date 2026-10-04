import * as React from "react"
import { ChevronLeft, ChevronRight, Copy, Cut, Paste, TrashCan } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Icon } from "@/registry/ui/icon"
import { useExit } from "@/registry/hooks/use-exit"
import { useCoarsePointer } from "@/registry/hooks/use-media"
import { Composer } from "@/registry/ui/composer"
import { Thinking } from "@/registry/ui/thinking"
import { AILabel, AISurface } from "@/registry/ui/ai-label"
import { Button, ButtonSet } from "@/registry/ui/button"

/**
 * SelectionToolbar, the capsule of actions that floats over text the person has just selected: Cut, Copy, Paste and
 * Delete in editable text, Copy and your own actions (Ask AI, Comment, Translate) in text they can only read. More
 * actions than fit page sideways behind a chevron. With `onAsk`, "Ask AI" comes first: the capsule opens into a
 * small panel to ask about the selection, and the answer arrives in place (with Replace, in editable text).
 * For formatting an editor's text, use the Text toolbar pattern; for actions on a whole item, a Menu.
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

/** What the selection was, kept so it can be found again after focus moves (asking, replacing). */
type Anchor = { range: Range } | { field: HTMLInputElement | HTMLTextAreaElement; start: number; end: number }
type Selected = SelectionContext & { anchor: Anchor }

export interface AskRequest extends SelectionContext {
  question: string
}

const anchorRect = (a: Anchor) => ("range" in a ? a.range.getBoundingClientRect() : a.field.getBoundingClientRect())

/** Where the selection is: a text range, or a field with a selection inside it. */
function readSelection(root: HTMLElement, ignore?: HTMLElement | null): Selected | null {
  const active = document.activeElement
  if ((active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) && root.contains(active) && !ignore?.contains(active)) {
    const { selectionStart: a, selectionEnd: b } = active
    if (a == null || b == null || a === b) return null
    return { text: active.value.slice(a, b), editable: !active.readOnly && !active.disabled, anchor: { field: active, start: a, end: b } }
  }
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer) || ignore?.contains(range.commonAncestorContainer)) return null
  const text = sel.toString()
  if (!text.trim()) return null
  const host = range.commonAncestorContainer instanceof Element ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement
  return { text, editable: !!host?.closest("[contenteditable=''],[contenteditable='true']"), anchor: { range: range.cloneRange() } }
}

/** Puts the selection back where it was, so Replace types over exactly those words. */
function restore(a: Anchor) {
  if ("field" in a) {
    a.field.focus()
    a.field.setSelectionRange(a.start, a.end)
    return
  }
  const node = a.range.commonAncestorContainer
  ;(node instanceof HTMLElement ? node : node.parentElement)?.closest<HTMLElement>("[contenteditable]")?.focus()
  const s = window.getSelection()
  s?.removeAllRanges()
  s?.addRange(a.range)
}

/** While focus is in the ask panel the real selection is gone; a highlight keeps the words visibly chosen. */
function markRange(range: Range | null) {
  const css = CSS as unknown as { highlights?: Map<string, unknown> }
  const H = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight
  if (!css.highlights || !H) return
  if (range) css.highlights.set("vita-selection", new H(range))
  else css.highlights.delete("vita-selection")
}

const GAP = 8
const EDGE = 8

export function SelectionToolbar({ actions = editActions, onAsk, askSuggestions, perPage = 4, label = "Selection actions", className, children }: {
  /** Defaults to the clipboard set; add your own after it. Editable-only actions hide in read-only text. */
  actions?: SelectionAction[]
  /** Answers a question about the selection. When set, "Ask AI" comes first in the capsule. */
  onAsk?: (request: AskRequest) => Promise<string>
  /** One-tap questions in the ask panel. Defaults by whether the text can be edited. */
  askSuggestions?: string[]
  /** Actions per page before the chevron. */
  perPage?: number
  label?: string
  className?: string
  /** The text it watches: selections outside it are left to the browser. */
  children: React.ReactNode
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const bar = React.useRef<HTMLDivElement>(null)
  const [sel, setSel] = React.useState<Selected | null>(null)
  const [ask, setAsk] = React.useState<{ question?: string; answer?: string; pending?: boolean } | null>(null)
  const asking = React.useRef(false)
  React.useLayoutEffect(() => {
    asking.current = !!ask
  })
  const [page, setPage] = React.useState(0)
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(null)
  const [leaving, exit] = useExit(110)
  const touch = useCoarsePointer()

  const available = React.useMemo(() => {
    const own = actions.filter((a) => sel?.editable || !a.editableOnly)
    return onAsk ? [{ id: "ask-ai", label: "Ask AI", onSelect: () => {} } as SelectionAction, ...own] : own
  }, [actions, sel?.editable, onAsk])
  const pages = Math.max(1, Math.ceil(available.length / perPage))
  const shown = available.slice(page * perPage, page * perPage + perPage)

  // Shows the moment the selection is made (pointer or keyboard released), never while it's still being dragged.
  React.useEffect(() => {
    const el = root.current
    if (!el) return
    // After the browser has finished updating the selection for this release.
    // Releases inside the capsule or the ask panel belong to them, not to a new selection.
    const settle = (e: Event) => {
      if (bar.current?.contains(e.target as Node)) return
      window.setTimeout(() => {
        if (asking.current) return
        setSel(readSelection(el, bar.current))
        setPage(0)
      }, 0)
    }
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey || e.key === "Shift" || (e.key === "a" && (e.metaKey || e.ctrlKey))) settle(e) }
    const onChange = () => { if (!asking.current && !readSelection(el, bar.current)) setSel((s) => (s ? null : s)) }
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
      const r = anchorRect(sel.anchor)
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
  }, [sel, touch, page, ask])

  const close = React.useCallback(() => exit(() => { setSel(null); setAsk(null) }), [exit])

  // Escape closes; while asking, so does a press anywhere outside the panel.
  React.useEffect(() => {
    if (!sel) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    const onDown = (e: PointerEvent) => { if (asking.current && !bar.current?.contains(e.target as Node)) close() }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
    }
  }, [sel, close])

  // The chosen words stay marked while the question is being written and answered.
  React.useEffect(() => {
    markRange(ask && sel && "range" in sel.anchor ? sel.anchor.range : null)
    return () => markRange(null)
  }, [ask, sel])

  // Opening the panel puts the cursor in the question, ready to type.
  React.useEffect(() => {
    if (ask && !ask.question) bar.current?.querySelector("textarea")?.focus()
  }, [ask])

  const send = async (question: string) => {
    if (!sel || !onAsk) return
    setAsk({ question, pending: true })
    const answer = await onAsk({ question, text: sel.text, editable: sel.editable }).catch(() => "That didn't work. Try asking again.")
    setAsk({ question, answer })
  }

  const replace = () => {
    if (!sel || !ask?.answer) return
    restore(sel.anchor)
    document.execCommand("insertText", false, ask.answer)
    close()
  }

  const choose = async (a: SelectionAction) => {
    if (!sel) return
    if (a.id === "ask-ai") return setAsk({})
    await a.onSelect({ text: sel.text, editable: sel.editable })
    close()
  }

  const suggestions = askSuggestions ?? (sel?.editable ? ["Make it shorter", "Fix the grammar", "Explain this"] : ["Explain this", "Summarise", "Translate to English"])

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
      {sel && ask && (
        <div
          ref={bar}
          role="dialog"
          aria-label="Ask AI about the selection"
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
          className={cn(
            "fixed z-50 flex w-96 max-w-[calc(100vw-1rem)] flex-col gap-2 scope-xl glass glass-3 p-2 text-body",
            leaving ? "animate-exit-scale" : "animate-enter-surface",
          )}
        >
          {/* What the question is about, quoted, so the answer has its context in view. */}
          <p className="line-clamp-2 border-l-2 border-border-strong pl-2 text-footnote text-muted-foreground">{sel.text}</p>
          {ask.question && <p className="px-1 font-medium">{ask.question}</p>}
          {ask.pending && (
            <div className="flex items-center gap-2 px-1 text-muted-foreground">
              <Thinking mode="generating" size="sm" label="Reading the selection" />
              <span>Reading the selection</span>
            </div>
          )}
          {ask.answer && (
            <AISurface className="flex flex-col gap-2 animate-enter-fade">
              <div className="flex items-start gap-2">
                <AILabel title="Answered from your selection">Answered from the words you selected, nothing else.</AILabel>
                <p className="min-w-0 flex-1">{ask.answer}</p>
              </div>
              <ButtonSet>
                {sel.editable && <Button size="sm" onClick={replace}>Replace</Button>}
                <Button size="sm" variant="secondary" onClick={() => { void navigator.clipboard?.writeText(ask.answer!); close() }}>Copy</Button>
              </ButtonSet>
            </AISurface>
          )}
          <Composer
            label="Ask about the selection"
            placeholder={ask.answer ? "Ask a follow-up" : "Ask about the selection"}
            voice={false}
            attachments={false}
            suggestions={ask.question ? [] : suggestions}
            loading={ask.pending}
            onSubmit={(q) => void send(q)}
          />
        </div>
      )}
      {sel && !ask && available.length > 0 && (
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
                    a.tone === "danger" ? "text-error-foreground" : a.id === "ask-ai" ? "font-medium text-primary" : "text-foreground",
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
