import * as React from "react"
import * as icons from "@/registry/icons"
import * as pictograms from "@/registry/pictograms"
import { Book, Application, Grid as GridIcon, ColorPalette, Terminal, Bot, DataVis_1 as Chart, Pen } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { Container, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { ClickableTile, Tile, TileSet, TileSetItem } from "@/registry/ui/tile"
import { Tag } from "@/registry/ui/tag"
import { Link } from "@/registry/ui/link"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Thinking } from "@/registry/ui/thinking"
import { getDoc } from "./docs"
import { manifest, type Section } from "./manifest"

/*
 * The documentation home (#/) and the Guidelines index (#/guidelines).
 * Only real Corpus content: every card links to an existing page and uses its own summary;
 * anything we don't have yet says "Coming soon".
 */

const count = (mod: Record<string, unknown>) => Object.values(mod).filter((v) => typeof v === "function" || (typeof v === "object" && v !== null && "render" in v)).length
const fmt = (n: number) => new Intl.NumberFormat().format(Math.floor(n / 100) * 100)
const summary = (section: Section, slug: string) => getDoc(section, slug)?.meta.summary ?? ""
const title = (section: Section, slug: string) => manifest[section].find((e) => e.slug === slug)?.title ?? slug

function SoonTag() {
  return <Tag tone="neutral" size="sm">Coming soon</Tag>
}

/** A resource cell (inside a TileSet — same-meaning items share one surface): placeholder, title, line, link or "Coming soon". */
function Resource({ icon, name, children, href, action }: { icon: IconType; name: string; children: React.ReactNode; href?: string; action?: string }) {
  return (
    <TileSetItem href={href} className="p-5">
      <Stack gap="sm">
        <IconPlaceholder icon={icon} tone={href ? "brand" : "neutral"} size="lg" />
        <Text variant="title-3">{name}</Text>
        <Text tone="muted">{children}</Text>
        {href ? <Text tone="primary" weight="medium">{action}</Text> : <Inline><SoonTag /></Inline>}
      </Stack>
    </TileSetItem>
  )
}

/** A page cell for the Guidelines index (inside a TileSet): the page's own title and summary. */
function PageCard({ section, slug }: { section: Section; slug: string }) {
  return (
    <TileSetItem href={`#/${section}/${slug}`} className="p-4">
      <Stack gap="xs">
        <Text variant="headline">{title(section, slug)}</Text>
        <Text tone="muted" variant="footnote">{summary(section, slug)}</Text>
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

/* ---------------- Home ---------------- */

export function HomePage() {
  const iconCount = count(icons as Record<string, unknown>)
  const pictogramCount = count(pictograms as Record<string, unknown>)
  return (
    <Container className="py-16">
      <Stack gap="3xl" className="stagger">
        {/* Hero — Sofia, the Corpus thinking orb, above the name */}
        <Stack gap="sm" align="center" className="text-center">
          <Thinking mode="generating" size="2xl" label="Sofia" />
          <Text variant="large-title" as="h1">Corpus</Text>
          <Text variant="title-2" as="p">Give your ideas a body.</Text>
          <Text variant="body-lg" tone="muted" className="max-w-xl">
            The AI-agent-first design system, born for humans and machines making together. You bring the vision; Corpus gives you and your agents the same craft to give it form.
          </Text>
        </Stack>

        {/* Featured: the guidelines */}
        <ClickableTile href="#/guidelines" className="p-8">
          <Stack gap="sm" className="max-w-2xl">
            <IconPlaceholder icon={Book} tone="brand" size="lg" />
            <Text variant="title-1" as="h2">Corpus Guidelines</Text>
            <Text variant="body-lg" tone="muted">Everything you need to give your ideas a body: the principles, foundations, components and patterns behind Corpus.</Text>
            <Text tone="primary" weight="medium">Start making</Text>
          </Stack>
        </ClickableTile>

        {/* Resources — one group: same meaning, one surface */}
        <TileSet columns={3}>
          <Resource icon={GridIcon} name="Icons" href="#/foundations/icons" action="Browse icons">
            A library of over {fmt(iconCount)} icons, drawn in and out with the rest of Corpus.
          </Resource>
          <Resource icon={Application} name="Pictograms" href="#/foundations/pictograms" action="Browse pictograms">
            Over {fmt(pictogramCount)} pictograms for empty states, onboarding and feature highlights.
          </Resource>
          <Resource icon={ColorPalette} name="Theming" href="#/foundations/theming" action="Personalise Corpus">
            {summary("foundations", "theming")}
          </Resource>
          <Resource icon={Terminal} name="Corpus CLI" href="#/getting-started/cli" action="Get started">
            Install Corpus into any repository, then add, update and audit components from the command line.
          </Resource>
          <Resource icon={Pen} name="Design kit">Components, tokens and templates for design tools.</Resource>
          <Resource icon={Bot} name="Agent skills">Six skills that teach AI agents to design and build with Corpus.</Resource>
        </TileSet>

        {/* Built with Corpus */}
        <Stack gap="lg">
          <SectionHead name="Built with Corpus" />
          <TileSet columns={2}>
            <TileSetItem href="#/patterns/intent-first" className="p-5">
              <Stack gap="sm">
                <Text variant="footnote" tone="muted">Vita</Text>
                <Text variant="title-3">From a request to a deployed agent</Text>
                <Text tone="muted">{summary("patterns", "intent-first")}</Text>
                <Text tone="primary" weight="medium">Read more</Text>
              </Stack>
            </TileSetItem>
            <TileSetItem className="p-5">
              <Stack gap="sm">
                <Text variant="title-3">Your story</Text>
                <Text tone="muted">What makers are bringing to life with Corpus.</Text>
                <Inline><SoonTag /></Inline>
              </Stack>
            </TileSetItem>
          </TileSet>
        </Stack>

        {/* Pathway */}
        <Tile className="p-8">
          <Stack gap="sm" align="center" className="text-center">
            <IconPlaceholder icon={Chart} tone="brand" size="lg" />
            <Text variant="title-2" as="h2">What will you make?</Text>
            <Text tone="muted" className="max-w-xl">Every product starts as an idea. Start with the principles, then let the decision guide hand you the right piece for every task.</Text>
            <Inline gap="lg" justify="center">
              <Link href="#/getting-started/principles">Read the principles</Link>
              <Link href="#/components/choosing-components">Choose a component</Link>
            </Inline>
          </Stack>
        </Tile>
      </Stack>
    </Container>
  )
}

/* ---------------- Guidelines index ---------------- */

const recentlyUpdated: [Section, string][] = [
  ["components", "capsule"],
  ["components", "icon-placeholder"],
  ["components", "list-item"],
  ["components", "progress-bar"],
  ["components", "notification"],
  ["patterns", "list-items"],
]

export function GuidelinesPage() {
  const topics: { name: string; text: string; href?: string; count?: number; icon: IconType }[] = [
    { name: "Getting started", text: "Install Corpus, meet the CLI, skills and registry, and the principles every screen follows.", href: "#/getting-started/installation", count: manifest["getting-started"].length + 1, icon: Book },
    { name: "Foundations", text: "The fundamentals every screen is built on: color, type, layout, motion and more.", href: "#/foundations/color", count: manifest.foundations.length, icon: ColorPalette },
    { name: "Components", text: "The building blocks, what each is for, and when to use another.", href: "#/components/choosing-components", count: manifest.components.length, icon: Application },
    { name: "Patterns", text: "Guidance for common tasks: forms, search, filtering, notifications and more.", href: "#/patterns/forms", count: manifest.patterns.length, icon: GridIcon },
    { name: "Agent skills", text: "How AI agents learn to design and build with Corpus.", href: "#/getting-started/skills", icon: Bot },
  ]
  return (
    <Container className="py-10">
      <Stack gap="3xl" className="stagger">
        <Stack gap="xs">
          <Text variant="large-title" as="h1">About Corpus</Text>
          <Text variant="body-lg" tone="muted" className="max-w-2xl">The craft behind Corpus, handed to you: principles, foundations, components and patterns for giving your ideas a body.</Text>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Design fundamentals">Explore the principles that guide every Corpus screen.</SectionHead>
          <TileSet columns={3}>
            {(["about", "principles", "interaction"] as const).map((s) => (
              <PageCard key={s} section="foundations" slug={s} />
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Foundations of design">Discover the key concepts that shape every Corpus experience.</SectionHead>
          <TileSet columns={3}>
            {(["accessibility", "color", "grid", "motion", "typography", "icons"] as const).map((s) => (
              <PageCard key={s} section="foundations" slug={s} />
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="New and updated">Recent additions and updates to the guidance.</SectionHead>
          <TileSet columns={3}>
            {recentlyUpdated.map(([section, slug]) => (
              <PageCard key={slug + section} section={section} slug={slug} />
            ))}
          </TileSet>
        </Stack>

        <Stack gap="lg">
          <SectionHead name="Topics" />
          <TileSet columns={3}>
            {topics.map((t) => (
              <Resource key={t.name} icon={t.icon} name={t.count ? `${t.name} · ${t.count}` : t.name} href={t.href} action="Learn more">{t.text}</Resource>
            ))}
          </TileSet>
        </Stack>
      </Stack>
    </Container>
  )
}
