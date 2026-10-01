import * as React from "react"
import { Moon, Sun, LogoGithub, ArrowRight, Book, Bot, Security, UserMultiple } from "@/registry/icons"
import { Shell, ShellMain, Header, HeaderNavItem, HeaderGlobalAction } from "@/registry/ui/ui-shell"
import { globalNav } from "@/playground/nav"
import { TooltipProvider } from "@/registry/ui/tooltip"
import { useSunTheme } from "@/registry/hooks/use-sun-theme"
import { useWeatherTint } from "@/registry/hooks/use-weather-tint"
import { swapAppearance } from "@/registry/lib/appearance"
import { CorpusMark } from "@/brand/corpus-mark"
import { Toaster } from "@/registry/ui/notification"
import { Container, Stack, Inline } from "@/registry/ui/layout"
import { IconPlaceholder } from "@/registry/ui/icon-placeholder"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { OperationalTag } from "@/registry/ui/tag"
import { Icon } from "@/registry/ui/icon"
import { Link } from "@/registry/ui/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/ui/tabs"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { Tile, TileSet, TileSetItem } from "@/registry/ui/tile"
import { ComponentCanvas } from "./canvas"
import { CardsExample, AgentsExample, RunsExample, ConversationsExample, SettingsExample, SignInExample } from "./examples"

/*
 * The Corpus showcase: what Corpus can build, live. One page:
 *   header → hero → live examples (switch with the tabs, or hold and swing) → themes → footer.
 * Everything on it is Corpus; the example product is Vita.
 */

const DOCS = "./index.html#/"
const examples = [
  { value: "cards", label: "Cards", render: () => <CardsExample /> },
  { value: "agents", label: "Agents", render: () => <AgentsExample /> },
  { value: "runs", label: "Runs", render: () => <RunsExample /> },
  { value: "conversations", label: "Conversations", render: () => <ConversationsExample /> },
  { value: "settings", label: "Settings", render: () => <SettingsExample /> },
  { value: "sign-in", label: "Sign in", render: () => <SignInExample /> },
]
const pillars = [
  { title: "Opinions, written down", text: "Every page says when to use a component, when not to, and what to use instead.", icon: Book },
  { title: "Fluent for machines", text: "Docs as llms.txt and a JSON index, six agent skills and project rules agents follow.", icon: Bot },
  { title: "Enforced, not suggested", text: "Thirteen audit rules fail the build on local components and raw values.", icon: Security },
  { title: "One craft for both", text: "People and agents ship with the same tokens, components, motion and words.", icon: UserMultiple },
]
const presets = [
  { value: "default", label: "Default" },
  { value: "soft", label: "Soft" },
  { value: "square", label: "Square" },
  { value: "mono", label: "Mono" },
]

export function Showcase() {
  // Follows the sun where the visitor is; the header toggle overrides until the next sunrise/sunset.
  const [dark, setDark] = useSunTheme()
  useWeatherTint()
  const [preset, setPreset] = React.useState("default")
  React.useEffect(() => {
    swapAppearance(() => document.documentElement.classList.toggle("dark", dark))
  }, [dark])
  React.useEffect(() => {
    swapAppearance(() => {
      if (preset === "default") delete document.documentElement.dataset.corpusPreset
      else document.documentElement.dataset.corpusPreset = preset
    })
  }, [preset])

  return (
    <TooltipProvider>
      <Shell>
        <Header
          productName="Corpus"
          logo={<CorpusMark size={24} className="-m-0.5" />}
          href="./showcase.html"
          actions={
            <>
              <HeaderGlobalAction icon={dark ? Sun : Moon} label={dark ? "Light theme" : "Dark theme"} onClick={() => setDark((d) => !d)} />
              <HeaderGlobalAction icon={LogoGithub} label="Repository" onClick={() => window.open("https://github.com/Jacopospina/corpus", "_blank")} />
            </>
          }
        >
          {/* The same global nav as the docs. */}
          {globalNav.map((n) => <HeaderNavItem key={n.path} href={`${DOCS}${n.path}`}>{n.label}</HeaderNavItem>)}
        </Header>
        <ShellMain>
          <Container className="pt-16 pb-8">
            <Stack gap="3xl" className="stagger">
              {/* Hero */}
              <Stack gap="md" align="center" className="text-center">
                <OperationalTag tone="brand" onClick={() => (window.location.href = `${DOCS}components/capsule`)}>
                  New: Capsule, liquid progress and hold-to-swing tabs <Icon as={ArrowRight} size="sm" />
                </OperationalTag>
                <Text variant="display" as="h1" className="max-w-3xl">Give your ideas a body</Text>
                <Text variant="body-lg" tone="muted" className="max-w-2xl">
                  The AI-agent-first design system, born for humans and machines making together. Documented and built so your agents design like designers — and you make what only you can make.
                </Text>
                <Inline gap="md" justify="center">
                  <Button size="xl" onClick={() => (window.location.href = `${DOCS}guidelines`)}>Start making</Button>
                  <Button size="xl" variant="secondary" onClick={() => document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" })}>See what you can make</Button>
                </Inline>
              </Stack>
            </Stack>
          </Container>

          {/* The component canvas — full bleed, past both edges of the window */}
          <ComponentCanvas />

          <Container className="pt-8 pb-16">
            <Stack gap="3xl" className="stagger">

              {/* Live examples */}
              <section id="examples" aria-label="Examples">
                <Tabs defaultValue="cards">
                  <Stack gap="md">
                    <Inline justify="between" wrap>
                      <TabsList>
                        {examples.map((e) => <TabsTrigger key={e.value} value={e.value}>{e.label}</TabsTrigger>)}
                      </TabsList>
                      <Text variant="footnote" tone="muted">Hold a tab and swing left or right to browse.</Text>
                    </Inline>
                    <Tile className="border border-border-subtle bg-background p-4 md:p-6">
                      {examples.map((e) => (
                        <TabsContent key={e.value} value={e.value} className="pt-0">{e.render()}</TabsContent>
                      ))}
                    </Tile>
                  </Stack>
                </Tabs>
              </section>

              {/* Positioning: why agents can design with Corpus */}
              <section aria-label="Born for humans and agents">
                <Stack gap="lg">
                  <Stack gap="xs" align="center" className="text-center">
                    <Text variant="title-1" as="h2">Designed for people. Fluent for agents.</Text>
                    <Text tone="muted" className="max-w-2xl">Agents don't need more parts; they need judgment. Corpus writes every design decision down and enforces it, so an agent makes the choices a designer would.</Text>
                  </Stack>
                  {/* One idea, four pillars: one surface, no gaps (belonging). */}
                  <TileSet columns={4}>
                    {pillars.map((p) => (
                      <TileSetItem key={p.title} className="p-5">
                        <Stack gap="sm">
                          <IconPlaceholder icon={p.icon} tone="brand" size="lg" />
                          <Text variant="title-3">{p.title}</Text>
                          <Text tone="muted">{p.text}</Text>
                        </Stack>
                      </TileSetItem>
                    ))}
                  </TileSet>
                </Stack>
              </section>

              {/* Themes */}
              <section id="themes" aria-label="Themes">
                <Stack gap="md" align="center" className="text-center">
                  <Text variant="title-1" as="h2">Make it unmistakably yours</Text>
                  <Text tone="muted" className="max-w-xl">About ten variables reshape all of Corpus: colour, radius, density and type. Try a preset, and the whole page follows your hand.</Text>
                  <ContentSwitcher label="Theme preset" items={presets} value={preset} onValueChange={setPreset} />
                  <Link href={`${DOCS}foundations/theming`}>Shape your own theme</Link>
                </Stack>
              </section>

              {/* Footer */}
              <Text variant="footnote" tone="muted" className="text-center">
                Made with Corpus. From mind to matter. Source on <Link inline href="https://github.com/Jacopospina/corpus" external>GitHub</Link>.
              </Text>
            </Stack>
          </Container>
        </ShellMain>
      </Shell>
      <Toaster />
    </TooltipProvider>
  )
}
