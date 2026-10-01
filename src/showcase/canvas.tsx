import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Add, Bot, Plug, Notification, Rocket, Search as SearchIcon } from "@/registry/icons"
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
import { Tabs, TabsList, TabsTrigger } from "@/registry/ui/tabs"
import { InlineNotification } from "@/registry/ui/notification"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { ListGroup, ListItem } from "@/registry/ui/list-item"
import { AnimatedNumber } from "@/registry/ui/animated"
import { Kbd } from "@/registry/ui/kbd"

/*
 * The component canvas: a wide field of live Corpus cards that runs past both edges of the window and dissolves at
 * every edge, drifting slowly sideways — "there's far more where this came from". Clipped, never scrollable.
 * Every card is a real, working component.
 */

function Card({ children }: { children: React.ReactNode }) {
  // Plain card surface: card colour, no shadow.
  return <Tile className="w-72 shrink-0 p-4">{children}</Tile>
}

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

const columns: { offset: string; cards: React.ReactNode[] }[] = [
  {
    offset: "pt-16",
    cards: [
      <ButtonSet key="b"><Button variant="secondary">Draft</Button><Button icon={Rocket}>Deploy</Button></ButtonSet>,
      <Stack key="s" gap="sm"><StatusIndicator kind="success">Live</StatusIndicator><StatusIndicator kind="in-progress">Deploying</StatusIndicator><StatusIndicator kind="pending">Awaiting approval</StatusIndicator></Stack>,
      <Slider key="sl" label="Confidence threshold" defaultValue={[72]} formatValue={(v) => `${v}%`} showBounds={false} />,
    ],
  },
  {
    offset: "pt-4",
    cards: [
      <Stack key="t" gap="sm" align="center"><Thinking mode="generating" size="xl" label="Sofia" /><Text variant="footnote" tone="muted">Sofia is drafting your agent</Text></Stack>,
      <TextInput key="ti" label="Agent name" defaultValue="Support triage" />,
      <Inline key="tg" gap="xs" wrap><Tag tone="success">Live</Tag><Tag>Zendesk</Tag><Tag tone="warning">Rate limited</Tag><Tag>Vita Large</Tag></Inline>,
    ],
  },
  {
    offset: "pt-24",
    cards: [
      <LiveMetric key="m" />,
      <ContentSwitcher key="cs" label="Range" items={[{ value: "d", label: "Day" }, { value: "w", label: "Week" }, { value: "m", label: "Month" }]} />,
      <Stack key="c" gap="sm"><Checkbox label="Notify the owner" defaultChecked /><Checkbox label="Log every run" defaultChecked /><Checkbox label="Allow hand-offs" /></Stack>,
    ],
  },
  {
    offset: "pt-10",
    cards: [
      <AISurface key="ai"><Stack gap="xs"><Inline justify="between"><Text weight="semibold">Suggested reply</Text><AILabel size="xs">Drafted from the help center.</AILabel></Inline><Text variant="footnote" tone="muted">Your refund was approved today and reaches your card in 3–5 days.</Text></Stack></AISurface>,
      <Tabs key="tb" defaultValue="o"><TabsList><TabsTrigger value="o">Overview</TabsTrigger><TabsTrigger value="r">Runs</TabsTrigger><TabsTrigger value="s">Settings</TabsTrigger></TabsList></Tabs>,
      <ProgressBar key="p" label="Indexing help center" value={64} helperText="64% · about a minute left" tone="spectrum" />,
    ],
  },
  {
    offset: "pt-20",
    cards: [
      <ListGroup key="lg"><ListItem icon={Notification} tone="brand" title="Hand-offs" trailing={<Toggle size="sm" hideLabel label="Hand-offs" defaultChecked />} /><ListItem icon={Bot} tone="brand" title="Deployments" trailing={<Toggle size="sm" hideLabel label="Deployments" />} /></ListGroup>,
      <Inline key="ring" gap="md"><ProgressRing value={100} size={44} /><Stack gap="none"><Text weight="semibold">Voice agent</Text><Text variant="footnote" tone="muted">Connected</Text></Stack></Inline>,
      <Search key="se" placeholder="Search agents" />,
    ],
  },
  {
    offset: "pt-6",
    cards: [
      <InlineNotification key="n" kind="success" title="Agent deployed" subtitle="Support triage is live." />,
      <NumberInput key="ni" label="Max runs per hour" defaultValue={120} min={0} step={10} />,
      <RadioGroup key="r" legend="Model" defaultValue="l"><RadioButton value="l" label="Vita Large" /><RadioButton value="f" label="Vita Fast" /></RadioGroup>,
    ],
  },
  {
    offset: "pt-12",
    cards: [
      <Inline key="ip" gap="sm" wrap><IconPlaceholder icon={Bot} tone="brand" size="lg" /><IconPlaceholder icon={Plug} tone="brand" size="lg" /><IconPlaceholder icon={Notification} tone="brand" size="lg" /><IconPlaceholder icon={SearchIcon} tone="brand" size="lg" /></Inline>,
      <Dropdown key="d" label="Team" defaultValue="s" items={[{ value: "s", label: "Support" }, { value: "f", label: "Finance" }, { value: "p", label: "People" }]} />,
      <Inline key="k" gap="sm"><IconButton icon={Add} label="Create agent" shortcut="mod+k" /><Text variant="footnote" tone="muted">Create anywhere</Text><Kbd keys="mod+k" /></Inline>,
    ],
  },
]

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
  return (
    // Clipped on both axes (never scrolls); the canvas is wider than the window and centred, so cards run off both sides.
    // The edge fade (a mask) sits on this STATIC frame; the drifting field below is its own GPU layer, so each frame
    // is a cheap translate instead of re-masking the whole field.
    <section ref={ref} aria-label="Corpus components" className="relative flex h-160 justify-center overflow-clip canvas-fade">
      <div
        aria-hidden
        inert
        className={cn("flex shrink-0 gap-4 will-change-transform contain-layout contain-paint motion-safe:animate-drift", !visible && "[&,&_*]:[animation-play-state:paused]")}
      >
        {columns.map((col, i) => (
          <div key={i} className={`flex shrink-0 flex-col gap-4 ${col.offset}`}>
            {col.cards.map((c, j) => <Card key={j}>{c}</Card>)}
          </div>
        ))}
      </div>
    </section>
  )
}
