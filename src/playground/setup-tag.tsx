import { Tag } from "@/registry/ui/tag"
import { Tooltip } from "@/registry/ui/tooltip"
import { getDoc } from "./docs"
import { needsSetup } from "./setup"

/** "Setup" on a page that still needs the maker's input; hovering it says what to teach Vita. */
export function SetupTag({ section, slug, size }: { section: string; slug: string; size?: "sm" | "md" }) {
  if (!needsSetup(section, slug)) return null
  const what = getDoc(section, slug)?.meta.setup
  return (
    <Tooltip content={`Not set up yet. ${typeof what === "string" ? what : ""}`}>
      <span className="flex">
        <Tag size={size} tone="brand">Setup</Tag>
      </span>
    </Tooltip>
  )
}
