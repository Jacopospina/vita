/** Maps every docs page to the Vita source files it documents, and extracts the tokens those files use. */
const registry = import.meta.glob("/src/registry/**/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>
const styles = import.meta.glob("/src/styles/*.css", { query: "?raw", import: "default", eager: true }) as Record<string, string>

const map: Record<string, string[]> = {
  // foundations
  "foundations/theming": ["styles/theme.css", "styles/presets.css"],
  "foundations/grid": ["registry/ui/layout.tsx"],
  "foundations/spacing": ["registry/ui/layout.tsx", "styles/tokens.css"],
  "foundations/color": ["styles/tokens.css"],
  "foundations/typography": ["registry/ui/text.tsx"],
  "foundations/motion": ["styles/motion.css"],
  "foundations/icons": ["registry/ui/icon.tsx", "registry/icons.ts"],
  "foundations/pictograms": ["registry/ui/pictogram.tsx", "registry/pictograms.ts"],
  "foundations/accessibility": ["styles/vita.css"],
  // components (default: registry/ui/<slug>.tsx)
  "components/capsule": ["registry/ui/notification.tsx", "registry/ui/progress-bar.tsx"],
  "components/chat-bubble": ["registry/ui/chat.tsx"],
  "patterns/cards": ["registry/ui/tile.tsx"],
  "components/live-waveform": ["registry/ui/live-waveform.tsx", "registry/hooks/use-microphone.ts"],
  "patterns/mic-selector": ["registry/blocks/mic-selector.tsx", "registry/hooks/use-microphone.ts"],
  "components/dropdown": ["registry/ui/dropdown.tsx", "registry/ui/option.tsx"],
  "components/menu-buttons": ["registry/ui/menu-button.tsx"],
  "components/inline-loading": ["registry/ui/loading.tsx", "registry/ui/thinking.tsx"],
  "components/thinking": ["registry/ui/loading.tsx", "registry/ui/thinking.tsx"],
  "components/ui-shell-header": ["registry/ui/ui-shell.tsx"],
  "components/ui-shell-left-panel": ["registry/ui/ui-shell.tsx"],
  "components/ui-shell-right-panel": ["registry/ui/ui-shell.tsx"],
  "components/text-input": ["registry/ui/text-input.tsx", "registry/ui/form.tsx"],
  // patterns
  "patterns/common-actions": ["registry/ui/page-header.tsx", "registry/ui/menu-button.tsx"],
  "patterns/dialogs": ["registry/ui/modal.tsx"],
  "patterns/disabled-states": ["registry/ui/button.tsx"],
  "patterns/disclosures": ["registry/ui/accordion.tsx"],
  "patterns/empty-states": ["registry/ui/empty-state.tsx"],
  "patterns/filtering": ["registry/ui/search.tsx", "registry/ui/tag.tsx"],
  "patterns/fluid-styles": ["registry/ui/form.tsx"],
  "patterns/forms": ["registry/ui/form.tsx"],
  "patterns/global-header": ["registry/ui/ui-shell.tsx"],
  "patterns/loading": ["registry/ui/loading.tsx"],
  "patterns/voice-conversation": ["registry/blocks/conversation-bar.tsx", "registry/hooks/use-microphone.ts"],
  "patterns/login": ["registry/blocks/login.tsx"],
  "patterns/email-message": ["registry/blocks/email-message.tsx", "registry/ui/avatar.tsx"],
  "patterns/global-search": ["registry/blocks/global-search.tsx"],
  "patterns/notifications": ["registry/ui/notification.tsx"],
  "patterns/overflow-content": ["registry/ui/truncate.tsx"],
  "patterns/read-only-states": ["registry/ui/structured-list.tsx"],
  "patterns/search": ["registry/ui/search.tsx"],
  "patterns/status-indicators": ["registry/ui/status-indicator.tsx"],
  "patterns/text-toolbar": ["registry/ui/toolbar.tsx"],
  "patterns/agent-conversation": ["registry/ui/chat.tsx"],
  "patterns/list-items": ["registry/ui/list-item.tsx"],
  "patterns/intent-first": ["registry/ui/composer.tsx", "registry/ui/ai-label.tsx"],
}

export interface SourceFile {
  path: string
  code: string
}

export function sourcesFor(section: string, slug: string): SourceFile[] {
  const key = `${section}/${slug}`
  const paths = map[key] ?? (section === "components" ? [`registry/ui/${slug}.tsx`] : [])
  return paths
    .map((p) => ({ path: `src/${p}`, code: registry[`/src/${p}`] ?? styles[`/src/${p}`] }))
    .filter((f): f is SourceFile => typeof f.code === "string")
}

/* ---------------- tokens ---------------- */

export type TokenKind = "color" | "type" | "radius" | "shadow" | "size" | "motion" | "animation" | "font" | "knob"
export interface TokenRef {
  kind: TokenKind
  cssVar: string
  utility: string
}

const tokensCss = styles["/src/styles/tokens.css"] ?? ""
const colorNames = new Set([...tokensCss.matchAll(/--vita-([a-z0-9-]+):\s*(?:oklch|color-mix|var\(--vita-foreground)/g)].map((m) => m[1]))

function classify(prefix: string, name: string): TokenRef | null {
  if (["bg", "text", "border", "ring", "outline", "fill", "from", "to", "via", "border-l", "border-t", "border-b", "border-r", "decoration", "placeholder"].includes(prefix) && colorNames.has(name))
    return { kind: "color", cssVar: `--vita-${name}`, utility: `${prefix}-${name}` }
  if (prefix === "text" && /^(caption|footnote|body|body-lg|headline|title-[123]|large-title|display)$/.test(name))
    return { kind: "type", cssVar: `--vita-text-${name}`, utility: `text-${name}` }
  if (prefix.startsWith("rounded") && /^(sm|md|lg|xl)$/.test(name)) return { kind: "radius", cssVar: `--vita-radius-${name}`, utility: `rounded-${name}` }
  if (prefix === "shadow" && /^(raised|floating|overlay)$/.test(name)) return { kind: "shadow", cssVar: `--vita-shadow-${name}`, utility: `shadow-${name}` }
  if (/^(control-(xs|sm|md|lg|xl)|inset(-sm|-lg)?)$/.test(name)) return { kind: "size", cssVar: `--vita-${name}`, utility: `${prefix}-${name}` }
  if (prefix === "duration" && /^(fast|moderate|slow)-0[12]$/.test(name)) return { kind: "motion", cssVar: `--vita-duration-${name}`, utility: `duration-${name}` }
  if (prefix === "ease" && /^(productive|expressive|spring)/.test(name)) return { kind: "motion", cssVar: `--vita-ease-${name}`, utility: `ease-${name}` }
  if (prefix === "animate") return { kind: "animation", cssVar: `--animate-${name}`, utility: `animate-${name}` }
  if (prefix === "font" && /^(sans|mono|display)$/.test(name)) return { kind: "font", cssVar: `--vita-font-${name}`, utility: `font-${name}` }
  return null
}

export function tokensIn(code: string): TokenRef[] {
  const found = new Map<string, TokenRef>()
  const re = /(?<![\w-])(bg|text|border(?:-[ltrb])?|ring|outline|fill|from|to|via|decoration|placeholder|rounded(?:-[a-z]{1,2})?|shadow|h|w|size|min-h|min-w|max-h|px|py|pl|pr|p|duration|ease|animate|font)-([a-z0-9]+(?:-[a-z0-9]+)*)/g
  for (const m of code.matchAll(re)) {
    const t = classify(m[1], m[2])
    if (t) found.set(t.cssVar + t.kind, t)
  }
  // CSS files: direct var definitions/usages
  for (const m of code.matchAll(/var\((--vita-[a-z0-9-]+)\)|^\s*(--vita-[a-z0-9-]+):/gm)) {
    const v = m[1] ?? m[2]
    if (v.startsWith("--vita-brand") || v.startsWith("--vita-neutral") || v.startsWith("--vita-hue") || v === "--vita-radius" || v === "--vita-density" || v.startsWith("--vita-type") || v === "--vita-motion-scale" || v.startsWith("--vita-font"))
      found.set(v, { kind: v.startsWith("--vita-font") ? "font" : "knob", cssVar: v, utility: "None" })
    else if (colorNames.has(v.slice(9))) found.set(v + "color", { kind: "color", cssVar: v, utility: `bg-${v.slice(9)}` })
    else if (v.startsWith("--vita-duration") || v.startsWith("--vita-ease")) found.set(v, { kind: "motion", cssVar: v, utility: v.replace("--vita-", "") })
    else if (v.startsWith("--vita-radius-")) found.set(v, { kind: "radius", cssVar: v, utility: `rounded-${v.slice(16)}` })
    else if (v.startsWith("--vita-shadow-")) found.set(v, { kind: "shadow", cssVar: v, utility: `shadow-${v.slice(16)}` })
    else if (v.startsWith("--vita-control-") || v.startsWith("--vita-inset")) found.set(v, { kind: "size", cssVar: v, utility: `h-${v.slice(9)}` })
    else if (v.startsWith("--vita-text-")) found.set(v, { kind: "type", cssVar: v, utility: `text-${v.slice(14)}` })
  }
  const order: TokenKind[] = ["knob", "color", "type", "font", "size", "radius", "shadow", "motion", "animation"]
  return [...found.values()].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.cssVar.localeCompare(b.cssVar))
}
