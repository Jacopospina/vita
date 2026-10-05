/**
 * Appearance changes that touch every token at once (theme, preset, weather tint, theme knobs) must not run as
 * thousands of per-element transitions, that's what made switching theme lag. Two tools:
 *
 *   swapAppearance(apply)       one GPU cross-fade of the whole page (View Transitions), per-element transitions off
 *   withoutTransitions(apply)   apply instantly (continuous input like a slider being dragged)
 *
 * Page load: `bootAppearance()` keeps transitions off until fonts and layout have settled, so nothing glides into
 * place from its pre-layout position. Call it before the first render.
 */
const SWAP = "data-vita-swapping"
const BOOT = "data-vita-booting"

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

export function withoutTransitions(apply: () => void) {
  const root = document.documentElement
  root.setAttribute(SWAP, "")
  apply()
  void getComputedStyle(root).color // flush styles with transitions off
  root.removeAttribute(SWAP)
}

export function swapAppearance(apply: () => void) {
  const root = document.documentElement
  const start = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition
  if (!start || root.hasAttribute(BOOT) || reducedMotion() || document.visibilityState !== "visible") return withoutTransitions(apply)
  root.setAttribute(SWAP, "")
  start.call(document, apply).finished.finally(() => root.removeAttribute(SWAP))
}

/**
 * Dev only: Vite re-injects CSS on every hot update. Without this, each style edit makes every element transition
 * from its momentarily-unstyled state, things "fly in from the top left" while you work.
 */
export function guardHotStyleUpdates(hot: { on: (event: string, cb: () => void) => void } | undefined) {
  if (!hot) return
  const root = document.documentElement
  let t = 0
  hot.on("vite:beforeUpdate", () => {
    window.clearTimeout(t)
    root.setAttribute(SWAP, "")
  })
  hot.on("vite:afterUpdate", () => {
    window.clearTimeout(t)
    t = window.setTimeout(() => root.removeAttribute(SWAP), 400)
  })
}

export function bootAppearance() {
  const root = document.documentElement
  root.setAttribute(BOOT, "")
  // Settled = the window has loaded AND the fonts it started loading are in (fonts.ready resolves early if checked
  // before any font request), plus a beat for the last reflow. Capped, so a stuck font never blocks motion.
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }))
  const settled = loaded.then(() => document.fonts?.ready)
  Promise.race([settled, new Promise((r) => setTimeout(r, 3000))]).then(() => setTimeout(() => root.removeAttribute(BOOT), 250))
}

/** The colour of light at a temperature in kelvin (a black body), as 0 to 1 RGB. */
function kelvinRgb(k: number) {
  const t = k / 100
  const c = (v: number) => Math.min(1, Math.max(0, v / 255))
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  return [c(r), c(g), c(b)]
}

/**
 * Warmth is the screen's colour temperature, like a display's warm setting: daylight (6500 K) is neutral, warmth 1
 * is about 4000 K, warmth -1 about 10000 K (even steps in mireds, the scale the eye reads evenly). The white point
 * is that light divided by daylight's, multiplied over the screen (vita.css): only the colour of the light changes,
 * never a hue. The layer exists only while the screen leans, so a neutral screen never pays for the blend.
 * Call after changing --vita-warmth or --vita-weather-warmth.
 */
export function syncWarmth() {
  const root = document.documentElement
  const cs = getComputedStyle(root)
  const w = Math.max(-1, Math.min(1, (parseFloat(cs.getPropertyValue("--vita-warmth")) || 0) + (parseFloat(cs.getPropertyValue("--vita-weather-warmth")) || 0)))
  root.toggleAttribute("data-vita-warmth", Math.abs(w) > 0.001)
  const mired = 1e6 / 6500 + (w > 0 ? w * 96 : w * 54)
  const light = kelvinRgb(1e6 / mired), day = kelvinRgb(6500)
  const ratio = light.map((v, i) => v / day[i])
  const top = Math.max(...ratio)
  root.style.setProperty("--vita-white-point", `rgb(${ratio.map((v) => Math.round((v / top) * 255)).join(" ")})`)
}
