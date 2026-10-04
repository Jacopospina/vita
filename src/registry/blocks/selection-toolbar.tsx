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
  const [pos, setPos] = React.useState<{ left: number; top?: number; bottom?: number } | null>(null)
  // Where the surface was anchored when it appeared: its left edge relative to the selection, and the side it took.
  // Width and height changes (paging, the ask panel) grow it from that anchor, so it never shifts sideways.
  const anchored = React.useRef<{ for: Selected; dx: number; above: boolean } | null>(null)
  // The content's own size: the surface glides to it, so paging, opening the ask panel and an answer arriving
  // grow or shrink it instead of jumping.
  const inner = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)
  const open = React.useRef(false)
  // Nothing travels on arrival: the surface appears where it belongs, and only once it has been painted there do
  // size changes (paging, the ask panel) glide. Its position never animates.
  const [settled, setSettled] = React.useState(false)
  React.useLayoutEffect(() => {
    open.current = !!sel
  })
  const [leaving, exit] = useExit(110)
  const touch = useCoarsePointer()

  const available = React.useMemo(() => {
    const own = actions.filter((a) => sel?.editable || !a.editableOnly)
    return onAsk ? [{ id: "ask-ai", label: "Ask AI", onSelect: () => {} } as SelectionAction, ...own] : own
  }, [actions, sel?.editable, onAsk])
  const pages = Math.max(1, Math.ceil(available.length / perPage))
  const pageList = React.useMemo(() => Array.from({ length: pages }, (_, p) => available.slice(p * perPage, p * perPage + perPage)), [available, pages, perPage])
  // Every page sits on one track that slides sideways inside the capsule; each page's width and place are measured.
  const pageRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [geom, setGeom] = React.useState<{ w: number[]; x: number[]; chevron: number; pad: number; h: number } | null>(null)

  React.useEffect(() => {
    if (!pos || settled) return
    const id = window.requestAnimationFrame(() => window.requestAnimationFrame(() => setSettled(true)))
    return () => window.cancelAnimationFrame(id)
  }, [pos, settled])

  const selRef = React.useRef<Selected | null>(null)
  React.useLayoutEffect(() => {
    selRef.current = sel
  })
  // A new selection made while the old one is leaving keeps its capsule: the exit only clears what it was closing.
  const close = React.useCallback(() => {
    const closing = selRef.current
    exit(() => {
      if (selRef.current !== closing) return
      setSel(null)
      setAsk(null)
      setPos(null)
      setSize(null)
      setGeom(null)
      setSettled(false)
    })
  }, [exit])
  const closeRef = React.useRef(close)
  React.useLayoutEffect(() => {
    closeRef.current = close
  })

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
        const next = readSelection(el, bar.current)
        if (next) {
          setSel(next)
          setPage(0)
        } else if (open.current) closeRef.current()
      }, 0)
    }
    const onKey = (e: KeyboardEvent) => { if (e.shiftKey || e.key === "Shift" || (e.key === "a" && (e.metaKey || e.ctrlKey))) settle(e) }
    // A selection that goes away takes the capsule with it, through its exit.
    const onChange = () => { if (open.current && !asking.current && !readSelection(el, bar.current)) closeRef.current() }
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
    if (!sel || ask) return
    const els = pageRefs.current.slice(0, pageList.length)
    if (els.some((e) => !e)) return
    const row = inner.current
    if (!row) return
    const cs = getComputedStyle(row)
    setGeom({
      w: els.map((e) => e!.offsetWidth),
      x: els.map((e) => e!.offsetLeft),
      chevron: row.querySelector<HTMLElement>("[aria-label='More actions']")?.offsetWidth ?? 0,
      pad: parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight),
      h: row.offsetHeight,
    })
  }, [sel, ask, pageList])

  React.useLayoutEffect(() => {
    const el = inner.current
    // Only the ask panel is measured as it changes; the capsule's size is known ahead (below).
    if (!el || !ask) return setSize(null)
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [sel, ask])

  // The capsule's size for the page it is going to, known before it moves: the surface, the page window, the
  // track and the chevrons all travel together, in the same 150ms, with nothing trailing behind.
  const box = ask
    ? size
    : geom && { w: geom.pad + geom.w[page] + (page > 0 ? geom.chevron : 0) + (page < pages - 1 ? geom.chevron : 0), h: geom.h }

  React.useLayoutEffect(() => {
    if (!sel || !root.current || !box) return
    const place = () => {
      const r = anchorRect(sel.anchor)
      const { w, h } = box
      if (anchored.current?.for !== sel) {
        const left = Math.min(Math.max(EDGE, r.left + r.width / 2 - w / 2), window.innerWidth - w - EDGE)
        anchored.current = { for: sel, dx: left - r.left, above: !touch && r.top - GAP - h >= EDGE }
      }
      const a = anchored.current
      // Only a window edge may push it back in; otherwise its left edge stays where it appeared.
      const left = Math.min(Math.max(EDGE, r.left + a.dx), window.innerWidth - w - EDGE)
      // Above, it hangs from its bottom edge (it grows upward, away from the words); below, from its top.
      setPos(a.above ? { left, bottom: window.innerHeight - (r.top - GAP) } : { left, top: r.bottom + GAP })
    }
    place()
    window.addEventListener("scroll", place, true)
    window.addEventListener("resize", place)
    return () => {
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("resize", place)
    }
  }, [sel, touch, box?.w, box?.h]) // eslint-disable-line react-hooks/exhaustive-deps

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
      {sel && (ask || available.length > 0) && (
        // One surface for the capsule and the ask panel: its size and corners glide between them. It arrives where it
        // belongs on its first frame (its enter animation, not a glide), and its position never animates.
        <div
          ref={bar}
          role={ask ? "dialog" : "toolbar"}
          aria-label={ask ? "Ask AI about the selection" : label}
          onKeyDown={ask ? undefined : onBarKey}
          // Pressing an action must not clear the selection it acts on (the ask panel needs its own focus).
          onPointerDown={ask ? undefined : (e) => e.preventDefault()}
          data-settled={settled ? "" : undefined}
          style={pos ? { left: pos.left, top: pos.top, bottom: pos.bottom, width: box?.w, height: box?.h } : { top: -9999, left: -9999, width: box?.w, height: box?.h }}
          className={cn(
            "fixed z-50 overflow-hidden glass glass-3 text-body",
            ask ? "rounded-xl" : "rounded-pill",
            "transition-none data-[settled]:transition-[width,height,border-radius] data-[settled]:duration-moderate-01 data-[settled]:ease-productive",
            leaving ? "animate-exit-scale" : "animate-enter-surface",
          )}
        >
          {ask ? (
            <div ref={inner} key="ask" className="flex w-96 max-w-[calc(100vw-1rem)] flex-col gap-2 p-2 animate-enter-fade">
              {/* What the question is about, quoted, so the answer has its context in view. */}
              <p className="line-clamp-2 border-l-2 border-border-strong pl-2 text-footnote text-muted-foreground">{sel.text}</p>
              {ask.question && <p key={ask.question} className="px-1 font-medium animate-enter-fade">{ask.question}</p>}
              {/* The work, then the answer, in the same place: a swap that fades in where the other was. */}
              {ask.pending && (
                <div key="pending" className="flex items-center gap-2 px-1 text-muted-foreground animate-enter-fade">
                  <Thinking mode="generating" size="sm" label="Reading the selection" />
                  <span>Reading the selection</span>
                </div>
              )}
              {ask.answer && (
                <AISurface key="answer" className="flex flex-col gap-2 animate-enter-fade">
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
          ) : (
            <div ref={inner} key="actions" className="flex h-control-lg w-max items-center p-1">
              {/* The chevrons open and close sideways (reveal-x), so the row makes room instead of jumping. */}
              <div className={cn("reveal-x h-full", page > 0 && "reveal-x-open")} inert={page === 0 || undefined}>
                <div className="flex h-full">
                  <PageButton icon={ChevronLeft} label="Previous actions" onClick={() => setPage((p) => p - 1)} />
                </div>
              </div>
              {/* The pages ride one track: paging slides it sideways under the capsule's edge, and the window
                  glides to the new page's width. Pages out of view are inert. */}
              <div className={cn("h-full overflow-hidden", settled ? "transition-[width] duration-moderate-01 ease-productive" : "transition-none")} style={{ width: geom?.w[page] }}>
                <div
                  className={cn("flex h-full w-max", settled ? "transition-transform duration-moderate-01 ease-productive" : "transition-none")}
                  style={{ transform: `translateX(${-(geom?.x[page] ?? 0)}px)` }}
                >
                  {pageList.map((group, p) => (
                    <div key={p} ref={(n) => { pageRefs.current[p] = n }} inert={p !== page || undefined} className="flex h-full shrink-0 items-center">
                      {group.map((a, i) => (
                        <React.Fragment key={a.id}>
                          {i > 0 && <span aria-hidden="true" className="h-4 w-px shrink-0 bg-divider" />}
                          <button
                            type="button"
                            tabIndex={i === 0 && p === page ? 0 : -1}
                            onClick={() => void choose(a)}
                            className={cn(
                              "flex h-full items-center rounded-pill px-3 whitespace-nowrap focus-ring",
                              "duration-fast-02 ease-productive hover:bg-hover active:scale-97 active:bg-active active:duration-fast-01 motion-reduce:active:scale-100",
                              // Ask AI speaks in the AI spectrum, the one look that means AI.
                              a.tone === "danger" ? "text-error-foreground" : a.id === "ask-ai" ? "font-semibold" : "text-foreground",
                            )}
                          >
                            {a.id === "ask-ai" ? <span className="text-ai">{a.label}</span> : a.label}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className={cn("reveal-x h-full", page < pages - 1 && "reveal-x-open")} inert={page >= pages - 1 || undefined}>
                <div className="flex h-full">
                  <PageButton icon={ChevronRight} label="More actions" onClick={() => setPage((p) => p + 1)} />
                </div>
              </div>
            </div>
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
