import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Add, Bot, Plug, Notification, Rocket, SettingsAdjust } from "@/registry/icons"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Tile } from "@/registry/ui/tile"
import { Button, ButtonSet, IconButton } from "@/registry/ui/button"
import { Toggle } from "@/registry/ui/toggle"
import { Checkbox } from "@/registry/ui/checkbox"
import { RadioGroup, RadioButton } from "@/registry/ui/radio-button"
import { Slider } from "@/registry/ui/slider"
import { TextInput } from "@/registry/ui/text-input"
import { NumberInput } from "@/registry/ui/number-input"
import { Dropdown } from "@/registry/ui/dropdown"
import { Search } from "@/registry/ui/search"
import { Tag } from "@/registry/ui/tag"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { ProgressBar, ProgressRing } from "@/registry/ui/progress-bar"
import { Thinking } from "@/registry/ui/thinking"
import { AISurface, AILabel } from "@/registry/ui/ai-label"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { ScrambleText } from "@/registry/ui/scramble-text"
import { Toggletip } from "@/registry/ui/popover"
import { DefinitionTooltip } from "@/registry/ui/tooltip"
import { LiveWaveform } from "@/registry/ui/live-waveform"
import { InlineNotification } from "@/registry/ui/notification"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { ListGroup, ListItem } from "@/registry/ui/list-item"
import { MiniRange } from "@/registry/ui/mini-chart"
import { AnimatedNumber } from "@/registry/ui/animated"
import { Kbd } from "@/registry/ui/kbd"
import { Avatar } from "@/registry/ui/avatar"
import { Pictogram } from "@/registry/ui/pictogram"
import { Rocket as RocketPict } from "@/registry/pictograms"

/*
 * The component canvas: a wide field of live Vita cards that runs past both edges of the window and dissolves at
 * every edge, drifting slowly sideways, "there's far more where this came from". Clipped, never scrollable.
 * Every card is a real, working component: hover or focus one and the drift holds still so you can use it.
 */

function Card({ children, order, className }: { children: React.ReactNode; order: number; className?: string }) {
  // Plain card surface: card colour, no shadow. It rises in at its place in the scattered order (rise-in).
  return <Tile className={cn("rise-in w-72 shrink-0 p-4", className)} style={{ "--vita-i": order } as React.CSSProperties}>{children}</Tile>
}

/** Two cards on one row of a column: a card that fills the row, and a perfect square beside it (as tall as the row). */
type Pair = { pair: [React.ReactNode, React.ReactNode]; hug?: boolean }
const isPair = (c: React.ReactNode | Pair | Hug): c is Pair => typeof c === "object" && c !== null && "pair" in c
/** A card as wide as its content (a button set), not the column's width. */
type Hug = { hug: React.ReactNode }
const isHug = (c: React.ReactNode | Pair | Hug): c is Hug => typeof c === "object" && c !== null && "hug" in c && !("pair" in c)

function LiveMetric() {
  const [n, setN] = React.useState(12840)
  React.useEffect(() => {
    const t = window.setInterval(() => setN((x) => x + 1 + Math.round(Math.random() * 6)), 2200)
    return () => window.clearInterval(t)
  }, [])
  return (
    <Stack gap="2xs">
      <Text variant="footnote" tone="muted">Runs today</Text>
      <Text variant="large-title"><AnimatedNumber value={n} /></Text>
      <Text variant="footnote" tone="muted">+12% from yesterday</Text>
    </Stack>
  )
}

/** The cards' entrance order: scattered across the field (one left, one right, one in the middle…), fixed so every
    visit plays the same way. Starts after the hero (its five items), continuing the count. */
const HERO_ITEMS = 5
function scatter(cols: number[]): Map<string, number> {
  // Three regions across the field; the order visits left, right, middle, again and again, picking a random card in
  // each (seeded, so it's the same every visit), so the eye is pulled across the whole canvas, never down a column.
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const third = cols.length / 3
  const region = (c: number) => (c < third ? 0 : c >= cols.length - third ? 2 : 1)
  const pools: string[][] = [[], [], []]
  cols.forEach((n, c) => { for (let r = 0; r < n; r++) pools[region(c)].push(`${c}:${r}`) })
  const out = new Map<string, number>()
  let k = HERO_ITEMS
  for (let step = 0; pools.some((p) => p.length); step++) {
    const pool = pools[[0, 2, 1][step % 3]] // left, right, middle
    if (!pool.length) continue
    out.set(pool.splice(Math.floor(rnd() * pool.length), 1)[0], k++)
  }
  return out
}

/** Scramble text, live: the agent's ID re-resolves every few seconds (loading → the real text, letter by letter). */
function LiveId() {
  const ids = ["AGT-1042", "AGT-2318", "AGT-0877"]
  const [k, setK] = React.useState(0)
  const [ready, setReady] = React.useState(true)
  React.useEffect(() => {
    const t = window.setInterval(() => {
      setReady(false)
      window.setTimeout(() => { setK((x) => (x + 1) % ids.length); setReady(true) }, 1400)
    }, 5200)
    return () => window.clearInterval(t)
  }, [ids.length])
  return (
    <Stack gap="2xs">
      <Text variant="footnote" tone="muted">Agent ID</Text>
      <ScrambleText text={ready ? ids[k] : undefined} length={8} charset="mixed" className="text-title-3" />
    </Stack>
  )
}

const columns: { offset: string; cards: (React.ReactNode | Pair | Hug)[] }[] = [
  {
    offset: "pt-16",
    cards: [
      { hug: <ButtonSet key="b"><Button variant="secondary">Draft</Button><Button icon={Rocket}>Deploy</Button></ButtonSet> },
      <Stack key="s" gap="sm"><StatusIndicator kind="success">Live</StatusIndicator><StatusIndicator kind="in-progress">Deploying</StatusIndicator><StatusIndicator kind="pending">Awaiting approval</StatusIndicator></Stack>,
      <Slider key="sl" label="Confidence threshold" defaultValue={[72]} formatValue={(v) => `${v}%`} showBounds={false} />,
    ],
  },
  {
    offset: "pt-4",
    cards: [
      <Stack key="t" gap="sm" align="center"><Thinking mode="generating" size="xl" label="Sofia" /><Text variant="footnote" tone="muted">Sofia is drafting your agent</Text></Stack>,
      <TextInput key="ti" label="Agent name" defaultValue="Support triage" helperText={<>Customers see it as the <DefinitionTooltip term="sender" definition="The name on every reply the agent sends, in email and chat." /></>} />,
      // One row: three labelled tags, and an icon-only tag on the right (named for assistive tech).
      <Inline key="tg" gap="xs" justify="between"><Inline gap="xs"><Tag tone="success">Live</Tag><Tag>Zendesk</Tag><Tag tone="warning">Rate limited</Tag></Inline><Tag icon={Bot} tone="brand" role="img" aria-label="Agent" className="px-1" /></Inline>,
    ],
  },
  {
    offset: "pt-24",
    cards: [
      { pair: [<LiveMetric key="m" />, <MiniRange key="mr" label="Hands off to a person below 70 percent confidence, between 50 and 95" icon={SettingsAdjust} value={(70 - 50) / 45} min="50" max="95" display="70" />] },
      { pair: [<ContentSwitcher key="cs" label="Range" items={[{ value: "d", label: "Day" }, { value: "w", label: "Week" }, { value: "m", label: "Month" }]} />, <Avatar key="av" name="Indie Novak" />] },
      <Stack key="c" gap="sm"><Checkbox label="Notify the owner" defaultChecked /><Checkbox label="Log every run" defaultChecked /><Checkbox label="Allow hand-offs" /></Stack>,
    ],
  },
  {
    offset: "pt-10",
    cards: [
      <AISurface key="ai"><Stack gap="xs"><Inline gap="xs"><AILabel size="xs">Drafted from the help center.</AILabel><Text weight="semibold">Suggested reply</Text></Inline><Text variant="footnote" tone="muted">Your refund was approved today and reaches your card in 3–5 days.</Text></Stack></AISurface>,
      { pair: [<LiveId key="id" />, <Toggletip key="tt" label="About agent IDs">Every agent keeps its ID for life, even when you rename it.</Toggletip>] },
      <ProgressBar key="p" label="Indexing help center" value={64} helperText="64% · about a minute left" tone="spectrum" />,
    ],
  },
  {
    offset: "pt-20",
    cards: [
      <ListGroup key="lg"><ListItem icon={Notification} tone="brand" title="Hand-offs" trailing={<Toggle size="sm" hideLabel label="Hand-offs" defaultChecked />} /><ListItem icon={Bot} tone="brand" title="Deployments" trailing={<Toggle size="sm" hideLabel label="Deployments" />} /></ListGroup>,
      { pair: [<Inline key="ring" gap="md"><ProgressRing value={100} size={44} label="Voice agent connection" /><Stack gap="none"><Text weight="semibold">Voice agent</Text><Text variant="footnote" tone="muted">Connected</Text></Stack></Inline>, <div key="wave" className="w-full px-2"><LiveWaveform active size="sm" label="Voice agent speaking" /></div>] },
      <Search key="se" placeholder="Search agents" />,
    ],
  },
  {
    offset: "pt-6",
    cards: [
      <InlineNotification key="n" kind="success" title="Agent deployed" subtitle="Support triage is live." />,
      <NumberInput key="ni" label="Max runs per hour" defaultValue={120} min={0} step={10} helperText="Per agent, across every channel" />,
      <RadioGroup key="r" legend="Model" defaultValue="l"><RadioButton value="l" label="Theo Large" /><RadioButton value="f" label="Theo Fast" /></RadioGroup>,
    ],
  },
  {
    offset: "pt-12",
    cards: [
      { hug: true, pair: [<Inline key="ip" gap="sm"><IconPlaceholder icon={Bot} tone="brand" size="lg" /><IconPlaceholder icon={Plug} tone="brand" size="lg" /><IconPlaceholder icon={Notification} tone="brand" size="lg" /></Inline>, <Pictogram key="pg" as={RocketPict} size="md" />] },
      <Dropdown key="d" label="Team" defaultValue="s" helperText="Receives this agent's hand-offs" items={[{ value: "s", label: "Support" }, { value: "f", label: "Finance" }, { value: "p", label: "People" }]} />,
      <Inline key="k" gap="sm"><IconButton icon={Add} label="Create agent" /><Text variant="footnote" tone="muted">Create anywhere</Text><Kbd keys="mod+k" /></Inline>,
    ],
  },
]

const order = scatter(columns.map((c) => c.cards.reduce<number>((n, card) => n + (isPair(card) ? 2 : 1), 0)))

export function ComponentCanvas() {
  // Off-screen, the canvas stops moving (drift and every live animation inside it pause).
  const ref = React.useRef<HTMLElement>(null)
  const [visible, setVisible] = React.useState(true)
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // Columns mostly outside the window (the canvas runs past both edges) are inert: the keyboard never lands on a
  // control you can't see. The rest are live components you can use.
  const cols = React.useRef<(HTMLDivElement | null)[]>([])
  const [shown, setShown] = React.useState<ReadonlySet<number>>(() => new Set(columns.map((_, i) => i)))
  React.useEffect(() => {
    const root = ref.current
    if (!root || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver((entries) => {
      setShown((prev) => {
        const next = new Set(prev)
        for (const e of entries) {
          const i = cols.current.indexOf(e.target as HTMLDivElement)
          if (e.intersectionRatio >= 0.6) next.add(i)
          else next.delete(i)
        }
        return next
      })
    }, { root, threshold: [0, 0.6, 1] })
    cols.current.forEach((c) => c && io.observe(c))
    return () => io.disconnect()
  }, [])
  return (
    // Clipped on both axes (never scrolls); the canvas is wider than the window and centred, so cards run off both sides.
    // Its height hugs the tallest column (the drift is sideways only); pb-12 leaves the bottom fade room to dissolve.
    // The edge fade (a mask) sits on this STATIC frame; the drifting field below is its own GPU layer, so each frame
    // is a cheap translate instead of re-masking the whole field.
    <section ref={ref} aria-label="Vita components, live" className="relative flex justify-center overflow-clip pb-12 canvas-fade">
      <div
        className={cn(
          // The drift holds still while a card is hovered or focused, so it can be used.
          "flex shrink-0 gap-4 will-change-transform contain-layout contain-paint motion-safe:animate-drift hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
          !visible && "[&,&_*]:[animation-play-state:paused]",
        )}
      >
        {columns.map((col, i) => (
          <div
            key={i}
            ref={(el) => { cols.current[i] = el }}
            inert={!shown.has(i) || undefined}
            className={`flex shrink-0 flex-col gap-4 ${col.offset}`}
          >
            {(() => {
              // Cells count pairs as two, so each card (and each square) has its own place in the scattered order.
              let cell = 0
              return col.cards.map((c, j) => {
                if (isHug(c)) return <Card key={j} order={order.get(`${i}:${cell++}`) ?? 0} className="w-fit self-end">{c.hug}</Card>
                if (!isPair(c)) return <Card key={j} order={order.get(`${i}:${cell++}`) ?? 0}>{c}</Card>
                const [a, b] = [order.get(`${i}:${cell++}`) ?? 0, order.get(`${i}:${cell++}`) ?? 0]
                return (
                  <div key={j} className={cn("flex gap-4", c.hug ? "w-fit" : "w-72")}>
                    <Card order={a} className={cn("w-auto min-w-0 justify-center", !c.hug && "flex-1")}>{c.pair[0]}</Card>
                    <Card order={b} className="aspect-square w-auto items-center justify-center p-0">{c.pair[1]}</Card>
                  </div>
                )
              })
            })()}
          </div>
        ))}
      </div>
    </section>
  )
}
