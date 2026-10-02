import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge must know Vita's custom scales, otherwise `text-body`
 * (font size) and `text-foreground` (color) would be treated as conflicts.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["caption", "footnote", "body", "body-lg", "headline", "title-3", "title-2", "title-1", "large-title", "display"],
      radius: ["sm", "md", "lg", "xl"],
      shadow: ["raised", "floating", "overlay"],
      spacing: ["control-xs", "control-sm", "control-md", "control-lg", "control-xl", "field-sm", "field-md", "field-lg", "inset-sm", "inset", "inset-lg"],
      ease: ["productive", "productive-enter", "productive-exit", "expressive", "expressive-enter", "expressive-exit", "spring"],
    },
    classGroups: {
      duration: [{ duration: ["fast-01", "fast-02", "moderate-01", "moderate-02", "slow-01", "slow-02", "expressive"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Vita's productive easing, for animations started from script (Web Animations). Same curve as --vita-ease-productive. */
export const EASE_PRODUCTIVE = "cubic-bezier(0.2, 0, 0.38, 0.9)"

/**
 * A duration for an animation started from script, on Vita's motion terms: scaled by the theme's motion speed
 * (`--vita-motion-scale`, 0 turns motion off), and 0 under reduced motion or while the page boots or swaps theme
 * (static layout never moves on load). 0 means: don't animate, just apply the end state.
 */
export function motionMs(ms: number): number {
  if (typeof window === "undefined") return 0
  const root = document.documentElement
  if (root.hasAttribute("data-vita-booting") || root.hasAttribute("data-vita-swapping")) return 0
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return 0
  const scale = parseFloat(getComputedStyle(root).getPropertyValue("--vita-motion-scale"))
  return ms * (Number.isFinite(scale) ? Math.max(0, scale) : 1)
}
