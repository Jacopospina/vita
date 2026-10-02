import * as React from "react"
import { Book, Application, Grid as GridIcon, ColorPalette, Bot, Chat, Code, Edit, Flash, UserMultiple } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { Container, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { TileSet, TileSetItem } from "@/registry/ui/tile"
import { Tag } from "@/registry/ui/tag"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Link } from "@/registry/ui/link"
import { StructuredList } from "@/registry/ui/structured-list"
import { manifest } from "./manifest"

/*
 * The documentation home (#/) and the Guidelines index (#/guidelines).
 * Only real Vita content: every card links to an existing page and uses its own summary;
 * anything we don't have yet says "Coming soon".
 */


function SoonTag() {
  return <Tag tone="neutral" size="sm">Coming soon</Tag>
}

/** A resource cell (inside a TileSet, same-meaning items share one surface): placeholder, title, line, link or "Coming soon". */
function Resource({ icon, name, children, href, action, soon }: { icon: IconType; name: string; children: React.ReactNode; href?: string; action?: string; soon?: boolean }) {
  return (
    <TileSetItem href={href} className="p-5">
      <Stack gap="sm">
        <IconPlaceholder icon={icon} tone={href ? "brand" : "neutral"} size="lg" />
        <Text variant="title-3">{name}</Text>
        <Text tone="muted">{children}</Text>
        {href ? <Text tone="primary" weight="medium">{action}</Text> : soon ? <Inline><SoonTag /></Inline> : null}
      </Stack>
    </TileSetItem>
  )
}


function SectionHead({ name, children }: { name: string; children?: React.ReactNode }) {
  return (
    <Stack gap="2xs">
      <Text variant="title-2" as="h2">{name}</Text>
      {children && <Text tone="muted">{children}</Text>}
    </Stack>
  )
}


/** Guiding principles of the system itself (what Vita commits to), not the design principles screens follow. */
const commitments: { name: string; text: string; icon: IconType }[] = [
  { name: "Agent-first", text: "Every decision is written down and enforced, so an AI agent designs the way a designer would.", icon: Bot },
  { name: "Open by default", text: "Docs, code and rules live in one repository, as plain text that people and agents read alike.", icon: Book },
  { name: "Inclusive", text: "WCAG 2.2 AA is the floor, touch adapts by itself, and the words stay plain for everyone.", icon: UserMultiple },
  { name: "Alive", text: "Nothing snaps, the AI's work is always visible, and the system grows with every product that uses it.", icon: Flash },
  { name: "Consistent by construction", text: "One source for every screen: the same problem always gets the same pattern, word and place.", icon: Application },
  { name: "Made for makers", text: "People stay the authors. Vita hands over the craft, and every word aims to awaken the creator in the reader.", icon: Edit },
]

const layers: { name: string; text: string; parts: string; href: string; icon: IconType }[] = [
  { name: "Vita Core", text: "The foundation every screen is built on: tokens, foundations, components and patterns.", parts: `${manifest.foundations.length} foundations · ${manifest.components.length} components · ${manifest.patterns.length} patterns`, href: "#/components/choosing-components", icon: GridIcon },
  { name: "Vita for AI", text: "What AI products need: Sofia (thinking, listening, talking), AI labels and surfaces, the composer, chat and voice conversation.", parts: "Thinking · AI label · Composer · Chat · Conversation bar", href: "#/components/thinking", icon: Chat },
  { name: "Vita for agents", text: "How coding agents learn and keep the system: docs as llms.txt and a JSON index, agent skills, project rules, the audit and the CLI.", parts: "6 skills · 17 audit rules · CLI", href: "#/foundations/vita-for-ai", icon: Bot },
]

const audiences: { name: string; text: string; icon: IconType }[] = [
  { name: "Designers", text: "Start from decided foundations and patterns, and spend the craft on what only your product needs.", icon: ColorPalette },
  { name: "Engineers", text: "Install components with the CLI, use tokens instead of values, and let the audit catch drift before review.", icon: Code },
  { name: "AI agents", text: "Read the same rules as the team, pick components with the decision guide, and pass the audit before handing work back.", icon: Bot },
  { name: "Product and content", text: "Personas, taxonomy and voice rules turn product decisions into consistent words and flows.", icon: Edit },
]

const adoption = [
  { id: "new", cells: ["A new product", "Core, for AI and for agents", "Install with the CLI; let agents build with the skills from day one."] },
  { id: "ai", cells: ["Adding AI to an existing product", "Vita for AI, with Core tokens", "Bring in Sofia, AI labels and the composer; keep your own components for now."] },
  { id: "internal", cells: ["Internal tools", "Core", "Foundations and components; the audit keeps every tool consistent."] },
  { id: "agent", cells: ["Prototypes built by agents", "Vita for agents", "Give the agent the skills and rules; the audit decides when it's done."] },
]

export function GuidelinesPage() {
  return (
    <Container className="py-10">
      <Stack gap="3xl" className="stagger">
        <Stack gap="xs">
          <Text variant="large-title" as="h1">About Vita</Text>
          <Text variant="body-lg" tone="muted" className="max-w-3xl">
            Vita is the first agentic design system, made for AI products and the agents that build them. It gives every product one living experience, where the backend's logic (animus) and the AI's intelligence (anima) come alive for the people who use them.
          </Text>
          <Inline gap="sm" className="pt-1"><Link href="#/identity/about">Animus, anima, vita</Link><Link href="#/getting-started/installation">Install Vita</Link></Inline>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Our guiding principles">What Vita commits to, as a system. The principles every screen follows are in <Link inline href="#/identity/principles">Design principles</Link>.</SectionHead>
          <TileSet columns={3}>
            {commitments.map((c) => (
              <Resource key={c.name} icon={c.icon} name={c.name}>{c.text}</Resource>
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="What Vita is">One foundation, three layers. Use them together, or start with the one you need.</SectionHead>
          <TileSet columns={3}>
            {layers.map((l) => (
              <TileSetItem key={l.name} href={l.href} className="p-5">
                <Stack gap="sm">
                  <IconPlaceholder icon={l.icon} tone="brand" size="lg" />
                  <Text variant="title-3">{l.name}</Text>
                  <Text tone="muted">{l.text}</Text>
                  <Text variant="footnote" tone="muted">{l.parts}</Text>
                </Stack>
              </TileSetItem>
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Who uses Vita">One craft for everyone who makes the product, people and agents alike.</SectionHead>
          <TileSet columns={4}>
            {audiences.map((a) => (
              <Resource key={a.name} icon={a.icon} name={a.name}>{a.text}</Resource>
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Adoption">Which parts of Vita to use, by what you're making.</SectionHead>
          <StructuredList label="Adoption" columns={["You're making", "Use", "How"]} rows={adoption} />
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Get started" />
          <TileSet columns={3}>
            <Resource icon={ColorPalette} name="Designing" href="#/identity/principles" action="Read the principles">Start with the design principles, then the foundations: color, type, layout and motion.</Resource>
            <Resource icon={Code} name="Developing" href="#/getting-started/installation" action="Install Vita">Install with the CLI, add components, and run the audit in your build.</Resource>
            <Resource icon={Bot} name="Building with agents" href="#/getting-started/skills" action="Meet the skills">Give your coding agent the skills and rules, so it designs and builds like your team.</Resource>
          </TileSet>
        </Stack>

      </Stack>
    </Container>
  )
}
