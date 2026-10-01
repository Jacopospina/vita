import * as React from "react"
import { cn } from "@/registry/lib/utils"
import { status, type StatusTone } from "@/registry/lib/status"
import { Icon } from "@/registry/ui/icon"

/**
 * Timeline, events in time order on one vertical line: changelogs, run history, an agent's steps, audit trails.
 * Newest first unless the story reads better forward. Each event: a marker on the line, a date, a title, optional detail.
 * A status tone marks the events that matter (a breaking change, a failure); everything else stays neutral.
 * Steps a USER completes → ProgressIndicator. A table of records → DataTable.
 */
export interface TimelineEvent {
  id: string
  date: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
  /** Only for events that matter; the marker takes the status colour and glyph. */
  tone?: StatusTone
}

export function Timeline({ events, label = "Timeline", className }: { events: TimelineEvent[]; label?: string; className?: string }) {
  return (
    <ol aria-label={label} className={cn("relative flex flex-col", className)}>
      {events.map((e, i) => (
        <li key={e.id} className="relative grid grid-cols-[1.5rem_1fr] gap-x-3 pb-6 last:pb-0">
          {/* the line: joins this marker to the next one */}
          {i < events.length - 1 && <span aria-hidden className="absolute top-6 bottom-0 left-3 w-px -translate-x-1/2 bg-divider" />}
          <span aria-hidden className="flex size-6 items-center justify-center">
            {e.tone ? (
              <Icon as={status[e.tone].icon} className={status[e.tone].iconColor} />
            ) : (
              <span className="size-2 rounded-full bg-border-strong" />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
            <span className="text-caption text-muted-foreground">{e.date}</span>
            <span className="text-body font-medium text-foreground">{e.title}</span>
            {e.children && <div className="text-body text-muted-foreground">{e.children}</div>}
          </div>
        </li>
      ))}
    </ol>
  )
}
