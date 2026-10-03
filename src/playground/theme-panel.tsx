import * as React from "react"
import { SwatchPicker } from "@/registry/ui/swatch-picker"
import { PreviewPicker } from "@/registry/ui/preview-picker"
import { Stack } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Dropdown } from "@/registry/ui/dropdown"
import { CodeSnippet } from "@/registry/ui/code-snippet"
import { Button } from "@/registry/ui/button"
import { Separator } from "@/registry/ui/separator"
import { Icon } from "@/registry/ui/icon"
import { Bot } from "@/registry/icons"
import { swapAppearance, withoutTransitions } from "@/registry/lib/appearance"
import type { useWeatherTint } from "@/registry/hooks/use-weather-tint"

/** Live editor for the theme.css knobs. Writes CSS custom properties on <html>. */
const knobs = [
  { key: "--vita-brand-hue", label: "Brand hue", min: 0, max: 360, step: 0.1, def: 257.4, unit: "" },
  { key: "--vita-brand-chroma", label: "Brand chroma", min: 0, max: 0.3, step: 0.001, def: 0.218, unit: "" },
  { key: "--vita-neutral-hue", label: "Neutral hue", min: 0, max: 360, step: 1, def: 286, unit: "" },
  { key: "--vita-neutral-chroma", label: "Neutral tint", min: 0, max: 0.03, step: 0.001, def: 0, unit: "" },
  { key: "--vita-radius", label: "Corner radius", min: 0, max: 1.25, step: 0.125, def: 0.5, unit: "rem" },
  { key: "--vita-line", label: "Line weight", min: 0, max: 1, step: 0.25, def: 0.5, unit: "px" },
  { key: "--vita-density", label: "Density", min: 0.8, max: 1.25, step: 0.01, def: 1.08, unit: "" },
  { key: "--vita-type-base", label: "Body size", min: 0.75, max: 1.125, step: 0.0625, def: 0.8125, unit: "rem" },
  { key: "--vita-type-ratio", label: "Type scale ratio", min: 1.1, max: 1.333, step: 0.01, def: 1.2, unit: "" },
  { key: "--vita-motion-scale", label: "Motion speed", min: 0, max: 2, step: 0.25, def: 1, unit: "" },
] as const

/* Colour is chosen by recognition, not dialled in: the system's hues for the brand, a few tints for the greys.
   Named in Vita's voice (life and making), so a colour is something you can picture, not a hue number. */
const brandColors = [
  { value: "blue", label: "Tide", hue: 257.4, chroma: 0.218 },
  { value: "indigo", label: "Dusk", hue: 278.3, chroma: 0.191 },
  { value: "purple", label: "Iris", hue: 312.4, chroma: 0.213 },
  { value: "pink", label: "Petal", hue: 17.9, chroma: 0.238 },
  { value: "red", label: "Pulse", hue: 28.7, chroma: 0.232 },
  { value: "orange", label: "Ember", hue: 50.0, chroma: 0.175 },
  { value: "yellow", label: "Pollen", hue: 90.4, chroma: 0.177 },
  { value: "green", label: "Sprout", hue: 147.4, chroma: 0.194 },
  { value: "mint", label: "Dew", hue: 189.0, chroma: 0.13 },
  { value: "teal", label: "Lagoon", hue: 212.7, chroma: 0.111 },
  { value: "cyan", label: "Breeze", hue: 233.9, chroma: 0.133 },
  { value: "brown", label: "Clay", hue: 72.8, chroma: 0.064 },
  { value: "gray", label: "Charcoal", hue: 286.2, chroma: 0.02 },
]
const greyTints = [
  { value: "neutral", label: "Stone", hue: 286, chroma: 0 },
  { value: "cool", label: "Mist", hue: 250, chroma: 0.012 },
  { value: "warm", label: "Sand", hue: 70, chroma: 0.012 },
  { value: "sage", label: "Moss", hue: 150, chroma: 0.01 },
  { value: "lilac", label: "Haze", hue: 300, chroma: 0.012 },
]
const near = (a: number, b: number) => Math.abs(a - b) < 0.5

/** A preview drawn at a knob's value (the one place the theme editor styles inline: it shows values tokens don't hold yet). */
function Fx({ look, className, children }: { look: React.CSSProperties; className?: string; children?: React.ReactNode }) {
  return <span aria-hidden className={className} style={look}>{children}</span> // vita-allow inline-style: the theme editor previews raw knob values before they become tokens, approved by @jacopo
}

/* Form follows function: every option shows what it does. */
const radii = [
  { v: 0, label: "Square" }, { v: 0.25, label: "Subtle" }, { v: 0.5, label: "Default" }, { v: 0.75, label: "Soft" }, { v: 1.25, label: "Round" },
]
const lines = [{ v: 0, label: "Fine" }, { v: 0.5, label: "Default" }, { v: 1, label: "Bold" }]
const densities = [{ v: 0.9, label: "Compact" }, { v: 1.08, label: "Default" }, { v: 1.2, label: "Roomy" }]
const bodySizes = [{ v: 0.75, label: "12" }, { v: 0.8125, label: "13" }, { v: 0.875, label: "14" }, { v: 1, label: "16" }]
const ratios = [{ v: 1.125, label: "Subtle" }, { v: 1.2, label: "Default" }, { v: 1.25, label: "Bold" }, { v: 1.333, label: "Dramatic" }]
const speeds = [{ v: 0, label: "Off" }, { v: 0.5, label: "Quick" }, { v: 1, label: "Default" }, { v: 1.5, label: "Calm" }, { v: 2, label: "Slow" }]
const pick = (list: { v: number }[], x: number) => String(list.reduce((a, b) => (Math.abs(b.v - x) < Math.abs(a.v - x) ? b : a)).v)
const knobPreviews: Record<string, { label: string; items: { value: string; label: string; preview: React.ReactNode }[] }> = {
  "--vita-radius": { label: "Corner radius", items: radii.map((r) => ({ value: String(r.v), label: r.label, preview: <Fx className="size-6 border-2 border-current" look={{ borderRadius: `${r.v * 0.75}rem` }} /> })) },
  "--vita-line": { label: "Line weight", items: lines.map((l) => ({ value: String(l.v), label: l.label, preview: <Fx look={{ "--vita-line": `${l.v}px` } as React.CSSProperties}><Icon as={Bot} size="md" /></Fx> })) },
  "--vita-density": { label: "Density", items: densities.map((d) => ({ value: String(d.v), label: d.label, preview: <Fx className="flex w-8 flex-col" look={{ gap: `${(d.v - 0.75) * 12}px` }}>{[0, 1, 2].map((i) => <span key={i} className="h-0.5 rounded-full bg-current" />)}</Fx> })) },
  "--vita-type-base": { label: "Body size", items: bodySizes.map((b) => ({ value: String(b.v), label: b.label, preview: <Fx look={{ fontSize: `${b.v}rem` }}>Aa</Fx> })) },
  "--vita-type-ratio": { label: "Type scale", items: ratios.map((r) => ({ value: String(r.v), label: r.label, preview: <span className="flex items-baseline gap-0.5"><Fx className="font-semibold leading-none" look={{ fontSize: `${0.6 * r.v ** 4}rem` }}>A</Fx><Fx className="leading-none" look={{ fontSize: "0.6rem" }}>a</Fx></span> })) },
  "--vita-motion-scale": { label: "Motion speed", items: speeds.map((m) => ({ value: String(m.v), label: m.label, preview: <span className="relative h-2 w-8"><Fx className="preview-glide absolute top-0 left-0 size-2 rounded-full bg-current" look={{ animationDuration: m.v ? `${0.9 * m.v}s` : "0s" }} /></span> })) },
}

const fonts = [
  { value: "flex", label: "Google Sans Flex (default)", css: `"Google Sans Flex Variable", "Google Sans Flex", system-ui, sans-serif` },
  { value: "system", label: "System UI", css: `system-ui, sans-serif` },
  { value: "grotesk", label: "Grotesk", css: `"Helvetica Neue", Arial, sans-serif` },
  { value: "serif", label: "Serif (editorial)", css: `"New York", "Iowan Old Style", Georgia, serif` },
]

export function ThemePanel({ weather }: { weather: ReturnType<typeof useWeatherTint> }) {
  const [values, setValues] = React.useState<Record<string, number>>(() => Object.fromEntries(knobs.map((k) => [k.key, k.def])))
  const [font, setFont] = React.useState("flex")
  const [preset, setPreset] = React.useState("default")

  React.useEffect(() => {
    const root = document.documentElement
    // Knobs apply at once (no per-element transitions across the whole page); the pickers show the change.
    withoutTransitions(() => {
      knobs.forEach((k) => root.style.setProperty(k.key, `${values[k.key]}${k.unit}`))
      root.style.setProperty("--vita-font-sans", fonts.find((f) => f.value === font)!.css)
    })
  }, [values, font])

  const applyPreset = (p: string) => {
    setPreset(p)
    const root = document.documentElement
    swapAppearance(() => {
      knobs.forEach((k) => root.style.removeProperty(k.key))
      root.style.removeProperty("--vita-font-sans")
      if (p === "default") root.removeAttribute("data-vita-preset")
      else root.setAttribute("data-vita-preset", p)
    })
    requestAnimationFrame(() => {
      const cs = getComputedStyle(root)
      setValues(Object.fromEntries(knobs.map((k) => [k.key, parseFloat(cs.getPropertyValue(k.key)) || k.def])))
      const f = cs.getPropertyValue("--vita-font-sans")
      setFont(f.includes("Helvetica") ? "grotesk" : f.trim().startsWith("system-ui") ? "system" : "flex")
    })
  }

  const css = `:root {\n${knobs.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`).join("\n")}\n  --vita-font-sans: ${fonts.find((f) => f.value === font)!.css};\n}`

  return (
    <Stack gap="md">
      <Text tone="muted">Every token in Vita derives from these knobs. Tune them here, then paste the result into <code className="font-mono">src/styles/theme.css</code>.</Text>
      <Dropdown label="Theme" value={preset} onValueChange={applyPreset} items={[{ value: "default", label: "Default" }, { value: "square", label: "Square" }, { value: "soft", label: "Soft" }, { value: "mono", label: "Mono" }]} />
      <Stack gap="xs">
        <Dropdown
          label="Greys"
          value={weather.mode}
          onValueChange={(v) => weather.setMode(v as typeof weather.mode)}
          items={[{ value: "dynamic", label: "Dynamic", description: "Follows the weather outside" }, { value: "none", label: "Neutral" }, { value: "cold", label: "Cold" }, { value: "warm", label: "Warm" }]}
        />
        <Text variant="caption" tone="muted">
          {weather.mode === "dynamic"
            ? weather.celsius === null ? "Reading the temperature outside…" : `${Math.round(weather.celsius)} °C outside · ${weather.tint === "none" ? "neutral greys" : `${weather.tint} greys`}`
            : weather.mode === "none" ? "Neutral only: greys never tint." : `${weather.mode === "cold" ? "Cold" : "Warm"} only, whatever the weather. It replaces the neutral hue and tint below.`}
        </Text>
      </Stack>
      <Separator />
      <SwatchPicker
        label="Brand colour"
        size="sm"
        items={brandColors.map((c) => ({ value: c.value, label: c.label, color: `var(--vita-palette-${c.value}-500)` }))}
        value={brandColors.find((c) => near(c.hue, values["--vita-brand-hue"]))?.value ?? ""}
        onValueChange={(v) => {
          const c = brandColors.find((x) => x.value === v)!
          setValues((s) => ({ ...s, "--vita-brand-hue": c.hue, "--vita-brand-chroma": c.chroma }))
        }}
      />
      <SwatchPicker
        label="Grey tint"
        size="sm"
        // vita-allow raw-color: the theme editor previews a grey tint the tokens don't have yet, approved by @jacopo
        items={greyTints.map((c) => ({ value: c.value, label: c.label, color: `oklch(0.62 ${c.chroma * 4} ${c.hue})` }))}
        value={greyTints.find((c) => near(c.hue, values["--vita-neutral-hue"]) && Math.abs(c.chroma - values["--vita-neutral-chroma"]) < 0.002)?.value ?? (values["--vita-neutral-chroma"] === 0 ? "neutral" : "")}
        onValueChange={(v) => {
          const c = greyTints.find((x) => x.value === v)!
          setValues((s) => ({ ...s, "--vita-neutral-hue": c.hue, "--vita-neutral-chroma": c.chroma }))
        }}
      />
      {Object.entries(knobPreviews).map(([key, p]) => (
        <PreviewPicker
          key={key}
          label={p.label}
          items={p.items}
          value={pick(p.items.map((i) => ({ v: Number(i.value) })), values[key])}
          onValueChange={(v) => setValues((s) => ({ ...s, [key]: Number(v) }))}
        />
      ))}
      <Dropdown label="Typeface" items={fonts.map(({ value, label }) => ({ value, label }))} value={font} onValueChange={setFont} />
      <Separator />
      <Text variant="headline">theme.css</Text>
      <CodeSnippet type="multi">{css}</CodeSnippet>
      <Button variant="secondary" onClick={() => applyPreset("default")}>Reset to defaults</Button>
    </Stack>
  )
}
