/**
 * Pages that need the maker's own input carry `setup_files` in their frontmatter. A page is set up once each of
 * those paths exists in vita/ (written by the skills when someone tells Vita about their users or their AI),
 * so a fresh download shows "Setup" until then. Files starting with `_` are templates, and a file still holding
 * the `vita:unset` marker hasn't been filled in yet. The published site has no vita/ of its own, so it never shows
 * the label: it explains what the maker will teach Vita instead.
 */
import { getDoc } from "./docs"

const files = import.meta.glob("/vita/**/*.{md,json}", { query: "?raw", import: "default", eager: true }) as Record<string, string>

const filled = Object.entries(files)
  .filter(([path, src]) => !path.split("/").pop()!.startsWith("_") && !src.includes("vita:unset"))
  .map(([path]) => path.slice(1))

const isFilled = (want: string) => filled.some((p) => p === want || p.startsWith(`${want.replace(/\/$/, "")}/`))

/** The published site, as opposed to a local copy of Vita running on the maker's machine. */
export const isPublished = !import.meta.env.DEV

/** True when the page asks for setup and its files aren't there yet (local copies only). */
export function needsSetup(section: string, slug: string): boolean {
  if (isPublished) return false
  const want = getDoc(section, slug)?.meta.setup_files
  if (!Array.isArray(want) || want.length === 0) return false
  return !want.every(isFilled)
}
