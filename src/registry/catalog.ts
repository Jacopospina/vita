import type * as React from "react"

/**
 * Catalog, EVERY glyph in the system, for galleries and pickers only. Load it with the functions below when a page
 * needs it; product code imports named glyphs from ./icons and ./pictograms, which tree-shake to what is used.
 *
 * Why the CommonJS builds: the ES builds are the modules every component imports statically. A module lives in one
 * chunk, so a dynamic import of those same modules can't be split off, and listing all their exports kept the whole
 * library (about six megabytes of JavaScript) in the chunk every page loads, including the homepage on a phone.
 * The CommonJS files are different modules: they split into chunks that only the galleries fetch.
 */
export type Glyph = React.ComponentType<Record<string, unknown>>

/** The glyph components of a module, by name, sorted, whichever shape the CommonJS interop gives the namespace. */
function glyphs(mod: Record<string, unknown>): [string, Glyph][] {
  const named = Object.keys(mod).filter((k) => k !== "default" && k !== "__esModule")
  const src = (named.length === 0 && mod.default && typeof mod.default === "object" ? mod.default : mod) as Record<string, unknown>
  return Object.entries(src)
    .filter(([name, v]) => /^[A-Z]/.test(name) && name !== "Icon" && (typeof v === "function" || (typeof v === "object" && v !== null && "render" in v)))
    .sort(([a], [b]) => a.localeCompare(b)) as [string, Glyph][]
}

export const allIcons = async () => glyphs(await import("@carbon/icons-react/lib/index.js"))
export const allPictograms = async () => glyphs(await import("@carbon/pictograms-react/lib/index.js"))
