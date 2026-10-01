import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { Stack } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Tag } from "@/registry/ui/tag"
import type { TokenKind, TokenRef } from "./sources"

const kindLabel: Record<TokenKind, string> = {
  knob: "Theme knobs",
  color: "Color",
  type: "Typography",
  font: "Typeface",
  size: "Size & density",
  radius: "Radius",
  shadow: "Elevation",
  motion: "Motion",
  animation: "Animation",
}

/** Live preview of a token, reads the resolved value so it follows the theme panel. */
function Preview({ t }: { t: TokenRef }) {
  const v = `var(${t.cssVar})`
  switch (t.kind) {
    case "color":
      return <span className="block size-8 rounded-md border border-border-subtle" style={{ ["--p" as string]: v, background: "var(--p)" }} />
    case "type":
      return <span className="leading-none text-foreground" style={{ ["--p" as string]: v, fontSize: "var(--p)" }}>Aa</span>
    case "font":
      return <span className="text-body" style={{ ["--p" as string]: v, fontFamily: "var(--p)" }}>Aa</span>
    case "radius":
      return <span className="block size-8 border-2 border-primary bg-primary-subtle" style={{ ["--p" as string]: v, borderRadius: "var(--p)" }} />
    case "shadow":
      return <span className="block size-8 rounded-md bg-raised" style={{ ["--p" as string]: v, boxShadow: "var(--p)" }} />
    case "size":
      return <span className="block w-2 rounded-sm bg-primary" style={{ ["--p" as string]: v, height: "min(var(--p), 4rem)" }} />
    default:
      return null
  }
}

/** Resolve a token to what the browser actually renders (px, color), via an invisible probe element. */
function resolve(t: TokenRef, cs: CSSStyleDeclaration): string {
  const raw = cs.getPropertyValue(t.cssVar).trim()
  if (!["color", "type", "size", "radius"].includes(t.kind)) return raw
  const probe = document.createElement("div")
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none"
  const v = `var(${t.cssVar})`
  if (t.kind === "color") probe.style.color = v
  else probe.style.width = v
  document.body.appendChild(probe)
  const out = t.kind === "color" ? getComputedStyle(probe).color : `${Math.round(probe.getBoundingClientRect().width * 10) / 10}px`
  probe.remove()
  return out
}

export function TokensTable({ tokens }: { tokens: TokenRef[] }) {
  const [, force] = React.useReducer((x: number) => x + 1, 0)
  // Re-resolve when the theme panel or dark mode changes <html> attributes.
  React.useEffect(() => {
    const mo = new MutationObserver(() => force())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-vita-preset"] })
    return () => mo.disconnect()
  }, [])
  const cs = getComputedStyle(document.documentElement)
  const groups = tokens.reduce<Record<string, TokenRef[]>>((a, t) => ((a[t.kind] ??= []).push(t), a), {})

  if (!tokens.length) return <Text tone="muted">This page uses no tokens directly. It composes other Vita components.</Text>

  return (
    <Stack gap="xl" className="stagger">
      <Text tone="muted" className="max-w-prose">
        Extracted from the source. Values are resolved live from the current theme: change a knob in the Theme panel and watch them update. Product code uses the utility, never the raw value.
      </Text>
      {Object.entries(groups).map(([kind, list]) => (
        <Stack key={kind} gap="sm">
          <Text variant="headline">{kindLabel[kind as TokenKind]} <Tag size="sm">{list.length}</Tag></Text>
          <div className="overflow-x-auto rounded-lg border border-border-subtle">
            <div className="grid min-w-160 grid-cols-12 bg-layer-2 px-4 py-2 text-footnote font-semibold">
              <span className="col-span-1" />
              <span className="col-span-3">Utility</span>
              <span className="col-span-4">CSS variable</span>
              <span className="col-span-4">Resolved value</span>
            </div>
            {list.map((t) => (
              <div key={t.cssVar + t.utility} className="grid min-w-160 grid-cols-12 items-center border-t border-border-subtle px-4 py-2 text-body">
                <span className="col-span-1 flex items-center"><Preview t={t} /></span>
                <code className="col-span-3 font-mono text-footnote">{t.utility}</code>
                <code className="col-span-4 font-mono text-footnote text-muted-foreground">{t.cssVar}</code>
                <code className={cn("col-span-4 truncate font-mono text-caption text-helper")} title={resolve(t, cs)}>
                  {resolve(t, cs) || "None"}
                </code>
              </div>
            ))}
          </div>
        </Stack>
      ))}
    </Stack>
  )
}
