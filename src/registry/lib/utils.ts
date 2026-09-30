import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge must know Corpus's custom scales, otherwise `text-body`
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
