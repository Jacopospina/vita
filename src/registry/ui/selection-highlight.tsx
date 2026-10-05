import * as React from "react"
import { createPortal } from "react-dom"

/**
 * SelectionHighlight, how selected text looks everywhere in Vita: rounded rows in the primary's tint that melt into
 * each other where lines meet, instead of the browser's square highlight. Mount it once at the app root; it draws
 * whatever is selected, wherever, from the first frame of the drag, with no transition (it is the selection). Text
 * in fields keeps the browser's highlight: its selected text has no boxes to draw.
 */

export interface Line { top: number; bottom: number; left: number; right: number }

/** Text nobody sees: a screen reader's copy (sr-only) or anything clipped away. Its boxes are not the selection. */
function hiddenText(node: Node) {
  const el = node.parentElement
  if (!el) return true
  if (el.closest(".sr-only")) return true
  const cs = getComputedStyle(el)
  return cs.visibility === "hidden" || cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)"
}

/**
 * The boxes of the visible text in a range, text node by text node (so a hidden copy, e.g. the one kept for screen
 * readers, never adds a row), each cut to the box it belongs to, so a highlight can never reach outside it.
 */
export function visibleRects(range: Range, within?: DOMRect): DOMRect[] {
  const root = range.commonAncestorContainer
  const out: DOMRect[] = []
  const take = (node: Text, start: number, end: number) => {
    if (end <= start || hiddenText(node)) return
    const part = document.createRange()
    part.setStart(node, start)
    part.setEnd(node, end)
    for (const r of Array.from(part.getClientRects())) {
      const left = within ? Math.max(r.left, within.left) : r.left
      const right = within ? Math.min(r.right, within.right) : r.right
      const top = within ? Math.max(r.top, within.top) : r.top
      const bottom = within ? Math.min(r.bottom, within.bottom) : r.bottom
      if (right - left >= 1 && bottom - top >= 1) out.push(new DOMRect(left, top, right - left, bottom - top))
    }
  }
  if (root.nodeType === Node.TEXT_NODE) {
    take(root as Text, range.startOffset, range.endOffset)
    return out
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (!range.intersectsNode(node)) continue
    const start = node === range.startContainer ? range.startOffset : 0
    const end = node === range.endContainer ? range.endOffset : node.length
    take(node, start, end)
  }
  return out
}

/**
 * The selected text, one box per line: a range reports a box per piece of text it crosses, so pieces on the same
 * line (overlapping vertically) are joined into one.
 */
export function lineRects(range: Range, within?: DOMRect): Line[] {
  const lines: Line[] = []
  for (const r of visibleRects(range, within)) {
    if (r.width < 1 || r.height < 1) continue
    const same = lines.find((l) => Math.min(l.bottom, r.bottom) - Math.max(l.top, r.top) > Math.min(l.bottom - l.top, r.height) / 2)
    if (same) {
      same.left = Math.min(same.left, r.left)
      same.right = Math.max(same.right, r.right)
      same.top = Math.min(same.top, r.top)
      same.bottom = Math.max(same.bottom, r.bottom)
    } else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right })
  }
  // Rows on consecutive lines meet halfway across the leading between them, so they touch and can blend.
  lines.sort((a, b) => a.top - b.top)
  for (let i = 0; i + 1 < lines.length; i++) {
    const a = lines[i], b = lines[i + 1]
    const gap = b.top - a.bottom
    if (gap > 0 && gap < a.bottom - a.top) {
      const mid = (a.bottom + b.top) / 2
      a.bottom = mid
      b.top = mid
    }
  }
  return lines
}


/** The drawn selection for the whole page. Mount once (the app root); it hides the browser's highlight while mounted. */
export function SelectionHighlight() {
  const [lines, setLines] = React.useState<Line[]>([])
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.add("vita-drawn-selection")
    const draw = () => {
      const s = window.getSelection()
      const range = s && !s.isCollapsed && s.rangeCount > 0 ? s.getRangeAt(0) : null
      setLines(range ? lineRects(range) : [])
    }
    document.addEventListener("selectionchange", draw)
    window.addEventListener("scroll", draw, true)
    window.addEventListener("resize", draw)
    return () => {
      root.classList.remove("vita-drawn-selection")
      document.removeEventListener("selectionchange", draw)
      window.removeEventListener("scroll", draw, true)
      window.removeEventListener("resize", draw)
    }
  }, [])
  return lines.length > 0 ? <SelectionMark lines={lines} /> : null
}

/**
 * The selection, drawn: one tint over the words, its rows melting into each other where they meet (a soft inner
 * curve instead of a step) and every outer corner rounded. The rows are blurred together and their edge sharpened
 * back (a "goo" filter), then tinted, so the text stays crisp through it.
 */
export function SelectionMark({ lines }: { lines: Line[] }) {
  const id = React.useId()
  const PAD = 10
  const x0 = Math.min(...lines.map((l) => l.left)) - PAD
  const y0 = Math.min(...lines.map((l) => l.top)) - PAD
  const x1 = Math.max(...lines.map((l) => l.right)) + PAD
  const y1 = Math.max(...lines.map((l) => l.bottom)) + PAD
  // Rendered at the document's root, so no parent's entrance animation or transform can ever move it.
  return createPortal(
    <svg
      aria-hidden="true"
      // It is the selection, so it behaves like one: no transition and no animation on anything, ever. It follows
      // the drag frame by frame.
      className="pointer-events-none fixed z-40 overflow-visible transition-none! animate-none! [&_*]:transition-none! [&_*]:animate-none!"
      style={{ left: x0, top: y0, width: x1 - x0, height: y1 - y0 }}
    >
      <defs>
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} opacity={0.22}>
        {lines.map((l, i) => (
          <rect key={i} x={l.left - x0} y={l.top - y0} width={l.right - l.left} height={l.bottom - l.top} fill="var(--vita-primary)" />
        ))}
      </g>
    </svg>,
    document.body,
  )
}
