import { Tag } from "@/registry/ui/tag"
import { Tooltip } from "@/registry/ui/tooltip"
import { getDoc } from "./docs"
import { missing } from "./setup"

/** "Setup" on anything that still needs the maker's input; hovering it says what to teach Vita. */
export function SetupPill({ files, hint, size }: { files: string[]; hint?: string; size?: "sm" | "md" }) {
  if (!missing(files)) return null
  return (
    <Tooltip content={`Not set up yet. ${hint ?? ""}`.trim()}>
      <span className="flex shrink-0">
        <Tag size={size} tone="brand">Setup</Tag>
      </span>
    </Tooltip>
  )
}

/** The pill for a whole page, from its `setup_files` and `setup` frontmatter. */
export function SetupTag({ section, slug, size }: { section: string; slug: string; size?: "sm" | "md" }) {
  const meta = getDoc(section, slug)?.meta
  const files = meta?.setup_files
  if (!Array.isArray(files)) return null
  return <SetupPill files={files} hint={typeof meta?.setup === "string" ? meta.setup : undefined} size={size} />
}
