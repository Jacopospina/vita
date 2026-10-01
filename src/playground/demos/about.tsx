import type { DemoMap } from "./types"
import { Grid, Column, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Tile } from "@/registry/ui/tile"
import { Button } from "@/registry/ui/button"
import { TextInput } from "@/registry/ui/text-input"
import { Tag } from "@/registry/ui/tag"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { Timeline } from "@/registry/ui/timeline"
import changelog from "../../../docs/changelog.json"

/** The changelog as one timeline, grouped by release: breaking changes carry a warning marker. */
function ChangelogTimeline() {
  const groups = new Map<string, typeof changelog.entries>()
  for (const e of changelog.entries) groups.set(e.release, [...(groups.get(e.release) ?? []), e])
  return (
    <Stack gap="xl">
      {[...groups].map(([release, entries]) => (
        <Stack key={release} gap="md">
          <Text variant="title-3" as="h3">{release}</Text>
          <Timeline
            label={`Changes in ${release}`}
            events={entries.map((e) => ({ id: e.id, date: e.date, title: e.title, tone: e.breaking ? "warning" : undefined, children: e.text || undefined }))}
          />
        </Stack>
      ))}
    </Stack>
  )
}

function Part({ name, role, line, active, children }: { name: string; role: string; line: string; active?: boolean; children?: React.ReactNode }) {
  return (
    <Tile elevated={active} className={active ? "h-full gap-3 border-primary" : "h-full gap-3"}>
      <Inline justify="between"><Text variant="caption" tone="muted" className="tracking-widest uppercase">{role}</Text>{active && <Tag tone="brand" size="sm">this system</Tag>}</Inline>
      <Text variant="title-1">{name}</Text>
      <Text tone="muted">{line}</Text>
      {children}
    </Tile>
  )
}

export const aboutDemos: DemoMap = {
  "getting-started/changelog": [{ title: "Every change, newest first", render: () => <ChangelogTimeline /> }],
  "components/timeline": [
    {
      title: "Run history",
      description: "Neutral markers for ordinary events; a status tone only for the ones that matter.",
      render: () => (
        <Timeline
          label="Support triage — history"
          events={[
            { id: "1", date: "Today 09:40", title: "Deployed to production", tone: "success", children: "Version 14 · Vita Large" },
            { id: "2", date: "Today 09:12", title: "Instructions updated", children: "Refunds now go to the Finance team." },
            { id: "3", date: "Yesterday 17:05", title: "Evaluation failed", tone: "error", children: "3 of 40 test tickets answered wrongly." },
            { id: "4", date: "Monday 11:30", title: "Created by Ada Lovelace" },
          ]}
        />
      ),
    },
  ],
  "getting-started/about": [
    {
      title: "Mind, soul, body",
      render: () => (
        <Grid gutter="narrow">
          <Column sm={4} md={8} lg={5}><Part name="Animus" role="Mind" line="Backend logic that reasons and decides." /></Column>
          <Column sm={4} md={8} lg={5}><Part name="Anima" role="Soul" line="Purpose, character and the human experience." /></Column>
          <Column sm={4} md={8} lg={6}>
            <Part name="Corpus" role="Body" line="The visible form people touch, read and trust." active>
              <Stack gap="sm" className="pt-2">
                <TextInput label="Agent name" size="sm" defaultValue="Support triage" />
                <Inline justify="between"><StatusIndicator kind="success" size="sm">Live</StatusIndicator><Button size="sm">Deploy agent</Button></Inline>
              </Stack>
            </Part>
          </Column>
        </Grid>
      ),
    },
  ],
}
