import * as React from "react"
import { Moon, Sun, LogoGithub } from "@/registry/icons"
import { Shell, ShellMain, Header, HeaderNavItem, HeaderGlobalAction, HeaderSeparator, LeftPanel, SideNavItem } from "@/registry/ui/ui-shell"
import { globalNav, navHref, searchPages, HOME_URL, DOCS_URL, MAKE_URL } from "@/playground/nav"
import { GlobalSearch } from "@/registry/ui/global-search"
import { GithubAction } from "@/playground/github"
import { TooltipProvider } from "@/registry/ui/tooltip"
import { useSunTheme } from "@/registry/hooks/use-sun-theme"
import { useWeatherTint } from "@/registry/hooks/use-weather-tint"
import { swapAppearance } from "@/registry/lib/appearance"
import { VitaMark } from "@/brand/vita-mark"
import { Toaster } from "@/registry/ui/notification"
import { Container, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { Tag } from "@/registry/ui/tag"
import { Link } from "@/registry/ui/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/ui/tabs"
import { Tile } from "@/registry/ui/tile"
import { Thinking } from "@/registry/ui/thinking"
import { ComponentCanvas } from "./canvas"
import { CardsExample, AgentsExample, RunsExample, ConversationsExample, SettingsExample, SignInExample } from "./examples"

/*
 * The Vita showcase, two pages sharing one header:
 *   home  → hero with Sofia at its epicenter → the component canvas → footer
 *   make  → see what you can make: live examples (switch with the tabs, or hold and swing)
 * Everything on it is Vita; the example product is Theo.
 */

const DOCS = DOCS_URL
const examples = [
  { value: "cards", label: "Cards", render: () => <CardsExample /> },
  { value: "agents", label: "Agents", render: () => <AgentsExample /> },
  { value: "runs", label: "Runs", render: () => <RunsExample /> },
  { value: "conversations", label: "Conversations", render: () => <ConversationsExample /> },
  { value: "settings", label: "Settings", render: () => <SettingsExample /> },
  { value: "sign-in", label: "Sign in", render: () => <SignInExample /> },
]

export function Showcase({ page = "home" }: { page?: "home" | "make" }) {
  // Follows the sun where the visitor is; the header toggle overrides until the next sunrise/sunset.
  const [dark, setDark] = useSunTheme()
  useWeatherTint()
  React.useEffect(() => {
    swapAppearance(() => document.documentElement.classList.toggle("dark", dark))
  }, [dark])

  return (
    <TooltipProvider>
      <Shell>
        <Header
          productName="Vita"
          logo={<VitaMark size={24} className="-m-0.5" />}
          badge={<Tag size="sm" tone="warning">Experimental</Tag>}
          href={HOME_URL}
          actions={
            <>
              <GlobalSearch items={searchPages((path) => window.location.assign(`${DOCS}${path}`))} placeholder="Search Vita" className="size-8 rounded-inner-2" />
              <span className="flex items-center gap-1 max-sm:hidden"><HeaderSeparator /></span>
              <HeaderGlobalAction icon={dark ? Sun : Moon} label={dark ? "Light theme" : "Dark theme"} onClick={() => setDark((d) => !d)} />
              <span className="flex items-center gap-1 max-sm:hidden"><GithubAction /></span>
            </>
          }
        >
          {/* The same global nav as the docs. */}
          {globalNav.map((n) => <HeaderNavItem key={n.path} href={navHref(n, DOCS)} active={page === "make" && n.path === "make"}>{n.label}</HeaderNavItem>)}
        </Header>
        {/* The phone menu: the global nav (the header hides it on small screens). */}
        <LeftPanel mobileOnly label="Menu">
          {globalNav.map((n) => <SideNavItem key={n.path} href={navHref(n, DOCS)} active={page === "make" && n.path === "make"}>{n.label}</SideNavItem>)}
          <div className="mt-auto flex flex-col gap-px border-t border-divider pt-2">
            <SideNavItem href="https://github.com/Jacopospina/vita" icon={LogoGithub}>GitHub</SideNavItem>
          </div>
        </LeftPanel>
        <ShellMain>
          {page === "make" ? <MakePage /> : <HomePage />}
          <Text variant="footnote" tone="muted" className="pb-16 text-center">
            Made with Vita. Mind, soul, life. Source on <Link inline href="https://github.com/Jacopospina/vita" external>GitHub</Link>.
          </Text>
        </ShellMain>
      </Shell>
      <Toaster />
    </TooltipProvider>
  )
}

function HomePage() {
  return (
    <>
      <Container className="pt-12 pb-8">
        <Stack gap="md" align="center" className="stagger text-center">
          {/* The epicenter: Sofia, making. Everything on the page radiates from here. */}
          <Thinking mode="generating" size="3xl" label="Sofia is making" className="mb-2" />
          <Tag tone="warning">Experimental</Tag>
          <Text variant="display" as="h1" className="max-w-3xl">Give your ideas life</Text>
          <Text variant="body-lg" tone="muted" className="max-w-2xl">
            The AI-agent-first design system, born for humans and machines making together. Documented and built so your agents design like designers, and you make what only you can make.
          </Text>
          {/* Side by side on larger screens; stacked, full width on a phone (never off the edge). */}
          <Inline gap="md" justify="center" className="max-sm:w-full max-sm:flex-col max-sm:items-stretch">
            <Button size="xl" onClick={() => (window.location.href = `${DOCS}guidelines`)}>Start making</Button>
            <Button size="xl" variant="secondary" onClick={() => (window.location.href = MAKE_URL)}>See what you can make</Button>
          </Inline>
        </Stack>
      </Container>

      {/* The component canvas, full bleed, past both edges of the window */}
      <ComponentCanvas />

      <div className="pb-16" />
    </>
  )
}

/** See what you can make, the live Theo examples, on a page of their own. */
function MakePage() {
  return (
    <Container className="pt-12 pb-16">
      <Stack gap="2xl" className="stagger">
        <Stack gap="xs" align="center" className="text-center">
          <Text variant="large-title" as="h1">See what you can make</Text>
          <Text variant="body-lg" tone="muted" className="max-w-2xl">Whole screens of Theo, built only from Vita. Everything here is live: click, type, switch.</Text>
        </Stack>
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
        <Inline gap="md" justify="center">
          <Button size="xl" onClick={() => (window.location.href = `${DOCS}guidelines`)}>Start making</Button>
        </Inline>
      </Stack>
    </Container>
  )
}
