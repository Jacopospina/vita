import * as React from "react"
import { ColorPalette, Moon, Sun, LogoGithub, Book, Grid as GridIcon, Application } from "@/registry/icons"
import { Shell, ShellBody, ShellMain, Header, HeaderGlobalAction, LeftPanel, SideNavItem, SideNavSection, RightPanel } from "@/registry/ui/ui-shell"
import { TooltipProvider } from "@/registry/ui/tooltip"
import { Toaster } from "@/registry/ui/notification"
import { Search } from "@/registry/ui/search"
import { manifest, sectionTitles, type Section } from "./manifest"
import { DocPage } from "./doc-page"
import { ThemePanel } from "./theme-panel"

const sectionIcons = { foundations: Book, components: Application, patterns: GridIcon } as const

function useRoute() {
  const read = (): [Section, string] => {
    const [, section, slug] = window.location.hash.replace(/^#/, "").split("/")
    if (section && slug && section in manifest) return [section as Section, slug]
    return ["foundations", "about"]
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
  const [dark, setDark] = React.useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false)
  const [filter, setFilter] = React.useState("")

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <TooltipProvider>
      <Shell>
        <Header
          productName="Corpus"
          href="#/foundations/about"
          actions={
            <>
              <HeaderGlobalAction icon={dark ? Sun : Moon} label={dark ? "Light theme" : "Dark theme"} onClick={() => setDark((d) => !d)} />
              <HeaderGlobalAction icon={ColorPalette} label="Theme" active={themeOpen} onClick={() => setThemeOpen((o) => !o)} />
              <HeaderGlobalAction icon={LogoGithub} label="Repository" onClick={() => window.open("https://github.com/Jacopospina/corpus", "_blank")} />
            </>
          }
        />
        <ShellBody>
          <LeftPanel label="Documentation">
            <div className="pb-1">
              <Search size="sm" label="Filter pages" placeholder="Filter" shortcut="mod+f" value={filter} onValueChange={setFilter} />
            </div>
            {(Object.keys(manifest) as Section[]).map((s) => {
              const entries = manifest[s].filter((e) => e.title.toLowerCase().includes(filter.toLowerCase()))
              if (!entries.length) return null
              return (
                <SideNavSection key={s + (filter ? "-f" : "")} title={sectionTitles[s]} collapsible defaultOpen={!!filter || s === section}>
                  {entries.map((e) => (
                    <SideNavItem key={e.slug} href={`#/${s}/${e.slug}`} icon={sectionIcons[s]} active={s === section && e.slug === slug}>
                      {e.title}
                    </SideNavItem>
                  ))}
                </SideNavSection>
              )
            })}
          </LeftPanel>
          <ShellMain data-leaving={leaving || undefined}>
            <DocPage key={`${section}/${slug}`} section={section} slug={slug} />
          </ShellMain>
          <RightPanel open={themeOpen} onOpenChange={setThemeOpen} title="Theme" size="md">
            <ThemePanel dark={dark} onDarkChange={setDark} />
          </RightPanel>
        </ShellBody>
      </Shell>
      <Toaster />
    </TooltipProvider>
  )
}
