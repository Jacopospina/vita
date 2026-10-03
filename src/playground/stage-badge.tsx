import { Information } from "@/registry/icons"
import { OperationalTag } from "@/registry/ui/tag"
import { Icon } from "@/registry/ui/icon"
import { Tooltip } from "@/registry/ui/tooltip"

/**
 * Vita's release stage, above the homepage headline. It looks hoverable (an operational tag: a real button that
 * underlines on hover, with an info glyph) and hover or focus tells makers where Vita stands today.
 */
export function StageBadge() {
  return (
    <Tooltip
      side="bottom"
      content="Vita has just started. Desktop is nearly complete, with foundations, layout and interactions still being refined; mobile isn't stable yet."
    >
      <OperationalTag tone="neutral" aria-label="Inception: where Vita stands today" className="cursor-help pl-1.5">
        <Icon as={Information} size="sm" />
        Inception
      </OperationalTag>
    </Tooltip>
  )
}
