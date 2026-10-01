import * as React from "react"
import * as Icons from "@/registry/icons"
import type { DemoMap } from "./types"
import { Stack, Inline, Grid, Column } from "@/registry/ui/layout"
import { Text, Heading } from "@/registry/ui/text"
import { Icon } from "@/registry/ui/icon"
import { Button } from "@/registry/ui/button"
import { Tile, TileSet, TileSetItem } from "@/registry/ui/tile"
import { Tag } from "@/registry/ui/tag"
import { TextInput } from "@/registry/ui/text-input"
import { StructuredList } from "@/registry/ui/structured-list"
import { cn } from "@/registry/lib/utils"
import palette from "@/styles/palette.json"
import { GlyphGallery } from "./galleries"

function PaletteGrid() {
  const steps = palette.steps as number[]
  const colors = Object.entries(palette.colors)
  // Belonging: all swatches are one block, flat cells, the block owns the radius (no per-row rounding).
  return (
    // No scroll container (overflow-x would also make it scroll vertically): it fits the width and hugs its height.
    <div>
      <div className="flex gap-3">
        <Stack gap="none">
          <span className="h-5" />
          {colors.map(([name, c]) => (
            <Stack key={name} gap="none" justify="center" className="h-12"><Text variant="footnote" weight="medium" className="capitalize">{name}</Text><Text variant="caption" tone="helper" className="tabular-nums">{c.base}</Text></Stack>
          ))}
        </Stack>
        <Stack gap="none" className="flex-1">
          <div className="grid h-5 grid-cols-11">
            {steps.map((st) => <Text key={st} variant="caption" tone="muted" className="text-center tabular-nums">{st}</Text>)}
          </div>
          <div className="grid grid-cols-11 overflow-hidden scope-lg">
            {colors.map(([name, c]) =>
              steps.map((st) => (
                <div
                  key={name + st}
                  title={`--vita-palette-${name}-${st}\n${(c.steps as Record<string, string>)[st]}`}
                  className="relative flex h-12 items-end justify-center pb-1"
                  style={{ ["--p" as string]: `var(--vita-palette-${name}-${st})`, background: "var(--p)" }}
                >
                  {st === 500 && <span className={cn("text-caption font-semibold", name === "yellow" || name === "mint" ? "text-foreground" : "text-primary-foreground")}>●</span>}
                </div>
              )),
            )}
          </div>
        </Stack>
      </div>
    </div>
  )
}

/* Token swatches are rendered with Tailwind token classes only (no raw values). */
const colorGroups: { title: string; tokens: { name: string; cls: string; fg?: string }[] }[] = [
  {
    title: "Surfaces",
    tokens: [
      { name: "background", cls: "bg-background" },
      { name: "layer-1", cls: "bg-layer-1" },
      { name: "layer-2", cls: "bg-layer-2" },
      { name: "layer-3", cls: "bg-layer-3" },
      { name: "raised", cls: "bg-raised shadow-raised" },
      { name: "field", cls: "bg-field" },
      { name: "inverse", cls: "bg-inverse", fg: "text-inverse-foreground" },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "foreground", cls: "bg-foreground", fg: "text-background" },
      { name: "muted-foreground", cls: "bg-muted-foreground", fg: "text-background" },
      { name: "helper", cls: "bg-helper", fg: "text-background" },
      { name: "placeholder", cls: "bg-placeholder", fg: "text-background" },
      { name: "disabled-foreground", cls: "bg-disabled-foreground" },
    ],
  },
  {
    title: "Interactive",
    tokens: [
      { name: "primary", cls: "bg-primary", fg: "text-primary-foreground" },
      { name: "primary-hover", cls: "bg-primary-hover", fg: "text-primary-foreground" },
      { name: "primary-active", cls: "bg-primary-active", fg: "text-primary-foreground" },
      { name: "primary-subtle", cls: "bg-primary-subtle", fg: "text-selected-foreground" },
      { name: "secondary", cls: "bg-secondary" },
      { name: "link", cls: "bg-link", fg: "text-primary-foreground" },
      { name: "focus", cls: "bg-focus", fg: "text-focus-inset" },
    ],
  },
  {
    title: "Support",
    tokens: [
      { name: "success", cls: "bg-success", fg: "text-primary-foreground" }, // vita-allow status-decoration: swatch documenting the token itself, approved by @jacopo
      { name: "success-subtle", cls: "bg-success-subtle", fg: "text-success-foreground" },
      { name: "warning", cls: "bg-warning", fg: "text-foreground" }, // vita-allow status-decoration: swatch documenting the token itself, approved by @jacopo
      { name: "warning-subtle", cls: "bg-warning-subtle", fg: "text-warning-foreground" },
      { name: "error", cls: "bg-error", fg: "text-primary-foreground" }, // vita-allow status-decoration: swatch documenting the token itself, approved by @jacopo
      { name: "error-subtle", cls: "bg-error-subtle", fg: "text-error-foreground" },
      { name: "info", cls: "bg-info", fg: "text-primary-foreground" }, // vita-allow status-decoration: swatch documenting the token itself, approved by @jacopo
      { name: "info-subtle", cls: "bg-info-subtle", fg: "text-info-foreground" },
    ],
  },
  {
    title: "Lines",
    tokens: [
      { name: "border-subtle", cls: "bg-border-subtle" },
      { name: "border", cls: "bg-border" },
      { name: "border-field", cls: "bg-border-field", fg: "text-background" },
      { name: "border-strong", cls: "bg-border-strong", fg: "text-background" },
    ],
  },
]

const typeRoles = [
  ["display", "Display", "Marketing hero only"],
  ["large-title", "Large title", "Top-level page title in content apps"],
  ["title-1", "Title 1", "Page title"],
  ["title-2", "Title 2", "Section heading"],
  ["title-3", "Title 3", "Subsection, modal & card titles"],
  ["headline", "Headline", "Group labels, emphasised rows"],
  ["body-lg", "Body large", "Long-form reading"],
  ["body", "Body", "Default UI text"],
  ["footnote", "Footnote", "Labels, secondary info"],
  ["caption", "Caption", "Helper text, metadata, timestamps"],
] as const

const spacing = [
  ["3xs", "0.5", 2], ["2xs", "1", 4], ["xs", "2", 8], ["sm", "3", 12], ["md", "4", 16], ["lg", "6", 24],
  ["xl", "8", 32], ["2xl", "10", 40], ["3xl", "12", 48], ["4xl", "16", 64], ["5xl", "20", 80], ["6xl", "24", 96], ["7xl", "40", 160],
] as const
const spacingW: Record<string, string> = { "0.5": "w-0.5", "1": "w-1", "2": "w-2", "3": "w-3", "4": "w-4", "6": "w-6", "8": "w-8", "10": "w-10", "12": "w-12", "16": "w-16", "20": "w-20", "24": "w-24", "40": "w-40" }

function CharacterDemo() {
  const [on, setOn] = React.useState(false)
  const lane = (label: string, sub: string, cls: string) => (
    <Stack gap="sm" className="flex-1">
      <Stack gap="none"><Text variant="headline">{label}</Text><Text variant="caption" tone="muted">{sub}</Text></Stack>
      <div className="relative h-40 overflow-hidden scope-lg bg-layer-1 p-3">
        <div className={cn("rounded-inner-3 bg-primary", cls, on ? "h-full w-full" : "h-10 w-24")} />
        <div className={cn("absolute right-3 bottom-3 size-8 rounded-full bg-primary-subtle", cls, on ? "translate-x-0 opacity-100" : "translate-x-16 opacity-0")} />
      </div>
    </Stack>
  )
  return (
    <Stack gap="md">
      <Inline><Button onClick={() => setOn((o) => !o)}>{on ? "Collapse" : "Expand"}</Button><Text tone="muted">Same change, two characters.</Text></Inline>
      <Inline gap="lg" align="start" wrap>
        {lane("Productive", "Efficient, subtle, states, menus, reveals, tables", "motion-productive")}
        {lane("Expressive", "Vibrant, visible, pages, primary actions, alerts", "motion-expressive")}
      </Inline>
    </Stack>
  )
}

function MotionDemo() {
  const [on, setOn] = React.useState(false)
  const easings = [
    ["ease-productive", "Productive standard"],
    ["ease-productive-enter", "Productive entrance"],
    ["ease-productive-exit", "Productive exit"],
    ["ease-expressive", "Expressive standard"],
    ["ease-expressive-enter", "Expressive entrance"],
    ["ease-spring", "Spring"],
  ] as const
  const durations = ["duration-fast-01", "duration-fast-02", "duration-moderate-01", "duration-moderate-02", "duration-slow-01", "duration-slow-02"] as const
  return (
    <Stack gap="lg">
      <Inline><Button onClick={() => setOn((o) => !o)}>Play motion</Button><Text tone="muted">Respects prefers-reduced-motion and the motion-scale knob.</Text></Inline>
      <Stack gap="sm">
        <Text variant="headline">Easing (duration-moderate-02)</Text>
        {easings.map(([cls, label]) => (
          <div key={cls} className="relative h-8 rounded-md bg-layer-1">
            <div className={cn("absolute top-1 left-1 size-6 rounded-sm bg-primary duration-moderate-02", cls, on && "translate-x-64")} />
            <Text variant="caption" tone="muted" className="absolute top-2 right-2">{label}</Text>
          </div>
        ))}
      </Stack>
      <Stack gap="sm">
        <Text variant="headline">Duration (ease-productive)</Text>
        {durations.map((d) => (
          <div key={d} className="relative h-8 rounded-md bg-layer-1">
            <div className={cn("absolute top-1 left-1 size-6 rounded-sm bg-primary ease-productive", d, on && "translate-x-64")} />
            <Text variant="caption" tone="muted" className="absolute top-2 right-2 font-mono">{d}</Text>
          </div>
        ))}
      </Stack>
    </Stack>
  )
}

/** The five glass tiers over a busy backdrop, so the frost and what shows through are visible. */
function MaterialDemo() {
  const tiers = [
    { n: 1, cls: "glass glass-1", label: "Side navigation" },
    { n: 2, cls: "glass glass-2", label: "Header" },
    { n: 3, cls: "glass glass-3", label: "Right panel, menus" },
    { n: 4, cls: "glass glass-4", label: "Dialogs" },
    { n: 5, cls: "glass glass-5", label: "Notifications" },
  ]
  return (
    <div className="relative h-80 overflow-hidden scope-lg bg-layer-1">
      <div aria-hidden className="absolute inset-0 grid grid-cols-5 place-items-center gap-3 p-6">
        {(["bg-primary", "bg-inverse", "bg-primary", "bg-inverse", "bg-primary"] as const).map((bg, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className={cn("size-20 rounded-full", bg)} />
            <Text variant="title-2">{["Give", "your", "ideas", "a", "body."][i]}</Text>
            <span className={cn("size-12 rounded-full", i % 2 ? "bg-primary" : "bg-inverse")} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid grid-cols-5 gap-3 p-6">
        {tiers.map((t) => (
          <div key={t.n} className={cn(t.cls, "flex flex-col justify-end scope-lg p-3")}>
            <Text weight="semibold">glass-{t.n}</Text>
            <Text variant="footnote" tone="muted">{t.label}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export const foundationDemos: DemoMap = {
  "foundations/material": [{ title: "Five tiers, more frosted the higher they float", render: () => <MaterialDemo /> }],
  "identity/brand": [
    {
      title: "Give your ideas life",
      description: "Vita is the Creator. Every word it says aims to awaken the maker in the person reading it.",
      render: () => (
        <Stack gap="xl">
          <Stack gap="xs" align="center" className="py-6 text-center">
            <Text variant="caption" tone="muted" weight="semibold">THE AI-AGENT-FIRST DESIGN SYSTEM</Text>
            <Text variant="large-title">Give your ideas life.</Text>
            <Text tone="muted">Born for humans and machines making together. Documented so agents design like designers.</Text>
          </Stack>
          <Stack gap="sm">
            <Text variant="headline">The awakening arc</Text>
            <TileSet columns={2}>
              {[
                ["1 · Spark", "What do you want to bring to life?"],
                ["2 · Shape", "Shape it freely. Vita keeps every detail consistent."],
                ["3 · Release", "It's live."],
                ["4 · Recognise", "You made that."],
              ].map(([step, line]) => (
                <TileSetItem key={step}>
                  <Stack gap="2xs"><Text variant="footnote" tone="muted" weight="medium">{step}</Text><Text variant="title-3">"{line}"</Text></Stack>
                </TileSetItem>
              ))}
            </TileSet>
          </Stack>
          <Stack gap="sm">
            <Text variant="headline">Personality</Text>
            <TileSet columns={3}>
              {[["Imaginative", "Whimsical"], ["Crafted", "Precious"], ["Visionary", "Vague"], ["Generous", "Preachy"], ["Confident", "Arrogant"], ["Expressive", "Loud"]].map(([are, not]) => (
                <TileSetItem key={are}>
                  <Stack gap="none"><Text weight="semibold">{are}</Text><Text variant="footnote" tone="muted">not {not.toLowerCase()}</Text></Stack>
                </TileSetItem>
              ))}
            </TileSet>
          </Stack>
          <Stack gap="sm">
            <Text variant="headline">Supporting slogans</Text>
            <Inline gap="sm" wrap>
              {["Make what only you can make.", "Mind, soul, life.", "Built to be built with.", "Shape what's next."].map((x) => (
                <Tile key={x} className="px-4 py-3"><Text weight="medium">{x}</Text></Tile>
              ))}
            </Inline>
          </Stack>
        </Stack>
      ),
    },
  ],
  "foundations/theming": [
    {
      title: "Live theming",
      description: "Open the palette icon in the header. Every component on every page re-renders from ~10 knobs.",
      render: () => (
        <Stack gap="md">
          <Inline wrap><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="tertiary">Tertiary</Button><Tag tone="brand">Brand</Tag><Tag tone="success">Active</Tag></Inline>
          <TextInput label="Project name" placeholder="e.g. Q3 forecast" helperText="Density, radius and type scale all come from theme.css" />
        </Stack>
      ),
    },
  ],
  "foundations/color": [
    {
      title: "Palette, every hue, every step",
      description: "13 hues × 11 steps. The dotted swatch (500) is the exact system color; hover any swatch for its variable and value. Primitives feed charts and new semantic tokens, product code uses the semantic tokens below.",
      render: () => <PaletteGrid />,
    },
    ...colorGroups.map((g) => ({
    title: g.title,
    description: "One family, one block: swatches that belong together touch.",
    render: () => (
      <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-border-subtle sm:grid-cols-4">
        {g.tokens.map((t) => (
          <div key={t.name} className={cn("flex h-24 flex-col justify-between p-3", t.cls)}>
            <Text variant="title-3" tone="inherit" className={t.fg ?? "text-foreground"}>Aa</Text>
            <Text variant="caption" tone="inherit" className={cn("font-mono", t.fg ?? "text-foreground")}>{t.name}</Text>
          </div>
        ))}
      </div>
    ),
  })),
  ],
  "foundations/typography": [
    {
      title: "Type ramp",
      description: "base × ratio^n. With base 14px and ratio 1.2 the ramp lands on 12 · 14 · 17 · 20 · 24 · 29 · 35.",
      render: () => (
        <Stack gap="md">
          {typeRoles.map(([v, name, use]) => (
            <div key={v} className="grid grid-cols-1 items-baseline gap-2 border-b border-border-subtle pb-3 md:grid-cols-4">
              <Stack gap="3xs"><Text variant="footnote" weight="medium">{name}</Text><Text variant="caption" tone="helper" className="font-mono">text-{v}</Text></Stack>
              <Text variant={v} className="md:col-span-2" truncate>The quick brown fox</Text>
              <Text variant="caption" tone="muted">{use}</Text>
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: "Weights",
      description: "Every role comes in regular, medium and semibold, set with Text's `weight`.",
      render: () => (
        <Stack gap="md">
          <div className="grid grid-cols-4 gap-2 border-b border-border-subtle pb-2">
            <Text variant="caption" tone="helper">Role</Text>
            {(["regular", "medium", "semibold"] as const).map((w) => (
              <Stack key={w} gap="none"><Text variant="footnote" weight="medium">{w[0].toUpperCase() + w.slice(1)}</Text><Text variant="caption" tone="helper" className="font-mono">weight="{w}"</Text></Stack>
            ))}
          </div>
          {typeRoles.map(([v, name]) => (
            <div key={v} className="grid grid-cols-4 items-baseline gap-2 border-b border-border-subtle pb-3">
              <Text variant="footnote" tone="muted">{name}</Text>
              {(["regular", "medium", "semibold"] as const).map((w) => (
                <Text key={w} variant={v} weight={w} truncate>Agents</Text>
              ))}
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: "Mono",
      description: "Google Sans Code, for code, IDs and numbers, every role at each weight with `font-mono`. Numbers are regular unless a weight is asked for, as here.",
      render: () => (
        <Stack gap="md">
          <div className="grid grid-cols-4 gap-2 border-b border-border-subtle pb-2">
            <Text variant="caption" tone="helper">Role</Text>
            {(["regular", "medium", "semibold"] as const).map((w) => (
              <Stack key={w} gap="none"><Text variant="footnote" weight="medium">{w[0].toUpperCase() + w.slice(1)}</Text><Text variant="caption" tone="helper" className="font-mono">font-mono · weight="{w}"</Text></Stack>
            ))}
          </div>
          {typeRoles.map(([v, name]) => (
            <div key={v} className="grid grid-cols-4 items-baseline gap-2 border-b border-border-subtle pb-3">
              <Text variant="footnote" tone="muted">{name}</Text>
              {(["regular", "medium", "semibold"] as const).map((w) => (
                <Text key={w} variant={v} weight={w} className="font-mono" truncate>12,840</Text>
              ))}
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: "Semantic headings",
      render: () => (
        <Stack gap="xs">
          <Heading level={1}>Heading level 1 · page</Heading>
          <Heading level={2}>Heading level 2 · section</Heading>
          <Heading level={3}>Heading level 3 · subsection</Heading>
          <Heading level={4}>Heading level 4 · group</Heading>
          <Text>Body copy follows headings with the default rhythm. Keep lines between 45 and 75 characters for comfortable reading.</Text>
        </Stack>
      ),
    },
  ],
  "foundations/spacing": [
    {
      title: "Spacing scale",
      description: "The 2px-based scale. Only these steps are allowed; the audit rejects every other step.",
      render: () => (
        <Stack gap="xs">
          {spacing.map(([name, tw, px]) => (
            <div key={name} className="grid grid-cols-4 items-center gap-4">
              <Text variant="footnote" className="font-mono">{name}</Text>
              <Text variant="footnote" tone="muted" className="font-mono">*-{tw}</Text>
              <Text variant="footnote" tone="muted" className="tabular-nums">{px}px</Text>
              <div className={cn("h-4 rounded-sm bg-primary", spacingW[tw])} />
            </div>
          ))}
        </Stack>
      ),
    },
    {
      title: "Radius & elevation",
      render: () => (
        <Inline gap="lg" wrap align="end">
          {(["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-full"] as const).map((r) => (
            <Stack key={r} gap="xs" align="center"><div className={cn("size-16 border border-border bg-layer-2", r)} /><Text variant="caption" className="font-mono">{r}</Text></Stack>
          ))}
          {(["shadow-raised", "shadow-floating", "shadow-overlay"] as const).map((s) => (
            <Stack key={s} gap="xs" align="center"><div className={cn("size-16 rounded-md bg-raised", s)} /><Text variant="caption" className="font-mono">{s}</Text></Stack>
          ))}
        </Inline>
      ),
    },
    {
      title: "Density-driven control sizes",
      render: () => (
        <Inline gap="sm" align="end" wrap>
          {(["h-control-xs", "h-control-sm", "h-control-md", "h-control-lg", "h-control-xl"] as const).map((h) => (
            <Stack key={h} gap="xs" align="center"><div className={cn("w-16 rounded-sm bg-primary-subtle", h)} /><Text variant="caption" className="font-mono">{h.replace("h-", "")}</Text></Stack>
          ))}
        </Inline>
      ),
    },
  ],
  "foundations/grid": [
    {
      title: "2x Grid, 16 columns",
      description: "16 columns at lg, 8 at md, 4 at sm. Resize the window.",
      render: () => (
        <Stack gap="md">
          <Grid gutter="narrow">
            {Array.from({ length: 16 }).map((_, i) => (
              <Column key={i} sm={1} md={1} lg={1}><div className="h-12 rounded-sm bg-primary-subtle" /></Column>
            ))}
          </Grid>
          <Grid gutter="narrow">
            <Column sm={4} md={8} lg={4}><Tile className="h-24">lg 4 · sidebar</Tile></Column>
            <Column sm={4} md={8} lg={12}><Tile className="h-24">lg 12 · content</Tile></Column>
          </Grid>
          <Grid gutter="condensed" className="overflow-hidden rounded-lg">
            {[1, 2, 3, 4].map((i) => <Column key={i} sm={4} md={4} lg={4}><Tile className="h-24 rounded-none">Condensed tile {i}</Tile></Column>)}
          </Grid>
        </Stack>
      ),
    },
  ],
  "foundations/motion": [
    { title: "Productive and expressive", description: "Every motion in Vita has one of two characters. Press the button to compare them on the same change.", render: () => <CharacterDemo /> },
    { title: "Easing & duration tokens", render: () => <MotionDemo /> },
  ],
  "foundations/icons": [{ title: "Every icon", description: "The full set, searchable. Click any icon to copy its import.", render: () => <GlyphGallery kind="icons" /> }],
  "foundations/pictograms": [{ title: "Every pictogram", description: "The full set, searchable. Click any pictogram to copy its import.", render: () => <GlyphGallery kind="pictograms" /> }],
  "foundations/accessibility": [
    {
      title: "Focus is always visible",
      description: "Press Tab. One focus treatment across the system: 2px focus ring.",
      render: () => (
        <Inline wrap><Button>Primary</Button><Button variant="ghost">Ghost</Button><TextInput label="Field" hideLabel placeholder="Tab into me" className="w-48" /></Inline>
      ),
    },
    {
      title: "Never color alone",
      render: () => (
        <Inline wrap gap="sm">
          <Tag tone="success" icon={Icons.CheckmarkFilled}>Healthy</Tag>
          <Tag tone="error" icon={Icons.ErrorFilled}>Degraded</Tag>
          <Tag tone="error" icon={Icons.ErrorFilled}>Down</Tag>
        </Inline>
      ),
    },
  ],
  "foundations/content": [
    {
      title: "Taxonomy in action",
      description: "Same screen, two personas. The taxonomy file decides the words; components never hard-code them.",
      render: () => (
        <StructuredList
          label="Taxonomy example"
          columns={["Concept", "Builder persona", "Business-owner persona", "Never say"]}
          rows={[
            { id: "1", cells: ["Remove an item", "Delete", "Remove", "Nuke, Kill, Erase"] },
            { id: "2", cells: ["An automated worker", "Agent", "Assistant", "Bot, Robot, AI"] },
            { id: "3", cells: ["One execution", "Run", "Task", "Job, Invocation"] },
            { id: "4", cells: ["Primary CTA to begin", "Create agent", "Set up an assistant", "Submit, OK, Go"] },
          ]}
        />
      ),
    },
  ],
}

export { Icon }
