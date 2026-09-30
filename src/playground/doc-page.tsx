import * as React from "react"
import { CheckmarkOutline, Misuse } from "@/registry/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs"
import { Tag } from "@/registry/ui/tag"
import { Text } from "@/registry/ui/text"
import { Stack, Inline, Container, Grid, Column } from "@/registry/ui/layout"
import { Tile } from "@/registry/ui/tile"
import { Icon } from "@/registry/ui/icon"
import { CodeSnippet } from "@/registry/ui/code-snippet"
import { Breadcrumb } from "@/registry/ui/breadcrumb"
import { InlineNotification } from "@/registry/ui/notification"
import { UnorderedList, ListItem } from "@/registry/ui/list"
import { Link } from "@/registry/ui/link"
import { getDoc } from "./docs"
import { Markdown } from "./markdown"
import { manifest, sectionTitles, type Section } from "./manifest"
import { demos } from "./demos"
import type { Demo } from "./demos/types"
import { sourcesFor, tokensIn } from "./sources"
import { TokensTable } from "./tokens-table"

const REPO = "github:jacopoenergy/corpus-design-system"

function Stage({ demo, hero }: { demo: Demo; hero?: boolean }) {
  return (
    <div className={hero ? "rounded-xl bg-layer-1 p-6 md:p-12" : "rounded-lg border border-border-subtle bg-background p-6 md:p-8"}>
      <DemoBoundary>{demo.render()}</DemoBoundary>
    </div>
  )
}

export function DocPage({ section, slug }: { section: Section; slug: string }) {
  const doc = getDoc(section, slug)
  const entry = manifest[section].find((e) => e.slug === slug)
  const pageDemos = demos[`${section}/${slug}`] ?? []
  const sources = sourcesFor(section, slug)
  const tokens = React.useMemo(() => tokensIn(sources.map((s) => s.code).join("\n")), [sources])
  const title = doc?.meta.title ?? entry?.title ?? slug
  const statusTone = doc?.meta.status === "stable" ? "success" : doc?.meta.status === "experimental" ? "warning" : "neutral"
  const [hero, ...rest] = pageDemos
  const hasUsage = !!(doc?.meta.use_when?.length || doc?.meta.avoid_when?.length)
  const isArticle = sources.length === 0 && !hasUsage
  const related = (doc?.meta.related ?? []).map((r) => {
    for (const s of Object.keys(manifest) as Section[]) {
      const e = manifest[s].find((x) => x.slug === r || x.slug === r.replace(/-(component|pattern)$/, ""))
      if (e) return { href: `#/${s}/${e.slug}`, title: e.title }
    }
    return null
  }).filter(Boolean) as { href: string; title: string }[]

  return (
    <Container className="py-8 md:py-12">
      <Stack gap="xl">
        {/* Header */}
        <Stack gap="sm">
          <Breadcrumb items={[{ label: "Corpus", href: "#/foundations/about" }, { label: sectionTitles[section], href: `#/${section}/${manifest[section][0].slug}` }, { label: title }]} />
          <Inline gap="sm" align="center" wrap>
            <Text variant="large-title">{title}</Text>
            {doc?.meta.status && <Tag tone={statusTone}>{doc.meta.status}</Tag>}
          </Inline>
          {doc?.meta.summary && <Text variant="body-lg" tone="muted" className="max-w-prose">{doc.meta.summary}</Text>}
        </Stack>

        {!doc && <InlineNotification kind="warning" title="No documentation yet" subtitle={`Add docs/${section}/${slug}.md`} />}

        {/* Articles show the thing first; tabbed pages show it at the top of Overview. */}
        {hero && isArticle && <Stage demo={hero} hero />}

        {isArticle ? (
          doc && <Markdown source={doc.body} />
        ) : (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              {tokens.length > 0 && <TabsTrigger value="tokens">Tokens</TabsTrigger>}
              {(sources.length > 0 || doc?.meta.import) && <TabsTrigger value="code">Code</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview">
              <Stack gap="2xl">
                {hero && (
                  <Stack gap="sm">
                    <Stage demo={hero} hero />
                    {hero.description && <Text variant="footnote" tone="muted" className="max-w-prose">{hero.description}</Text>}
                  </Stack>
                )}
                {hasUsage && (
                  <Grid gutter="narrow" rowGap="md">
                    <Column sm={4} md={4} lg={8}>
                      <Tile className="h-full gap-3">
                        <Inline gap="xs"><Icon as={CheckmarkOutline} size="md" className="text-success" /><Text variant="headline">Use when</Text></Inline>
                        <UnorderedList>{doc?.meta.use_when?.map((u) => <ListItem key={u}>{u}</ListItem>)}</UnorderedList>
                      </Tile>
                    </Column>
                    <Column sm={4} md={4} lg={8}>
                      <Tile className="h-full gap-3">
                        <Inline gap="xs"><Icon as={Misuse} size="md" className="text-error" /><Text variant="headline">Don't use when</Text></Inline>
                        <UnorderedList>{doc?.meta.avoid_when?.map((u) => <ListItem key={u}>{u}</ListItem>)}</UnorderedList>
                      </Tile>
                    </Column>
                  </Grid>
                )}
                {rest.map((d) => (
                  <Stack key={d.title} gap="sm">
                    <Stack gap="3xs">
                      <Text variant="title-3">{d.title}</Text>
                      {d.description && <Text tone="muted" className="max-w-prose">{d.description}</Text>}
                    </Stack>
                    <Stage demo={d} />
                  </Stack>
                ))}
                {related.length > 0 && (
                  <Stack gap="xs">
                    <Text variant="headline">Related</Text>
                    <Inline gap="md" wrap>{related.map((r) => <Link key={r.href} href={r.href}>{r.title}</Link>)}</Inline>
                  </Stack>
                )}
              </Stack>
            </TabsContent>

            <TabsContent value="guidelines">{doc ? <Markdown source={doc.body} /> : null}</TabsContent>

            {tokens.length > 0 && (
              <TabsContent value="tokens">
                <TokensTable tokens={tokens} />
              </TabsContent>
            )}

            <TabsContent value="code">
              <Stack gap="lg" className="max-w-4xl">
                {doc?.meta.import && (
                  <Stack gap="xs">
                    <Text variant="headline">Import</Text>
                    <CodeSnippet type="multi">{doc.meta.import}</CodeSnippet>
                  </Stack>
                )}
                {section !== "foundations" && sources.some((s) => s.path.endsWith(".tsx")) && (
                  <Stack gap="xs">
                    <Text variant="headline">Add to a project</Text>
                    <CodeSnippet>{`npx ${REPO} add ${sources.filter((s) => s.path.endsWith(".tsx")).map((s) => s.path.split("/").pop()!.replace(".tsx", "")).join(" ")}`}</CodeSnippet>
                  </Stack>
                )}
                {sources.map((s) => (
                  <Stack key={s.path} gap="xs">
                    <Text variant="headline" className="font-mono">{s.path}</Text>
                    <CodeSnippet type="multi" maxCollapsedLines={24}>{s.code}</CodeSnippet>
                  </Stack>
                ))}
              </Stack>
            </TabsContent>
          </Tabs>
        )}
      </Stack>
    </Container>
  )
}

class DemoBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  state: { error?: Error } = {}
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) return <InlineNotification kind="error" title="Demo crashed" subtitle={this.state.error.message} />
    return this.props.children
  }
}
