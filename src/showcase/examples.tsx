import * as React from "react"
import { Add, Filter, Download, TrashCan, Edit, UserAvatar, Bot, Plug, Notification, Security, Information, Chat, Send, Activity, UserMultiple, Time } from "@/registry/icons"
import { Stack, Inline, Grid, Column } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Tile } from "@/registry/ui/tile"
import { Button, IconButton, ButtonSet } from "@/registry/ui/button"
import { Composer } from "@/registry/ui/composer"
import { ProgressBar } from "@/registry/ui/progress-bar"
import { AnimatedNumber } from "@/registry/ui/animated"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { ListGroup, ListItem, ListSection } from "@/registry/ui/list-item"
import { Toggle } from "@/registry/ui/toggle"
import { Calendar } from "@/registry/ui/date-picker"
import { AISurface, AILabel } from "@/registry/ui/ai-label"
import { ChatThread, type ChatMessage } from "@/registry/ui/chat"
import { Tag, SelectableTag } from "@/registry/ui/tag"
import { DataTable, type DataTableColumn } from "@/registry/ui/data-table"
import { Search } from "@/registry/ui/search"
import { Pagination } from "@/registry/ui/pagination"
import { OverflowMenu } from "@/registry/ui/menu-button"
import { MenuItem, MenuSeparator } from "@/registry/ui/menu"
import { EmptyState } from "@/registry/ui/empty-state"
import { PageHeader } from "@/registry/ui/page-header"
import { ContainedList, ContainedListItem } from "@/registry/ui/contained-list"
import { LoginBlock } from "@/registry/blocks/login"
import { toast, capsule } from "@/registry/ui/notification"
import { Icon } from "@/registry/ui/icon"
import { Kpi, KpiGroup } from "@/registry/ui/kpi"
import { MiniGauge, MiniLevels, MiniStat, MiniDial } from "@/registry/ui/mini-chart"
import { agents, agentColumns } from "@/playground/demos/data"

/*
 * Live example screens for the showcase. Everything is real Vita, the same components a product ships.
 * The product in every example is Theo, a platform that deploys custom AI agents.
 */

/* ---------------- Cards ---------------- */

function Metric({ label, value, delta, children }: { label: string; value: number; delta: string; children?: React.ReactNode }) {
  return (
    <Tile className="h-full">
      <Stack gap="xs">
        <Text variant="footnote" tone="muted">{label}</Text>
        <Text variant="large-title"><AnimatedNumber value={value} /></Text>
        <Text variant="footnote" tone="muted">{delta}</Text>
        {children}
      </Stack>
    </Tile>
  )
}

export function CardsExample() {
  const [runs, setRuns] = React.useState(12840)
  React.useEffect(() => {
    const t = window.setInterval(() => setRuns((r) => r + 3 + Math.round(Math.random() * 9)), 2400)
    return () => window.clearInterval(t)
  }, [])
  const [day, setDay] = React.useState<Date | undefined>(new Date())
  // The live tile breathes with the runs: confidence, load and hand-offs drift as work comes in.
  const confidence = 86 + (runs % 9)
  const load = runs % 7
  const handoffs = 12 + Math.floor((runs - 12840) / 40)
  return (
    <Grid>
      <Column md={8} lg={10}>
        <Tile className="h-full">
          <Stack gap="md">
            <Stack gap="2xs">
              <Text variant="title-3">Create an agent</Text>
              <Text tone="muted">Describe what it should do. Theo drafts the rest for you to review.</Text>
            </Stack>
            <Composer suggestions={["Triage support tickets", "Summarise sales calls", "Answer HR policy questions"]} onSubmit={() => capsule({ icon: <Icon as={Bot} size="md" />, title: "Drafting your agent", subtitle: "Support triage", story: { status: "success" } })} />
          </Stack>
        </Tile>
      </Column>
      <Column md={4} lg={6}>
        <Metric label="Runs today" value={runs} delta="+12% from yesterday">
          <ProgressBar label="Daily quota" hideLabel value={64} size="sm" />
        </Metric>
      </Column>
      {/* Agents and Team share one column, one under the other, so the next column can show something else. */}
      <Column md={4} lg={5}>
        <Stack gap="md" className="h-full">
        <Tile>
          <Stack gap="sm">
            <Text variant="title-3">Agents</Text>
            <StatusIndicator kind="success">Support triage · Live</StatusIndicator>
            <StatusIndicator kind="in-progress">Invoice extractor · Deploying</StatusIndicator>
            <StatusIndicator kind="warning">Ticket router · Degraded</StatusIndicator>
          </Stack>
        </Tile>
        <Tile className="flex-1">
          <Stack gap="sm">
            <Text variant="title-3">Team</Text>
            <ListGroup>
              <ListItem icon={UserAvatar} tone="brand" title="Ada Lovelace" subtitle="ada@theo.ai" trailing={<Tag size="sm">Owner</Tag>} />
              <ListItem icon={UserAvatar} tone="brand" title="Grace Hopper" subtitle="grace@theo.ai" trailing={<Tag size="sm">Editor</Tag>} />
            </ListGroup>
          </Stack>
        </Tile>
        </Stack>
      </Column>
      <Column md={4} lg={5}>
        <Tile className="h-full">
          <Stack gap="md" className="h-full">
            <Stack gap="2xs">
              <Text variant="title-3">Support triage, live</Text>
              <Text tone="muted">One value each, at a glance.</Text>
            </Stack>
            {/* The four fill the tile's height, the space around them shared out evenly in both directions. */}
            <div className="grid flex-1 grid-cols-[auto_auto] place-content-evenly place-items-center">
              <MiniGauge label={`Answer confidence ${confidence} percent`} value={confidence / 100} fill="success" display={`${confidence}%`} />
              <MiniLevels label={`Load step ${load + 1} of 7`} icon={Activity} levels={7} active={load} display={["Idle", "Light", "Light", "Busy", "Busy", "Heavy", "Peak"][load]} />
              <MiniStat label={`${handoffs} hand-offs today`} icon={UserMultiple} tone="info" value={String(handoffs)} caption="hand-offs" />
              <MiniDial label="Next run at 15:07" icon={Time} display="15:07" offset={load} />
            </div>
          </Stack>
        </Tile>
      </Column>
      <Column md={8} lg={6}>
        <Tile className="h-full">
          <Stack gap="sm">
            <Text variant="title-3">Schedule a review</Text>
            <Calendar mode="single" selected={day} onSelect={setDay} />
          </Stack>
        </Tile>
      </Column>
      <Column md={4} lg={8}>
        <AISurface>
          <Stack gap="sm">
            <Inline gap="xs"><AILabel size="sm">Drafted by Support triage from the help center article "Refunds".</AILabel><Text variant="title-3">Suggested reply</Text></Inline>
            <Text tone="muted">Hi Sam, your refund for order 4821 was approved today. It should reach your card within 3–5 working days.</Text>
            <ButtonSet>
              <Button variant="secondary">Regenerate</Button>
              <Button onAction={() => new Promise((r) => setTimeout(r, 900))} feedback={{ loading: "Sending", success: "Sent" }}>Use reply</Button>
            </ButtonSet>
          </Stack>
        </AISurface>
      </Column>
      <Column md={4} lg={8}>
        <Tile className="h-full">
          <Stack gap="sm">
            <Text variant="title-3">Notifications</Text>
            <ListGroup>
              <ListItem icon={Notification} tone="brand" title="Hand-offs" subtitle="When an agent escalates to a person" trailing={<Toggle size="sm" hideLabel label="Hand-offs" defaultChecked />} />
              <ListItem icon={Bot} tone="brand" title="Deployments" subtitle="When an agent goes live" trailing={<Toggle size="sm" hideLabel label="Deployments" defaultChecked />} />
              <ListItem icon={Security} tone="brand" title="Policy alerts" subtitle="When a run breaks a rule" trailing={<Toggle size="sm" hideLabel label="Policy alerts" />} />
            </ListGroup>
          </Stack>
        </Tile>
      </Column>
    </Grid>
  )
}

/* ---------------- Agents (dashboard) ---------------- */

export function AgentsExample() {
  const [page, setPage] = React.useState(1)
  const [size, setSize] = React.useState(10)
  const [q, setQ] = React.useState("")
  const filtered = agents.filter((s) => (s.name + s.team + s.model).toLowerCase().includes(q.toLowerCase()))
  return (
    <Stack gap="lg">
      <PageHeader title="Agents" description="Every agent deployed in the Theo workspace." actions={<Button icon={Add} onClick={() => toast({ icon: Bot, source: "Theo", title: "Agent created", subtitle: "Untitled agent is ready to configure." })}>Create agent</Button>} />
      {/* One meaning, one surface: the workspace's numbers sit together, divided by hairlines, never as separate cards. */}
      <KpiGroup>
        <Kpi label="Live agents" value={agents.filter((a) => a.status === "Live").length} helperText="2 deployed this week" />
        <Kpi label="Runs (24h)" value={agents.reduce((n, a) => n + a.runs, 0)} delta={0.08} period="vs last week" />
        <Kpi label="Resolution rate" value={0.94} format={{ style: "percent" }} helperText="Handled without a person" />
        <Kpi label="Hand-offs" value={37} helperText="12 waiting for a reply" />
      </KpiGroup>
      <DataTable
        title="All agents"
        columns={agentColumns}
        rows={filtered.slice((page - 1) * size, page * size)}
        selectable
        batchActions={() => (<><Button icon={Download}>Export</Button><Button icon={TrashCan}>Delete</Button></>)}
        toolbar={<><Search variant="toolbar" size="md" placeholder="Search agents" value={q} onValueChange={(v) => { setQ(v); setPage(1) }} /><IconButton icon={Filter} label="Filter" /></>}
        rowActions={() => (
          <OverflowMenu>
            <MenuItem icon={Edit}>Edit</MenuItem>
            <MenuItem icon={Download}>Export config</MenuItem>
            <MenuSeparator />
            <MenuItem icon={TrashCan} danger>Delete agent</MenuItem>
          </OverflowMenu>
        )}
        emptyState={<EmptyState title="No agents match" description="Try a different agent name or team." action={<Button variant="tertiary" onClick={() => setQ("")}>Clear search</Button>} />}
        footer={<Pagination page={page} pageSize={size} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setSize(s); setPage(1) }} itemLabel="agents" />}
      />
    </Stack>
  )
}

/* ---------------- Runs ---------------- */

interface Run {
  id: string
  agent: string
  trigger: string
  status: "success" | "in-progress" | "error" | "pending" | "queued"
  duration: number
}
const statusLabel = { success: "Completed", "in-progress": "Running", error: "Failed", pending: "Awaiting approval", queued: "Queued" } as const
const runs: Run[] = Array.from({ length: 24 }, (_, i) => ({
  id: String(i + 1),
  agent: agents[i % agents.length].name,
  trigger: ["Zendesk ticket", "Slack message", "Schedule", "Email", "API call"][i % 5],
  status: (["success", "in-progress", "success", "error", "pending", "success", "queued"] as const)[i % 7],
  duration: 2 + ((i * 37) % 58),
}))
const runColumns: DataTableColumn<Run>[] = [
  { key: "agent", header: "Agent", sortable: true },
  { key: "trigger", header: "Trigger" },
  { key: "status", header: "Status", sortable: true, cell: (r) => <StatusIndicator kind={r.status} size="sm">{statusLabel[r.status]}</StatusIndicator> },
  { key: "duration", header: "Duration", sortable: true, align: "end", cell: (r) => `${r.duration}s` },
]

export function RunsExample() {
  const [only, setOnly] = React.useState<Run["status"] | null>(null)
  const rows = only ? runs.filter((r) => r.status === only) : runs
  return (
    <DataTable
      title="Runs"
      description="What every agent did today."
      columns={runColumns}
      rows={rows}
      toolbar={
        <>
          <Search variant="toolbar" size="md" placeholder="Search runs" />
          <Inline gap="xs">
            {(["error", "pending", "in-progress"] as const).map((s) => (
              <SelectableTag key={s} selected={only === s} onSelectedChange={(on) => setOnly(on ? s : null)}>{statusLabel[s]}</SelectableTag>
            ))}
          </Inline>
        </>
      }
    />
  )
}

/* ---------------- Conversations ---------------- */

const conversations = [
  { id: "c1", who: "Sam Rivera", topic: "Refund for order 4821", agent: "Support triage" },
  { id: "c2", who: "Priya Shah", topic: "Can I change my plan mid-cycle?", agent: "Support triage" },
  { id: "c3", who: "Leo Martin", topic: "Invoice INV-2207 looks wrong", agent: "Invoice extractor" },
  { id: "c4", who: "Mia Chen", topic: "Parental leave policy", agent: "HR policy assistant" },
]

export function ConversationsExample() {
  const [open, setOpen] = React.useState("c1")
  const c = conversations.find((x) => x.id === open) ?? conversations[0]
  const first = c.who.split(" ")[0]
  // Operator's view: the customer on the left; your side (the Theo agent, then you) on the right.
  const [sent, setSent] = React.useState<Record<string, ChatMessage[]>>({})
  const messages: ChatMessage[] = [
    { id: `${c.id}-1`, role: "agent", author: c.who, text: "Hi, I'm waiting on this, can you help?", time: "09:12" },
    {
      id: `${c.id}-2`,
      role: "user",
      author: c.agent,
      time: "09:12",
      text: (
        <Stack gap="xs">
          <span>I've checked your account. Everything is in order, you'll get an update by email within one working day.</span>
          <AILabel size="xs">Answered from the Theo help center.</AILabel>
        </Stack>
      ),
    },
    ...(sent[c.id] ?? []),
  ]
  return (
    <Grid>
      <Column md={8} lg={6}>
        <ContainedList label="Conversations">
          {conversations.map((x) => (
            <ContainedListItem key={x.id} icon={Chat} tone={x.id === open ? "brand" : "neutral"} subtitle={x.topic} selected={x.id === open} onClick={() => setOpen(x.id)}>
              {x.who}
            </ContainedListItem>
          ))}
        </ContainedList>
      </Column>
      <Column md={8} lg={10}>
        <Stack gap="md" key={c.id} className="stagger">
          <Stack gap="2xs">
            <Text variant="title-3">{c.topic}</Text>
            <Text variant="footnote" tone="muted">{c.who} · handled by {c.agent}</Text>
          </Stack>
          <ChatThread messages={messages} />
          <Composer
            size="md"
            voice={false}
            placeholder={`Reply to ${first}`}
            onSubmit={(text: string) => {
              if (!text.trim()) return
              setSent((all) => ({ ...all, [c.id]: [...(all[c.id] ?? []), { id: `${c.id}-r${(all[c.id]?.length ?? 0) + 1}`, role: "user", author: "You", text, time: "now" }] }))
              capsule({ icon: <Icon as={Send} size="md" />, title: "Reply sent", subtitle: c.who, story: { status: "success" } })
            }}
          />
        </Stack>
      </Column>
    </Grid>
  )
}

/* ---------------- Settings ---------------- */

export function SettingsExample() {
  return (
    <Stack gap="lg" className="mx-auto w-full max-w-xl">
      <ListSection title="Workspace">
        <ListGroup>
          <ListItem icon={Information} title="Name" value="Theo" onClick={() => {}} />
          <ListItem icon={Bot} tone="brand" title="Default model" value="Theo Large" onClick={() => {}} />
          <ListItem icon={Security} tone="brand" title="Security & access" onClick={() => {}} />
        </ListGroup>
      </ListSection>
      <ListSection title="Integrations" description="Tools your agents can use.">
        <ListGroup>
          <ListItem icon={Plug} tone="brand" title="Slack" subtitle="Connected as #support" trailing={<Button size="sm" variant="secondary">Manage</Button>} />
          <ListItem icon={Plug} tone="brand" title="Zendesk" subtitle="Connected" trailing={<Button size="sm" variant="secondary">Manage</Button>} />
          <ListItem icon={Plug} title="Salesforce" subtitle="Not connected" trailing={<Button size="sm">Connect</Button>} />
        </ListGroup>
      </ListSection>
    </Stack>
  )
}

/* ---------------- Sign in ---------------- */

export function SignInExample() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <LoginBlock productName="Theo" onSubmit={() => new Promise((r) => setTimeout(r, 900))} onSso={() => {}} />
    </div>
  )
}
