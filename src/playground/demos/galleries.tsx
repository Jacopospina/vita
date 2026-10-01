import * as React from "react"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Search } from "@/registry/ui/search"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { Icon } from "@/registry/ui/icon"
import { Pictogram } from "@/registry/ui/pictogram"
import { Loading } from "@/registry/ui/loading"
import { AnimatedNumber } from "@/registry/ui/animated"
import { EmptyState } from "@/registry/ui/empty-state"
import { Button } from "@/registry/ui/button"
import { toast } from "@/registry/ui/notification"
import type { IconType } from "@/registry/icons"
import { allIcons, allPictograms, type Glyph } from "@/registry/catalog"

const PAGE = 240

/** Every glyph in the system, by name, fetched only here, in its own chunk (registry/catalog). */
function useGlyphs(kind: "icons" | "pictograms") {
  const [glyphs, setGlyphs] = React.useState<[string, Glyph][] | null>(null)
  React.useEffect(() => {
    let alive = true
    ;(kind === "icons" ? allIcons() : allPictograms()).then((list) => {
      if (alive) setGlyphs(list)
    })
    return () => {
      alive = false
    }
  }, [kind])
  return glyphs
}

/** Renders more results as the sentinel scrolls into view. */
function useProgressive(total: number, resetKey: string) {
  const [shown, setShown] = React.useState(PAGE)
  const [key, setKey] = React.useState(resetKey)
  if (key !== resetKey) {
    setKey(resetKey)
    setShown(PAGE)
  }
  const sentinel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((e) => e[0].isIntersecting && setShown((s) => Math.min(total, s + PAGE)), { rootMargin: "600px" })
    io.observe(el)
    return () => io.disconnect()
  }, [total])
  return [shown, sentinel] as const
}

export function GlyphGallery({ kind }: { kind: "icons" | "pictograms" }) {
  const glyphs = useGlyphs(kind)
  const [q, setQ] = React.useState("")
  const [size, setSize] = React.useState<string>(kind === "icons" ? "md" : "lg")
  const filtered = React.useMemo(() => {
    if (!glyphs) return []
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    return glyphs.filter(([name]) => terms.every((t) => name.toLowerCase().includes(t)))
  }, [glyphs, q])
  const [shown, sentinel] = useProgressive(filtered.length, q)
  const importFrom = kind === "icons" ? "@/components/vita/icons" : "@/components/vita/pictograms"

  const copy = async (name: string) => {
    const snippet = `import { ${name} } from "${importFrom}"`
    try { await navigator.clipboard.writeText(snippet) } catch { /* clipboard blocked */ }
    toast({ kind: "success", title: `${name} copied`, subtitle: snippet })
  }

  return (
    <Stack gap="md">
      <Inline gap="sm" wrap align="center">
        <div className="w-full max-w-md">
          <Search size="md" label={`Search ${kind}`} placeholder={`Search ${glyphs?.length.toLocaleString("en-GB") ?? ""} ${kind}`} value={q} onValueChange={setQ} />
        </div>
        <ContentSwitcher
          label="Size"
          size="md"
          value={size}
          onValueChange={setSize}
          items={kind === "icons"
            ? [{ value: "sm", label: "16" }, { value: "md", label: "20" }, { value: "lg", label: "24" }, { value: "xl", label: "32" }]
            : [{ value: "md", label: "48" }, { value: "lg", label: "64" }, { value: "xl", label: "80" }]}
        />
        <Text tone="muted" aria-live="polite" className="inline-flex items-baseline gap-1">
          <AnimatedNumber value={filtered.length} /> {filtered.length === 1 ? "result" : "results"}
        </Text>
      </Inline>

      {!glyphs && <Inline gap="xs"><Loading size="sm" label={`Loading ${kind}`} /><Text tone="muted">Loading {kind}…</Text></Inline>}

      {glyphs && filtered.length === 0 && (
        <EmptyState size="sm" title={`No ${kind} match “${q}”`} description="Try a shorter word, like “arrow”, “user” or “chart”." action={<Button variant="tertiary" onClick={() => setQ("")}>Clear search</Button>} />
      )}

      {filtered.length > 0 && (
        <div className={kind === "icons" ? "grid grid-cols-3 gap-0 overflow-hidden rounded-lg border border-border-subtle sm:grid-cols-6 lg:grid-cols-8" : "grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-border-subtle sm:grid-cols-4 lg:grid-cols-6"}>
          {filtered.slice(0, shown).map(([name, G]) => (
            <button
              key={name}
              type="button"
              title={`${name}, click to copy the import`}
              onClick={() => copy(name)}
              className="group flex min-w-0 animate-enter-fade flex-col items-center justify-center gap-2 border-r border-b border-border-subtle bg-background px-2 py-6 text-foreground hover:bg-hover focus-ring-inset"
            >
              {kind === "icons" ? (
                <Icon as={G as unknown as IconType} size={size as "sm" | "md" | "lg" | "xl"} className="duration-moderate-01 ease-spring group-hover:scale-110" />
              ) : (
                <Pictogram as={G} size={size as "md" | "lg" | "xl"} className="duration-moderate-01 ease-spring group-hover:scale-105" />
              )}
              <Text variant="caption" tone="muted" truncate className="max-w-full">{name}</Text>
            </button>
          ))}
        </div>
      )}
      {shown < filtered.length && <div ref={sentinel} className="flex h-16 items-center justify-center"><Loading size="sm" label="Loading more" /></div>}
    </Stack>
  )
}
