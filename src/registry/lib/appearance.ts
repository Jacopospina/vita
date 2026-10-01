/**
 * Appearance changes that touch every token at once (theme, preset, weather tint, theme knobs) must not run as
 * thousands of per-element transitions — that's what made switching theme lag. Two tools:
 *
 *   swapAppearance(apply)       one GPU cross-fade of the whole page (View Transitions), per-element transitions off
 *   withoutTransitions(apply)   apply instantly (continuous input like a slider being dragged)
 *
 * Page load: `bootAppearance()` keeps transitions off until fonts and layout have settled, so nothing glides into
 * place from its pre-layout position. Call it before the first render.
 */
const SWAP = "data-corpus-swapping"
const BOOT = "data-corpus-booting"

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
 * from its momentarily-unstyled state — things "fly in from the top left" while you work.
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
