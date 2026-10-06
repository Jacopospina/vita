import * as React from "react"
import { marked, type Token, type Tokens } from "marked"
import { CheckmarkFilled, Misuse } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { CopyButton, InstallOptions } from "./install-options"
import { DefinitionTooltip } from "@/registry/ui/tooltip"
import { HelperText } from "@/registry/ui/helper-text"
import { Tile, TileSet, TileSetItem } from "@/registry/ui/tile"
import { Icon } from "@/registry/ui/icon"
import { Callout } from "@/registry/ui/notification"
import { CodeSnippet } from "@/registry/ui/code-snippet"
import { StructuredList } from "@/registry/ui/structured-list"
import { SetupPill } from "./setup-tag"

marked.setOptions({ gfm: true })

/**
 * Renders Vita docs as Vita components, so every page reads as cards and short alerts:
 *   ## heading                 → section
 *   list of "**Title.** body"  → grid of rule cards (numbered if ordered)
 *   list under "Don't/Never"   → red ✕ card · under "Do/Use when" → green ✓ card
 *   plain list                 → compact card
 *   > [!TIP] / [!NOTE] / [!IMPORTANT] / [!WARNING] / [!CAUTION] / plain quote → Callout
 *   table                      → StructuredList
 *   code                       → CodeSnippet (a paragraph right under it is its helper text)
 */
export function Markdown({ source }: { source: string; className?: string }) {
  const tokens = React.useMemo(() => marked.lexer(source), [source])
  const sections = React.useMemo(() => splitSections(tokens), [tokens])
  return (
    <Stack gap="2xl" className="stagger max-w-5xl">
      {sections.map((s, i) => (
        <Stack key={i} gap="md" asChild>
          <section>
            {s.heading && <Text variant="title-2" as="h2">{inline(s.heading.text)}</Text>}
            <Blocks tokens={s.tokens} context={s.heading?.text ?? ""} />
          </section>
        </Stack>
      ))}
    </Stack>
  )
}

/* ---------------- structure ---------------- */

function splitSections(tokens: Token[]) {
  const out: { heading?: Tokens.Heading; tokens: Token[] }[] = [{ tokens: [] }]
  for (const t of tokens) {
    if (t.type === "heading" && (t as Tokens.Heading).depth <= 2) out.push({ heading: t as Tokens.Heading, tokens: [] })
    else out[out.length - 1].tokens.push(t)
  }
  return out.filter((s) => s.heading || s.tokens.some((t) => t.type !== "space"))
}

function Blocks({ tokens, context }: { tokens: Token[]; context: string }) {
  // Each block's context is the nearest heading above it (drives do/don't styling).
  const contexts = tokens.reduce<string[]>((acc, t, i) => [...acc, t.type === "heading" ? (t as Tokens.Heading).text : (acc[i - 1] ?? context)], [])
  // A paragraph right under a code block is that block's helper text, set like a field's: small, muted, close.
  const solid = tokens.map((t, i) => [t, i] as const).filter(([t]) => t.type !== "space")
  const helperOf = new Map<number, Tokens.Paragraph>()
  solid.forEach(([t, i], n) => {
    const next = solid[n + 1]?.[0]
    if (t.type === "code" && next?.type === "paragraph") helperOf.set(i, next as Tokens.Paragraph)
  })
  const helpers = new Set(helperOf.values())
  return (
    <>
      {tokens.map((t, i) => {
        if (helpers.has(t as Tokens.Paragraph)) return null
        const help = helperOf.get(i)
        if (!help) return <Block key={i} token={t} context={contexts[i]} />
        return (
          <div key={i}>
            <Block token={t} context={contexts[i]} />
            <HelperText>{inline(help.text)}</HelperText>
          </div>
        )
      })}
    </>
  )
}

function Block({ token: t, context }: { token: Token; context: string }) {
  switch (t.type) {
    case "space":
    case "hr":
      return null
    case "heading": {
      const h = t as Tokens.Heading
      return <Text variant={h.depth === 3 ? "title-3" : "headline"} as={h.depth === 3 ? "h3" : "h4"} className="pt-2">{inline(h.text)}</Text>
    }
    case "paragraph":
      return <Text variant="body-lg" className="max-w-prose">{inline((t as Tokens.Paragraph).text)}</Text>
    case "html": {
      // A named block a page can embed: <!-- block: install-options -->
      const name = /<!--\s*block:\s*([\w-]+)\s*-->/.exec((t as Tokens.HTML).text)?.[1]
      return name && blocks[name] ? blocks[name]() : null
    }
    case "blockquote":
      return <Alert token={t as Tokens.Blockquote} />
    case "list":
      return <List list={t as Tokens.List} context={context} />
    case "table":
      return <Table table={t as Tokens.Table} />
    case "code": {
      const code = (t as Tokens.Code).text
      // Decision trees and diagrams are read, not copied.
      if (/[├└→]/.test(code)) return <Tile className="max-w-3xl overflow-x-auto" tabIndex={0} role="region" aria-label="Decision tree"><pre className="font-mono text-footnote leading-relaxed text-foreground">{code}</pre></Tile>
      // One line is a command: it hugs its text with Copy beside it; longer code is a block.
      return <CodeSnippet type={code.includes("\n") ? "multi" : "single"}>{code}</CodeSnippet>
    }
    default:
      return "text" in t ? <Text>{inline(String((t as { text: string }).text))}</Text> : null
  }
}

/** Live blocks a docs page can embed by name, for what markdown can't draw. */
const blocks: Record<string, () => React.ReactNode> = { "install-options": () => <InstallOptions /> }

/* ---------------- alerts ---------------- */

/* The kind shows in the colour and the icon; the alert never names its own type ("Tip", "Note"): the words lead. */
const alertKinds = {
  NOTE: { kind: "info" },
  TIP: { kind: "info" }, // a tip isn't a success: a green check means "done"
  IMPORTANT: { kind: "info" },
  WARNING: { kind: "warning" },
  CAUTION: { kind: "error" },
} as const

/**
 * An alert with a fenced block inside (```prompt) carries it as one Copy button instead of showing code: for people
 * who don't read code, the alert says what to do and the button does the copying.
 */
function Alert({ token }: { token: Tokens.Blockquote }) {
  const code = token.tokens.find((x) => x.type === "code") as Tokens.Code | undefined
  const text = code ? token.tokens.filter((x) => x.type === "paragraph").map((x) => (x as Tokens.Paragraph).text).join(" ") : token.text
  const m = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/.exec(text)
  const spec = m ? alertKinds[m[1] as keyof typeof alertKinds] : { kind: "info" as const }
  const body = m ? text.slice(m[0].length) : text
  return (
    // An alert that hands work to an agent carries Sofia at rest: purely decorative, there to catch the eye with
    // more contrast than a status glyph, without claiming a status it doesn't have.
    <Callout kind={spec.kind} decorative={code?.lang === "prompt"} className="max-w-3xl">
      <Stack gap="sm" align="start">
        <span className="text-foreground">{inline(body.replace(/\n/g, " "))}</span>
        {code && (
          <CopyButton text={code.text} label={code.lang === "prompt" ? "Copy prompt" : "Copy"} />
        )}
      </Stack>
    </Callout>
  )
}

/* ---------------- lists → cards ---------------- */

const LEAD = /^\*\*(.+?)\*\*\s*[:.\u2014-]?\s*/
/** `<!-- setup: vita/a, vita/b | hint -->` in a card: a "Setup" pill beside its title until those files exist. */
const SETUP = /\s*<!--\s*setup:\s*([^|]+?)\s*(?:\|\s*(.+?))?\s*-->/

function itemParts(item: Tokens.ListItem) {
  const first = item.tokens.find((x) => x.type === "text" || x.type === "paragraph") as Tokens.Text | undefined
  const nested = item.tokens.filter((x) => x.type === "list") as Tokens.List[]
  const raw = first?.text ?? item.text
  const s = SETUP.exec(raw)
  const text = s ? raw.replace(s[0], "") : raw
  const setup = s ? { files: s[1].split(",").map((f) => f.trim()), hint: s[2] } : undefined
  const m = LEAD.exec(text)
  const body = m ? text.slice(m[0].length).replace(/^[a-z]/, (c) => c.toUpperCase()) : text
  return { title: m ? m[1].replace(/[.:]$/, "") : undefined, body, nested, setup }
}

function List({ list, context }: { list: Tokens.List; context: string }) {
  const items = list.items.map(itemParts)
  const negative = /don'?t|never|avoid|red flag|anti/i.test(context)
  const positive = !negative && /^(do|use when|rules? of thumb|what .* gives you)/i.test(context)

  // Rule cards: most items lead with a bold title.
  if (items.filter((i) => i.title).length >= Math.max(2, Math.ceil(items.length * 0.6))) {
    return (
      <TileSet columns={items.length > 1 ? 2 : 1} tone={negative ? "negative" : "default"}>
        {items.map((it, i) => (
          <TileSetItem key={i}>
            <Inline gap="xs" align="start">
              {list.ordered && (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground tabular-nums">
                  {Number(list.start || 1) + i}
                </span>
              )}
              {negative && <Icon as={Misuse} size="md" className="text-error" />}
              <Text variant="headline" className="pt-px">{inline(it.title ?? it.body)}</Text>
              {it.setup && <SetupPill files={it.setup.files} hint={it.setup.hint} size="sm" />}
            </Inline>
            {it.title && it.body && <Text tone="muted">{inline(it.body)}</Text>}
            {it.nested.map((n, j) => <NestedList key={j} list={n} />)}
          </TileSetItem>
        ))}
      </TileSet>
    )
  }

  // Do / don't lists and plain lists: one compact card.
  return (
    <Tile className={cn("max-w-3xl gap-2", negative && "bg-error-subtle", positive && "bg-success-subtle")}>
      <ul className="flex flex-col gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-body">
            {negative ? <Icon as={Misuse} className="mt-0.5 text-error" /> : positive ? <Icon as={CheckmarkFilled} className="mt-0.5 text-success" /> : list.ordered ? <span className="w-5 shrink-0 text-muted-foreground tabular-nums">{Number(list.start || 1) + i}.</span> : <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-border-strong" />}
            <span className="flex flex-col gap-1">
              <span>{it.title ? <><strong className="font-semibold">{inline(it.title)}</strong> {inline(it.body)}</> : inline(it.body)}</span>
              {it.nested.map((n, j) => <NestedList key={j} list={n} />)}
            </span>
          </li>
        ))}
      </ul>
    </Tile>
  )
}

function NestedList({ list }: { list: Tokens.List }) {
  return (
    <ul className="flex flex-col gap-1 pl-1">
      {list.items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-body text-muted-foreground">
          <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-border-strong" />
          <span>{inline(itemParts(it).body ? (itemParts(it).title ? `**${itemParts(it).title}** ${itemParts(it).body}` : itemParts(it).body) : it.text)}</span>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- tables ---------------- */

function Table({ table }: { table: Tokens.Table }) {
  return (
    <div className="max-w-full overflow-x-auto rounded-lg bg-layer-1 px-2">
      <StructuredList
        condensed
        label={table.header.map((h) => h.text).join(", ")}
        columns={table.header.map((h, i) => <span key={i}>{inline(h.text)}</span>)}
        rows={table.rows.map((r, i) => ({ id: String(i), cells: r.map((c, j) => <span key={j}>{inline(c.text)}</span>) }))}
      />
    </div>
  )
}

/* ---------------- inline ---------------- */

/**
 * Inline markdown. `[[plain words|technical detail]]` writes for people first: the plain words show, with a dotted
 * underline, and the paths, commands and file names wait in a tooltip for the people who need them.
 */
const TECH = /\[\[([^|\]]+)\|([^\]]+)\]\]/g
function inline(md: string) {
  const html = (s: string) => <span className="vita-inline" dangerouslySetInnerHTML={{ __html: marked.parseInline(s, { async: false }) as string }} />
  if (!TECH.test(md)) return html(md)
  TECH.lastIndex = 0
  const out: React.ReactNode[] = []
  let at = 0
  for (const m of md.matchAll(TECH)) {
    if (m.index > at) out.push(<React.Fragment key={at}>{html(md.slice(at, m.index))}</React.Fragment>)
    out.push(<DefinitionTooltip key={m.index} term={m[1]} definition={html(m[2])} />)
    at = m.index + m[0].length
  }
  if (at < md.length) out.push(<React.Fragment key={at}>{html(md.slice(at))}</React.Fragment>)
  return <>{out}</>
}
