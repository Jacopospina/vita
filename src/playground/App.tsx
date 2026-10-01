import * as React from "react"
import { ColorPalette, Moon, Sun } from "@/registry/icons"
import { Shell, ShellBody, ShellMain, Header, HeaderNavItem, HeaderGlobalAction, HeaderSeparator, LeftPanel, SideNavItem, SideNavSection, RightPanel } from "@/registry/ui/ui-shell"
import { TooltipProvider } from "@/registry/ui/tooltip"
import { useSunTheme } from "@/registry/hooks/use-sun-theme"
import { useWeatherTint } from "@/registry/hooks/use-weather-tint"
import { swapAppearance } from "@/registry/lib/appearance"
import { VitaMark } from "@/brand/vita-mark"
import { Toaster } from "@/registry/ui/notification"
import { Search } from "@/registry/ui/search"
import { manifest, sectionTitles, type Section } from "./manifest"
import { globalNav, navHref, searchPages, HOME_URL } from "./nav"
import { GlobalSearch } from "@/registry/ui/global-search"
import { Tag } from "@/registry/ui/tag"
import { GithubAction } from "./github"
import { DocPage } from "./doc-page"
import { ThemePanel } from "./theme-panel"
import { GuidelinesPage } from "./home"

/** Pseudo-sections for the two index pages. */
type Route = Section | "guidelines"

/** Renamed pages: old links keep working. */
const moved: Record<string, string> = {
  "components/loading": "components/thinking",
  "getting-started/interaction": "identity/principles",
  "getting-started/about": "identity/about",
  "getting-started/brand": "foundations/content",
  "identity/brand": "foundations/content",
  "getting-started/principles": "identity/principles",
}

function useRoute() {
  const read = (): [Route, string] => {
    const path = window.location.hash.replace(/^#\/?/, "")
    const [section, slug] = (moved[path] ?? path).split("/")
    if (section === "guidelines") return ["guidelines", ""]
    if (section && slug && section in manifest) return [section as Section, slug]
    return ["guidelines", ""] // unknown or empty → About Vita
  }
  const [route, setRoute] = React.useState(read)
  const [leaving, setLeaving] = React.useState(false)
  React.useEffect(() => {
    let t: number | undefined
    // Leave (major containers sink out in sequence) → swap → enter (they rise in, staggered).
    const on = () => {
      setLeaving(true)
      window.clearTimeout(t)
      t = window.setTimeout(() => {
        setRoute(read())
        setLeaving(false)
        document.getElementById("main-content")?.scrollTo({ top: 0 })
      }, 200)
    }
    window.addEventListener("hashchange", on)
    return () => {
      window.removeEventListener("hashchange", on)
      window.clearTimeout(t)
    }
  }, [])
  return [...route, leaving] as const
}

export function App() {
  const [section, slug, leaving] = useRoute()
  const [themeOpen, setThemeOpen] = React.useState(false)
  // Follows the sun where the user is; the header toggle overrides until the next sunrise/sunset.
  const [dark, setDark] = useSunTheme()
  const weather = useWeatherTint()
  const [filter, setFilter] = React.useState("")
  // One section open at a time: the current page's section; opening another closes it (filtering shows all matches).
  const here: Section = section === "guidelines" ? "identity" : section
  const [openSection, setOpenSection] = React.useState<Section | null>(here)
  const [prevHere, setPrevHere] = React.useState(here)
  if (prevHere !== here) { setPrevHere(here); setOpenSection(here) }

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
          href={HOME_URL} // the Vita homepage: the live showcase
          actions={
            <>
              <GlobalSearch items={searchPages((path) => window.location.assign(`#/${path}`))} placeholder="Search Vita" className="size-8 rounded-inner-2" />
              <HeaderSeparator />
              <HeaderGlobalAction icon={dark ? Sun : Moon} label={dark ? "Light theme" : "Dark theme"} onClick={() => setDark((d) => !d)} />
              <HeaderGlobalAction icon={ColorPalette} label="Theme" active={themeOpen} onClick={() => setThemeOpen((o) => !o)} />
              <GithubAction />
            </>
          }
        >
          {/* The five doors into the docs, the same list as the showcase header. */}
          {globalNav.map((n) => (
            <HeaderNavItem key={n.path} href={navHref(n, "#/")} active={(n.sections as readonly string[]).includes(section)}>{n.label}</HeaderNavItem>
          ))}
        </Header>
        <ShellBody>
          {(
          <LeftPanel label="Documentation">
            <div className="pb-1">
              <Search size="md" variant="toolbar" label="Filter pages" placeholder="Filter" shortcut="mod+f" value={filter} onValueChange={setFilter} />
            </div>
            {(Object.keys(manifest) as Section[]).map((s) => {
              const entries = manifest[s].filter((e) => e.title.toLowerCase().includes(filter.toLowerCase()))
              // Identity opens with About Vita, the overview of everything.
              const about = s === "identity" && "about vita".includes(filter.toLowerCase())
              if (!entries.length && !about) return null
              return (
                <SideNavSection key={s} title={sectionTitles[s]} collapsible open={!!filter || openSection === s} onOpenChange={(o) => setOpenSection(o ? s : null)}>
                  {about && <SideNavItem href="#/guidelines" active={section === "guidelines"}>About Vita</SideNavItem>}
                  {entries.map((e) => (
                    <SideNavItem key={e.slug} href={`#/${s}/${e.slug}`} active={s === section && e.slug === slug}>
                      {e.title}
                    </SideNavItem>
                  ))}
                </SideNavSection>
              )
            })}
          </LeftPanel>
          )}
          <ShellMain data-leaving={leaving || undefined}>
            {section === "guidelines" ? <GuidelinesPage /> : <DocPage key={`${section}/${slug}`} section={section} slug={slug} />}
          </ShellMain>
          <RightPanel open={themeOpen} onOpenChange={setThemeOpen} title="Theme" size="md">
            <ThemePanel dark={dark} onDarkChange={setDark} weather={weather} />
          </RightPanel>
        </ShellBody>
      </Shell>
      <Toaster />
    </TooltipProvider>
  )
}
