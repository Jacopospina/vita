import type { DemoMap } from "./types"
import { Grid, Column, Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Tile } from "@/registry/ui/tile"
import { Button } from "@/registry/ui/button"
import { TextInput } from "@/registry/ui/text-input"
import { Tag } from "@/registry/ui/tag"
import { StatusIndicator } from "@/registry/ui/status-indicator"

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
  "foundations/about": [
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
