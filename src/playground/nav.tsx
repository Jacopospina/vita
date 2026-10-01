import { manifest, sectionTitles, type Section } from "./manifest"
import { getDoc } from "./docs"
import { demos } from "./demos"
import * as React from "react"
import { Text } from "@/registry/ui/text"

/** A layout wrapper around several variants (Stack, Inline, a demo grid) — never a component's own root. */
const isLayout = (el: Element) =>
  el.children.length > 1 && !el.getAttribute("role") && (el.getAttribute("data-layout") === "stack" || (el instanceof HTMLDivElement && /(^|\s)grid(\s|$)/.test(el.className)))

/** Shows ONE instance of a component: walks down the demo's layout wrappers, keeping only the first real child at each level. */
function OneInstance({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useLayoutEffect(() => {
    let el = ref.current?.firstElementChild
    while (el && isLayout(el)) {
      const kids = [...el.children] as HTMLElement[]
      // Skip captions and headings that label a group of variants — the instance is the first thing that isn't just text.
      const keep = kids.find((k) => k.children.length > 0 || /^(BUTTON|INPUT|SELECT|TEXTAREA|SVG|IMG)$/i.test(k.tagName)) ?? kids[0]
      for (const k of kids) if (k !== keep) k.style.display = "none"
      // Centre what's left: full-width components still fill, small ones sit in the middle.
      Object.assign((el as HTMLElement).style, { justifyContent: "center", alignItems: "center" })
      el = keep
    }
  })
  // A minimum width so full-width components (slider, progress bar) have room to show.
  return <div ref={ref} className="min-w-72">{children}</div>
}

/** A tangible preview for a page: colour swatches, a huge "Aa", or the page's hero demo, live. */
function pagePreview(section: Section, slug: string) {
  if (section === "foundations" && slug === "color")
    return (
      <div className="grid grid-cols-3 gap-2">
        {["bg-primary", "bg-inverse", "bg-layer-3", "bg-success-subtle", "bg-warning-subtle", "bg-error-subtle"].map((c) => <span key={c} className={`size-16 scope-md ${c}`} />)}
      </div>
    )
  if (section === "foundations" && slug === "typography") return <Text variant="display" weight="regular">Aa</Text>
  const hero = demos[`${section}/${slug}`]?.[0]
  if (!hero) return undefined
  // Components preview as ONE instance (the hero's first variant); patterns and foundations show the whole hero.
  return section === "components" ? <OneInstance>{hero.render()}</OneInstance> : hero.render()
}

/** Where the two pages live: deployed, the showcase is the site root and the docs sit at /docs; in development they're the two HTML files. */
export const HOME_URL = import.meta.env.PROD ? "/" : "./showcase.html"
export const DOCS_URL = import.meta.env.PROD ? "/docs#/" : "./index.html#/"

/** The global nav — ONE list, used by the docs header and the showcase header so they never drift apart. */
export const globalNav = [
  { label: "Start", path: "guidelines", sections: ["guidelines", "getting-started"] },
  { label: "Foundations", path: "foundations/accessibility", sections: ["foundations"] },
  { label: "Components", path: "components/choosing-components", sections: ["components"] },
  { label: "Patterns", path: "patterns/agent-conversation", sections: ["patterns"] },
  { label: "Decisions", path: "decisions/how-we-decide", sections: ["decisions"] },
] as const

/** Every page, for the header's global search (grouped by section). `base` prefixes links (the showcase lives elsewhere). */
export function searchPages(go: (path: string) => void) {
  const pages = [{ id: "guidelines", label: "About Corpus", group: "Getting started", path: "guidelines", description: "The overview of Corpus: what it is, how it's organised, and where to start." }]
  for (const s of Object.keys(manifest) as Section[])
    for (const e of manifest[s]) pages.push({ id: `${s}/${e.slug}`, label: e.title, group: sectionTitles[s], path: `${s}/${e.slug}`, description: getDoc(s, e.slug)?.meta.summary ?? "" })
  return pages.map((p) => {
    const [section, slug] = p.path.split("/") as [Section, string]
    return { id: p.id, label: p.label, group: p.group, description: p.description, preview: slug ? () => pagePreview(section, slug) : undefined, onSelect: () => go(p.path) }
  })
}
