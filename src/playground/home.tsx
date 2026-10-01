import * as React from "react"
import { Book, Application, Grid as GridIcon, ColorPalette, Bot } from "@/registry/icons"
import type { IconType } from "@/registry/icons"
import { Container, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { TileSet, TileSetItem } from "@/registry/ui/tile"
import { Tag } from "@/registry/ui/tag"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { getDoc } from "./docs"
import { manifest, type Section } from "./manifest"

/*
 * The documentation home (#/) and the Guidelines index (#/guidelines).
 * Only real Corpus content: every card links to an existing page and uses its own summary;
 * anything we don't have yet says "Coming soon".
 */

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
