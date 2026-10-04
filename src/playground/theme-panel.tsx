import * as React from "react"
import { Stack } from "@/registry/ui/layout"
import { SwatchPicker } from "@/registry/ui/swatch-picker"
import { Text } from "@/registry/ui/text"
import { Dropdown } from "@/registry/ui/dropdown"
import { Button } from "@/registry/ui/button"
import { Separator } from "@/registry/ui/separator"
import { swapAppearance, withoutTransitions } from "@/registry/lib/appearance"
import type { useWeatherTint } from "@/registry/hooks/use-weather-tint"
import { RightPanel } from "@/registry/ui/ui-shell"
import { MiniColor, MiniGlow, temperatureStops } from "@/registry/ui/mini-chart"
import { StepSlider } from "@/registry/ui/slider"
import { ContentSwitcher } from "@/registry/ui/content-switcher"
import { Label } from "@/registry/ui/form"
import { SwapIcon } from "@/registry/ui/icon"
import { Moon, Sun, PartlyCloudy } from "@/registry/icons"

/** Live editor for the theme.css knobs. Writes CSS custom properties on <html>. */
const knobs = [
  { key: "--vita-brand-hue", label: "Brand hue", min: 0, max: 360, step: 0.1, def: 257.4, unit: "" },
  { key: "--vita-brand-chroma", label: "Brand chroma", min: 0, max: 0.3, step: 0.001, def: 0.218, unit: "" },
  { key: "--vita-neutral-hue", label: "Neutral hue", min: 0, max: 360, step: 1, def: 286, unit: "" },
  { key: "--vita-neutral-chroma", label: "Neutral tint", min: 0, max: 0.03, step: 0.001, def: 0, unit: "" },
  { key: "--vita-radius", label: "Corner radius", min: 0, max: 1.25, step: 0.125, def: 0.5, unit: "rem" },
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

/** Grey tints by name: the outer ring reaches Mist and Sand (cool, warm); the swatches reach every tint. */
const greyTints = [
  { value: "neutral", label: "Stone", hue: 286, chroma: 0 },
  { value: "cool", label: "Mist", hue: 250, chroma: 0.012 },
  { value: "warm", label: "Sand", hue: 70, chroma: 0.012 },
  { value: "sage", label: "Moss", hue: 150, chroma: 0.01 },
  { value: "lilac", label: "Haze", hue: 300, chroma: 0.012 },
]

/**
 * The dial's outer ring is the temperature of the grey you picked: it leans that grey cool (Mist's hue) or warm
 * (Sand's), up to 0.02 of tint, by adding the two tints as colours (on the OKLCH chroma plane). Stone, untinted,
 * just takes the lean.
 */
const COOL = 250
const WARM = 70
const MAX_TINT = 0.02
const rad = (d: number) => (d * Math.PI) / 180
function leanGrey(base: { hue: number; chroma: number }, temperature: number) {
  const lean = Math.abs(temperature - 0.5) * 2 * MAX_TINT
  const toward = temperature < 0.5 ? COOL : WARM
  const a = base.chroma * Math.cos(rad(base.hue)) + lean * Math.cos(rad(toward))
  const b = base.chroma * Math.sin(rad(base.hue)) + lean * Math.sin(rad(toward))
  const chroma = Math.hypot(a, b)
  return {
    hue: chroma < 0.0005 ? base.hue : Math.round((((Math.atan2(b, a) * 180) / Math.PI + 360) % 360) * 10) / 10,
    chroma: Math.round(chroma * 1000) / 1000,
  }
}
/** The brand colour a hue is closest to, by name ("Tide"), for screen readers. */
const hueName = (deg: number) => brandColors.filter((c) => c.value !== "gray" && c.value !== "brown").reduce((a, b) => (Math.abs(((b.hue - deg + 540) % 360) - 180) < Math.abs(((a.hue - deg + 540) % 360) - 180) ? b : a)).label

/* Form follows function: every option shows what it does. */
const radii = [
  { v: 0, label: "Square" }, { v: 0.25, label: "Subtle" }, { v: 0.5, label: "Default" }, { v: 0.75, label: "Soft" }, { v: 1.25, label: "Round" },
]
const densities = [{ v: 0.9, label: "Compact" }, { v: 1.08, label: "Default" }, { v: 1.2, label: "Roomy" }]
/** Named by what people choose, not the pixels behind them (12, 13, 14, 16). */
const bodySizes = [{ v: 0.75, label: "Small" }, { v: 0.8125, label: "Medium" }, { v: 0.875, label: "Large" }, { v: 1, label: "Huge" }]
const ratios = [{ v: 1.125, label: "Subtle" }, { v: 1.2, label: "Default" }, { v: 1.25, label: "Bold" }, { v: 1.333, label: "Dramatic" }]
const speeds = [{ v: 0, label: "Off" }, { v: 0.5, label: "Quick" }, { v: 1, label: "Default" }, { v: 1.5, label: "Calm" }, { v: 2, label: "Slow" }]
/** The option nearest a knob's value. */
const nearest = (list: { v: number }[], x: number) => list.reduce((best, o, i) => (Math.abs(o.v - x) < Math.abs(list[best].v - x) ? i : best), 0)

/** Each choice with its one-line gist, shown under the field once picked. */
const presets = [
  { value: "default", label: "Default", gist: "Vita as it ships: blue, gently rounded, Google Sans Flex." },
  { value: "square", label: "Square", gist: "Sharp corners and a grotesk face: precise and editorial." },
  { value: "soft", label: "Soft", gist: "Round corners, more room and the system face: calm and friendly." },
  { value: "mono", label: "Mono", gist: "Almost no colour and tighter rows: quiet and dense." },
]
const sliders = [
  { key: "--vita-radius", name: "How round are corners?", list: radii },
  { key: "--vita-density", name: "How much room?", list: densities },
  { key: "--vita-type-ratio", name: "How big are headings?", list: ratios },
  { key: "--vita-motion-scale", name: "How quick are transitions?", list: speeds },
]

const fonts = [
  { value: "flex", label: "Google Sans Flex (default)", css: `"Google Sans Flex Variable", "Google Sans Flex", system-ui, sans-serif`, gist: "Vita's own face: modern, warm, made for screens." },
  { value: "system", label: "System UI", css: `system-ui, sans-serif`, gist: "The device's own face: native everywhere, nothing to load." },
  { value: "grotesk", label: "Grotesk", css: `"Helvetica Neue", Arial, sans-serif`, gist: "A classic grotesk: neutral, precise, timeless." },
  { value: "serif", label: "Serif (editorial)", css: `"New York", "Iowan Old Style", Georgia, serif`, gist: "A reading serif: editorial and long-form." },
]

export function ThemePanel({ open, onOpenChange, weather, dark, onDarkChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  weather: ReturnType<typeof useWeatherTint>
  dark: boolean
  onDarkChange: (dark: boolean) => void
}) {
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
    setGrey("neutral")
    setTemperature(0.5)
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

  const [copied, setCopied] = React.useState(false)
  const copy = () => {
    void navigator.clipboard?.writeText(css)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  // The greys: which one (a swatch), then how cool or warm it leans (the dial's outer ring). Stone is the default.
  const [grey, setGrey] = React.useState("neutral")
  const [temperature, setTemperature] = React.useState(0.5)
  const tintGreys = (g: string, t: number) => {
    // Turning the greys by hand replaces the weather's tint.
    if (weather.mode !== "none") weather.setMode("none")
    const c = leanGrey(greyTints.find((x) => x.value === g) ?? greyTints[0], t)
    setValues((s) => ({ ...s, "--vita-neutral-hue": c.hue, "--vita-neutral-chroma": c.chroma }))
  }

  return (
    // The reset lives in the panel's footer, so it stays in reach however far the knobs scroll.
    <RightPanel open={open} onOpenChange={onOpenChange} title="Theme" size="md" footer={
      <>
        {/* The export is one click away, so the panel needs no code block: Copy code says "Copied" for a moment. */}
        <Button variant="secondary" onClick={copy}>{copied ? "Copied" : "Copy code"}</Button>
        <Button onClick={() => applyPreset("default")}>Reset to defaults</Button>
      </>
    }>
    <Stack gap="md">
      {/* The theme at a glance, and in one hand: the middle switches light and dark, the wheel sets the brand hue,
          the outer ring how warm or cool the greys are. */}
      <Stack gap="xs" align="center">
        <MiniColor
          size="lg"
          label="Theme"
          hue={values["--vita-brand-hue"] / 360}
          brightness={temperature}
          outer={temperatureStops}
          center={<SwapIcon as={dark ? Moon : Sun} />}
          onPress={() => onDarkChange(!dark)}
          pressLabel="Dark theme"
          pressed={dark}
          hueLabel="Brand colour"
          brightnessLabel="Grey temperature"
          describe={{ hue: (h) => hueName(h * 360), brightness: (v) => (v < 0.45 ? "Cool" : v > 0.55 ? "Warm" : "Neutral") }}
          onHueChange={(h) => setValues((s) => ({ ...s, "--vita-brand-hue": Math.round(h * 3600) / 10, "--vita-brand-chroma": s["--vita-brand-chroma"] < 0.05 ? 0.2 : s["--vita-brand-chroma"] }))}
          onBrightnessChange={(v) => {
            setTemperature(v)
            tintGreys(grey, v)
          }}
        />
        <Text variant="caption" tone="muted" className="text-center">Middle: light or dark. Colour ring: brand. Outer ring: how cool or warm your grey leans.</Text>
      </Stack>
      {/* Whether the greys follow the weather: a toggle, centred under the dial. */}
      <Stack gap="2xs" align="center">
        <MiniGlow
          label={weather.mode === "dynamic" ? `Greys follow the weather${weather.celsius === null ? "" : `, ${Math.round(weather.celsius)} degrees outside`}` : "Greys don't follow the weather"}
          icon={PartlyCloudy}
          tone={weather.mode !== "dynamic" ? "neutral" : weather.tint === "cold" ? "info" : weather.tint === "warm" ? "warning" : "success"}
          display={weather.mode === "dynamic" && weather.celsius !== null ? `${Math.round(weather.celsius)}°` : "–"}
          caption={weather.mode === "dynamic" ? "Live" : "Off"}
          pressed={weather.mode === "dynamic"}
          onPress={() => weather.setMode(weather.mode === "dynamic" ? "none" : "dynamic")}
        />
        {/* What the toggle does, not its name: the tile already shows the weather. */}
        <Text variant="caption" tone="muted" className="max-w-64 text-center">
          {/* What the current state means for the greys, in the weather's terms. */}
          {weather.mode === "dynamic" ? "The weather outside tints the greys: cooler when it's cold, warmer when it's warm." : "The weather outside, cold or warm, doesn't change the greys."}
        </Text>
      </Stack>
      <SwatchPicker
        label="Which grey?"
        size="sm"
        // vita-allow raw-color: the theme editor previews a grey tint the tokens don't have yet, approved by @jacopo
        items={greyTints.map((c) => ({ value: c.value, label: c.label, color: `oklch(0.62 ${c.chroma * 4} ${c.hue})` }))}
        value={grey}
        onValueChange={(v) => {
          setGrey(v)
          tintGreys(v, temperature)
        }}
      />
      <Separator />
      {/* Choices by name. */}
      <Dropdown label="Style" value={preset} onValueChange={applyPreset} items={presets.map(({ value, label }) => ({ value, label }))} helperText={presets.find((p) => p.value === preset)?.gist} />
      <Dropdown label="Typeface" items={fonts.map(({ value, label }) => ({ value, label }))} value={font} onValueChange={setFont} helperText={fonts.find((f) => f.value === font)?.gist} />
      <Separator />
      {/* Ordered steps of one property are stepped sliders; the body size, a few exact sizes, a button group. */}
      {sliders.map((s) => (
        <StepSlider
          key={s.key}
          label={s.name}
          steps={s.list.map((o, n) => ({ value: String(n), label: o.label }))}
          value={String(nearest(s.list, values[s.key]))}
          onValueChange={(n) => setValues((v) => ({ ...v, [s.key]: s.list[Number(n)].v }))}
        />
      ))}
      <Stack gap="xs">
        <Label id="body-size">How big is the text?</Label>
        <ContentSwitcher
          label="How big is the text?"
          items={bodySizes.map((b) => ({ value: String(b.v), label: b.label }))}
          value={String(bodySizes[nearest(bodySizes, values["--vita-type-base"])].v)}
          onValueChange={(v) => setValues((s) => ({ ...s, "--vita-type-base": Number(v) }))}
        />
      </Stack>
    </Stack>
    </RightPanel>
  )
}
