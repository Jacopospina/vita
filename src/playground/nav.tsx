import { manifest, sectionTitles, type Section } from "./manifest"
import { getDoc } from "./docs"
import { demos } from "./demos"
import { Text } from "@/registry/ui/text"

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
  return hero ? hero.render() : undefined
}

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
