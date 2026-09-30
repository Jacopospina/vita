import * as React from "react"
import { Slider } from "@/registry/ui/slider"
import { Stack } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Toggle } from "@/registry/ui/toggle"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { Dropdown } from "@/registry/ui/dropdown"
import { CodeSnippet } from "@/registry/ui/code-snippet"
import { Button } from "@/registry/ui/button"
import { Separator } from "@/registry/ui/separator"

/** Live editor for the theme.css knobs. Writes CSS custom properties on <html>. */
const knobs = [
  { key: "--corpus-brand-hue", label: "Brand hue", min: 0, max: 360, step: 0.1, def: 257.4, unit: "" },
  { key: "--corpus-brand-chroma", label: "Brand chroma", min: 0, max: 0.3, step: 0.001, def: 0.218, unit: "" },
  { key: "--corpus-neutral-hue", label: "Neutral hue", min: 0, max: 360, step: 1, def: 286, unit: "" },
  { key: "--corpus-neutral-chroma", label: "Neutral tint", min: 0, max: 0.03, step: 0.001, def: 0.007, unit: "" },
  { key: "--corpus-radius", label: "Corner radius", min: 0, max: 1.25, step: 0.125, def: 0.5, unit: "rem" },
  { key: "--corpus-density", label: "Density", min: 0.8, max: 1.25, step: 0.05, def: 1, unit: "" },
  { key: "--corpus-type-base", label: "Body size", min: 0.75, max: 1.125, step: 0.0625, def: 0.875, unit: "rem" },
  { key: "--corpus-type-ratio", label: "Type scale ratio", min: 1.1, max: 1.333, step: 0.01, def: 1.2, unit: "" },
  { key: "--corpus-motion-scale", label: "Motion speed", min: 0, max: 2, step: 0.25, def: 1, unit: "" },
] as const

const fonts = [
  { value: "flex", label: "Google Sans Flex (default)", css: `"Google Sans Flex Variable", "Google Sans Flex", system-ui, sans-serif` },
  { value: "system", label: "System UI", css: `system-ui, sans-serif` },
  { value: "grotesk", label: "Grotesk", css: `"Helvetica Neue", Arial, sans-serif` },
  { value: "serif", label: "Serif (editorial)", css: `"New York", "Iowan Old Style", Georgia, serif` },
]

export function ThemePanel({ dark, onDarkChange }: { dark: boolean; onDarkChange: (d: boolean) => void }) {
  const [values, setValues] = React.useState<Record<string, number>>(() => Object.fromEntries(knobs.map((k) => [k.key, k.def])))
  const [font, setFont] = React.useState("flex")
  const [preset, setPreset] = React.useState("default")

  React.useEffect(() => {
    const root = document.documentElement
    knobs.forEach((k) => root.style.setProperty(k.key, `${values[k.key]}${k.unit}`))
    root.style.setProperty("--corpus-font-sans", fonts.find((f) => f.value === font)!.css)
  }, [values, font])

  const applyPreset = (p: string) => {
    setPreset(p)
    const root = document.documentElement
    knobs.forEach((k) => root.style.removeProperty(k.key))
    root.style.removeProperty("--corpus-font-sans")
    if (p === "default") root.removeAttribute("data-corpus-preset")
    else root.setAttribute("data-corpus-preset", p)
    requestAnimationFrame(() => {
      const cs = getComputedStyle(root)
      setValues(Object.fromEntries(knobs.map((k) => [k.key, parseFloat(cs.getPropertyValue(k.key)) || k.def])))
      const f = cs.getPropertyValue("--corpus-font-sans")
      setFont(f.includes("Helvetica") ? "grotesk" : f.trim().startsWith("system-ui") ? "system" : "flex")
    })
  }

  const css = `:root {\n${knobs.map((k) => `  ${k.key}: ${values[k.key]}${k.unit};`).join("\n")}\n  --corpus-font-sans: ${fonts.find((f) => f.value === font)!.css};\n}`

  return (
    <Stack gap="lg">
      <Text tone="muted">Every token in Corpus derives from these knobs. Tune them here, then paste the result into <code className="font-mono">src/styles/theme.css</code>.</Text>
      <ContentSwitcher label="Preset" value={preset} onValueChange={applyPreset} size="sm" items={[{ value: "default", label: "Corpus" }, { value: "square", label: "Square" }, { value: "soft", label: "Soft" }, { value: "mono", label: "Mono" }]} className="w-full" />
      <Toggle label="Dark theme" checked={dark} onCheckedChange={onDarkChange} />
      <Separator />
      {knobs.map((k) => (
        <Slider
          key={k.key}
          label={k.label}
          min={k.min}
          max={k.max}
          step={k.step}
          value={[values[k.key]]}
          showBounds={false}
          formatValue={(v) => `${Number(v.toFixed(3))}${k.unit}`}
          onValueChange={([v]) => setValues((s) => ({ ...s, [k.key]: v }))}
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
