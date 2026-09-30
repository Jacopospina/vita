import * as React from "react"
import { ColorPalette, Moon, Sun, LogoGithub, Book, Grid as GridIcon, Application } from "@/registry/icons"
import { Shell, ShellBody, ShellMain, Header, HeaderGlobalAction, LeftPanel, SideNavItem, SideNavMenu, RightPanel } from "@/registry/ui/ui-shell"
import { TooltipProvider } from "@/registry/ui/tooltip"
import { Toaster } from "@/registry/ui/notification"
import { Search } from "@/registry/ui/search"
import { manifest, sectionTitles, type Section } from "./manifest"
import { DocPage } from "./doc-page"
import { ThemePanel } from "./theme-panel"

const sectionIcons = { foundations: Book, components: Application, patterns: GridIcon } as const

function useRoute(): [Section, string] {
  const read = (): [Section, string] => {
    const [, section, slug] = window.location.hash.replace(/^#/, "").split("/")
    if (section && slug && section in manifest) return [section as Section, slug]
    return ["foundations", "about"]
  }
  const [route, setRoute] = React.useState(read)
  React.useEffect(() => {
    const on = () => {
      setRoute(read())
      document.getElementById("main-content")?.scrollTo({ top: 0 })
    }
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}

export function App() {
  const [section, slug] = useRoute()
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
              <HeaderGlobalAction icon={LogoGithub} label="Repository" onClick={() => window.open("https://github.com/jacopoenergy/corpus-design-system", "_blank")} />
            </>
          }
        />
        <ShellBody>
          <LeftPanel label="Documentation">
            <div className="px-2 pt-1 pb-2">
              <Search size="sm" label="Filter pages" placeholder="Filter" value={filter} onValueChange={setFilter} />
            </div>
            {(Object.keys(manifest) as Section[]).map((s) => {
              const entries = manifest[s].filter((e) => e.title.toLowerCase().includes(filter.toLowerCase()))
              if (!entries.length) return null
              return (
                <SideNavMenu key={s + (filter ? "-f" : "")} title={sectionTitles[s]} icon={sectionIcons[s]} defaultOpen={!!filter || s === section}>
                  {entries.map((e) => (
                    <SideNavItem key={e.slug} href={`#/${s}/${e.slug}`} active={s === section && e.slug === slug}>
                      {e.title}
                    </SideNavItem>
                  ))}
                </SideNavMenu>
              )
            })}
          </LeftPanel>
          <ShellMain>
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
