import * as React from "react"
import { Add, Document, Folder, TrashCan, Download, Edit, UserAvatar, Filter, CheckmarkFilled, ErrorFilled, InProgress, PauseFilled, Renew } from "@/registry/icons"
import { Report } from "@/registry/pictograms"
import type { DemoMap } from "./types"
import { Kpi, KpiGroup } from "@/registry/ui/kpi"
import { MiniSegments, MiniStat, MiniGauge, MiniBadge, MiniRange, MiniArc, MiniMedia, MiniLevels, MiniColor, MiniGlow, MiniDial, miniGradients } from "@/registry/ui/mini-chart"
import { Humidity, FlashFilled, Temperature, Hurricane, TemperatureHot, Music, Snowflake, Idea, Sprout, Automatic } from "@/registry/icons"
import { Stack, Inline, Grid, Column } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Icon } from "@/registry/ui/icon"
import { Button, IconButton } from "@/registry/ui/button"
import { DataTable, type DataTableColumn } from "@/registry/ui/data-table"
import { Pagination } from "@/registry/ui/pagination"
import { Search } from "@/registry/ui/search"
import { Tag, SelectableTag, OperationalTag } from "@/registry/ui/tag"
import { OverflowMenu } from "@/registry/ui/menu-button"
import { MenuItem, MenuSeparator } from "@/registry/ui/menu"
import { StructuredList } from "@/registry/ui/structured-list"
import { ContainedList, ContainedListItem } from "@/registry/ui/contained-list"
import { UnorderedList, OrderedList, ListItem } from "@/registry/ui/list"
import { TreeView } from "@/registry/ui/tree-view"
import { Tile, ClickableTile, SelectableTile, ExpandableTile, TileGroup } from "@/registry/ui/tile"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/registry/ui/accordion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/ui/tabs"
import { Popover, PopoverTrigger, PopoverContent } from "@/registry/ui/popover"
import { EmptyState } from "@/registry/ui/empty-state"

export interface Agent {
  id: string
  ref: string
  name: string
  team: string
  model: string
  status: "Live" | "Deploying" | "Degraded" | "Paused"
  runs: number
}

const agentNames = ["Support triage", "Invoice extractor", "Sales researcher", "Onboarding guide", "Contract reviewer", "Meeting summariser", "Churn watcher", "Hiring screener", "Ticket router", "Report writer", "Knowledge curator", "Lead qualifier", "Policy checker", "Expense auditor"]

export const agents: Agent[] = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  ref: `AGT-${String(1040 + i)}`,
  name: agentNames[i % agentNames.length] + (i >= agentNames.length ? ` ${Math.floor(i / agentNames.length) + 1}` : ""),
  team: ["Support", "Finance", "Sales", "People", "Legal", "Operations"][i % 6],
  model: ["Theo Large", "Theo Fast", "Theo Vision", "Theo Voice"][i % 4],
  status: (["Live", "Deploying", "Degraded", "Paused", "Live"] as const)[i % 5],
  runs: 120 + ((i * 7919) % 9000),
}))

export function StatusTag({ status }: { status: Agent["status"] }) {
  const map = {
    Live: { tone: "success", icon: CheckmarkFilled },
    Deploying: { tone: "info", icon: InProgress },
    Degraded: { tone: "error", icon: ErrorFilled },
    Paused: { tone: "error", icon: PauseFilled },
  } as const
  return <Tag tone={map[status].tone} icon={map[status].icon}>{status}</Tag>
}

export const agentColumns: DataTableColumn<Agent>[] = [
  { key: "name", header: "Agent", sortable: true },
  { key: "team", header: "Team", sortable: true },
  { key: "model", header: "Model" },
  { key: "status", header: "Status", sortable: true, cell: (r) => <StatusTag status={r.status} /> },
  { key: "runs", header: "Runs (24h)", sortable: true, align: "end", cell: (r) => r.runs.toLocaleString("en-GB") },
]

function TableDemo() {
  const [page, setPage] = React.useState(1)
  const [size, setSize] = React.useState(10)
  const [q, setQ] = React.useState("")
  const filtered = agents.filter((s) => (s.ref + s.name + s.team + s.model).toLowerCase().includes(q.toLowerCase()))
  return (
    <DataTable
      title="Agents"
      description="Every agent deployed in this workspace."
      columns={agentColumns}
      rows={filtered.slice((page - 1) * size, page * size)}
      selectable
      batchActions={() => (<><Button icon={Download}>Export</Button><Button icon={TrashCan}>Delete</Button></>)}
      toolbar={<><Search variant="toolbar" size="md" placeholder="Search agents" value={q} onValueChange={(v) => { setQ(v); setPage(1) }} /><IconButton icon={Filter} label="Filter" /><Button icon={Add}>Create agent</Button></>}
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
  )
}

function TileDemo() {
  const [plan, setPlan] = React.useState("team")
  const [addons, setAddons] = React.useState<string[]>(["sso"])
  return (
    <Stack gap="xl">
      <Grid gutter="narrow">
        <Column sm={4} md={4} lg={5}><Tile><Text variant="headline">Base tile</Text><Text tone="muted">Static container for grouped content.</Text></Tile></Column>
        <Column sm={4} md={4} lg={5}><Tile elevated><Text variant="headline">Elevated tile</Text><Text tone="muted">Raised surface with border and shadow.</Text></Tile></Column>
        <Column sm={4} md={4} lg={6}><ClickableTile href="#/components/tile"><Text variant="headline">Clickable tile</Text><Text tone="muted">The whole tile is one link.</Text></ClickableTile></Column>
      </Grid>
      <TileGroup label="Plan">
        {[["starter", "Starter", "3 agents, staging only"], ["team", "Team", "25 agents, production"], ["enterprise", "Enterprise", "Unlimited agents, SSO, audit log"]].map(([v, t, d]) => (
          <SelectableTile key={v} mode="single" selected={plan === v} onSelectedChange={() => setPlan(v)}>
            <Text variant="headline">{t}</Text><Text tone="muted">{d}</Text>
          </SelectableTile>
        ))}
      </TileGroup>
      <TileGroup label="Add-ons" mode="multi">
        {[["sso", "Single sign-on"], ["audit", "Audit log"], ["api", "API access"]].map(([v, t]) => (
          <SelectableTile key={v} selected={addons.includes(v)} onSelectedChange={(s) => setAddons((a) => (s ? [...a, v] : a.filter((x) => x !== v)))}>
            <Text variant="headline">{t}</Text>
          </SelectableTile>
        ))}
      </TileGroup>
      <ExpandableTile summary={<Stack gap="3xs"><Text variant="headline">Support triage</Text><Text tone="muted">Production · Live · 1,284 runs today</Text></Stack>}>
        <Text tone="muted">Model: Theo Large · Tools: Zendesk, Slack · Knowledge: Help center (412 articles). Last deployed today at 09:12.</Text>
      </ExpandableTile>
    </Stack>
  )
}

function TagDemo() {
  const [filters, setFilters] = React.useState(["Production", "Slack", "Degraded"])
  const [sel, setSel] = React.useState<string[]>(["EU"])
  return (
    <Stack gap="lg">
      <Inline wrap gap="xs">{(["neutral", "brand", "success", "warning", "error", "info", "outline", "inverse"] as const).map((t) => <Tag key={t} tone={t}>{t}</Tag>)}</Inline>
      <Inline wrap gap="xs"><Tag size="sm">Small</Tag><Tag>Medium</Tag><Tag size="lg">Large</Tag><Tag icon={Document}>With icon</Tag></Inline>
      <Inline wrap gap="xs"><Text tone="muted">Applied:</Text>{filters.map((f) => <Tag key={f} tone="outline" onDismiss={() => setFilters((x) => x.filter((y) => y !== f))}>{f}</Tag>)}<Tag tone="outline" disabled onDismiss={() => {}}>Locked by admin</Tag></Inline>
      <Inline wrap gap="xs" role="group" aria-label="Region">{["EU", "UK", "US", "APAC"].map((r) => <SelectableTag key={r} selected={sel.includes(r)} onSelectedChange={(s) => setSel((x) => (s ? [...x, r] : x.filter((y) => y !== r)))}>{r}</SelectableTag>)}</Inline>
      <Inline gap="xs"><Tag>Slack</Tag><Popover><PopoverTrigger asChild><OperationalTag>+3</OperationalTag></PopoverTrigger><PopoverContent className="w-48"><Stack gap="2xs"><Tag>Gmail</Tag><Tag>Notion</Tag><Tag>Salesforce</Tag></Stack></PopoverContent></Popover></Inline>
    </Stack>
  )
}

function KpiLoadingDemo() {
  const [loading, setLoading] = React.useState(false)
  const reload = () => { setLoading(true); window.setTimeout(() => setLoading(false), 2200) }
  return (
    <Stack gap="md">
      <KpiGroup>
        <Kpi label="Runs today" value={12840} delta={0.12} period="vs yesterday" loading={loading} />
        <Kpi label="Resolved" value={0.94} format={{ style: "percent" }} delta={0.02} period="vs last week" loading={loading} />
        <Kpi label="Cost" value={1240} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} delta={0.15} better="down" period="vs last month" loading={loading} />
      </KpiGroup>
      <Inline><Button variant="secondary" icon={Renew} onClick={reload} disabled={loading}>Reload</Button></Inline>
    </Stack>
  )
}

export const dataDemos: DemoMap = {
  "components/mini-chart": [
    {
      title: "The twelve mini charts",
      description: "Segments, stat, gauge, arc, media, range, levels, colour, glow and dial: one value each, at a glance.",
      render: () => <MiniChartGallery />,
    },
    {
      title: "Values glide",
      description: "Knobs travel along their arc, fills grow and numbers roll. Change the values to watch.",
      render: () => <MiniChartLive />,
    },
  ],
  "components/kpi": [
    {
      title: "A group of KPIs",
      description: "Related numbers belong together: one surface, dividers between them.",
      render: () => (
        <KpiGroup>
          <Kpi label="Runs today" value={12840} delta={0.12} period="vs yesterday" />
          <Kpi label="Resolved" value={0.94} format={{ style: "percent" }} delta={0.02} period="vs last week" />
          <Kpi label="Median reply" value={38} format={{ style: "unit", unit: "second", unitDisplay: "narrow" }} delta={-0.08} better="down" period="vs last week" />
          <Kpi label="Cost" value={1240} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} delta={0.15} better="down" period="vs last month" />
        </KpiGroup>
      ),
    },
    {
      title: "Trend: good, bad, flat",
      description: "Colour follows whether the change is good for the metric (better), the arrow its direction.",
      render: () => (
        <KpiGroup>
          <Kpi label="Runs (better up)" value={12840} delta={0.12} />
          <Kpi label="Errors (better down)" value={42} delta={0.3} better="down" />
          <Kpi label="Hand-offs" value={118} delta={0} period="vs last week" />
        </KpiGroup>
      ),
    },
    {
      title: "Sizes and states",
      render: () => (
        <Inline gap="2xl" align="start">
          <Kpi size="sm" label="Small" value={12840} delta={0.12} />
          <Kpi size="md" label="Medium" value={12840} delta={0.12} />
          <Kpi size="lg" label="Large" value={12840} delta={0.12} helperText="Across all agents" />
        </Inline>
      ),
    },
    {
      title: "Loading",
      description: "Press Reload: each value scrambles in its own type, blurred, then locks into the number. The trend line keeps its place.",
      render: () => <KpiLoadingDemo />,
    },
  ],
  "components/data-table": [
    { title: "Full data table", description: "Sortable columns, selection with batch actions, toolbar search, row overflow menu, pagination.", render: () => <TableDemo /> },
    { title: "Expandable rows, zebra, compact", render: () => <DataTable label="Compact" size="sm" zebra columns={agentColumns.slice(0, 4)} rows={agents.slice(0, 5)} renderExpanded={(r) => <Text tone="muted">{r.name} runs on {r.model} for the {r.team} team · {r.runs} runs in the last 24h.</Text>} /> },
    { title: "Loading & empty", render: () => <Stack gap="lg"><DataTable label="Loading" columns={agentColumns} rows={[]} loading /><DataTable label="Empty" columns={agentColumns} rows={[]} emptyState={<EmptyState pictogram={Report} title="No agents yet" description="Agents you create and deploy will appear here." action={<Button icon={Add}>Create agent</Button>} />} /></Stack> },
  ],
  "components/pagination": [
    {
      title: "Pagination",
      render: () => {
        const P = () => { const [p, setP] = React.useState(3); const [s, setS] = React.useState(25); return <Pagination page={p} pageSize={s} total={1240} onPageChange={setP} onPageSizeChange={setS} /> }
        return <P />
      },
    },
    {
      title: "Sizes, small, medium, large",
      description: "Match the table it pages: small under compact tables, large under spacious ones.",
      render: () => {
        const P = ({ size }: { size: "sm" | "md" | "lg" }) => { const [p, setP] = React.useState(2); return <Pagination size={size} page={p} pageSize={25} total={240} onPageChange={setP} /> }
        return <Stack gap="lg"><P size="sm" /><P size="md" /><P size="lg" /></Stack>
      },
    },
  ],
  "components/structured-list": [
    { title: "Read-only", render: () => <StructuredList label="Plan details" columns={["Feature", "Team", "Enterprise"]} rows={[{ id: "1", cells: ["Seats", "50", "Unlimited"] }, { id: "2", cells: ["SSO", "Not included", "Included"] }, { id: "3", cells: ["Support", "Email", "Dedicated manager"] }]} /> },
    { title: "Selectable", render: () => { const S = () => { const [v, setV] = React.useState("2"); return <StructuredList selectable value={v} onValueChange={setV} label="Choose a model" columns={["Model", "Latency", "Cost / 1k runs"]} rows={[{ id: "1", cells: ["Theo Large", "2.1 s", "$4.20"] }, { id: "2", cells: ["Theo Fast", "0.6 s", "$0.80"] }, { id: "3", cells: ["Theo Vision", "2.8 s", "$5.10"] }]} /> }; return <S /> } },
    { title: "Condensed & flush", render: () => <StructuredList condensed flush label="Details" columns={["Field", "Value"]} rows={[{ id: "1", cells: ["Agent ID", "AGT-1042"] }, { id: "2", cells: ["Environment", "Production"] }]} /> },
  ],
  "components/contained-list": [
    {
      title: "On-page and disclosed, with selected and disabled rows",
      render: () => (
        <Stack gap="xl" className="max-w-lg">
          <ContainedList label="Team members" action={<Button size="sm" variant="ghost" icon={Add}>Add member</Button>}>
            {[["Ada Lovelace", "Owner"], ["Grace Hopper", "Builder"], ["Alan Turing", "Viewer"]].map(([m, role]) => (
              <ContainedListItem key={m} icon={UserAvatar} tone="brand" subtitle={role} action={<OverflowMenu><MenuItem>Change role</MenuItem><MenuItem danger>Remove</MenuItem></OverflowMenu>}>{m}</ContainedListItem>
            ))}
          </ContainedList>
          <ContainedList label="Recent files" kind="disclosed">
            {["system-prompt.md", "help-center.csv", "refund-policy.pdf"].map((f, i) => <ContainedListItem key={f} icon={Document} onClick={() => {}} selected={i === 0} disabled={i === 2} subtitle={i === 2 ? "Uploading" : undefined}>{f}</ContainedListItem>)}
          </ContainedList>
        </Stack>
      ),
    },
  ],
  "components/list": [
    {
      title: "Unordered, ordered, nested",
      render: () => (
        <Inline gap="2xl" align="start" wrap>
          <UnorderedList><ListItem>Answers from your knowledge</ListItem><ListItem>Acts in your tools<UnorderedList nested><ListItem>Slack</ListItem><ListItem>Salesforce</ListItem></UnorderedList></ListItem><ListItem>Hands off to a human</ListItem></UnorderedList>
          <OrderedList><ListItem>Describe the agent</ListItem><ListItem>Connect tools<OrderedList nested><ListItem>Authorise</ListItem><ListItem>Choose actions</ListItem></OrderedList></ListItem><ListItem>Deploy</ListItem></OrderedList>
        </Inline>
      ),
    },
  ],
  "components/tree-view": [
    {
      title: "Tree view",
      render: () => {
        const T = () => {
          const [sel, setSel] = React.useState("q3")
          return (
            <div className="max-w-xs">
              <TreeView label="Files" selected={sel} onSelect={setSel} defaultExpanded={["ws", "reports"]} nodes={[
                { id: "ws", label: "Workspace", icon: Folder, children: [
                  { id: "reports", label: "Knowledge", icon: Folder, children: [{ id: "q2", label: "Help center", icon: Document }, { id: "q3", label: "Product docs", icon: Document }] },
                  { id: "contracts", label: "Policies", icon: Folder, children: [{ id: "refunds", label: "Refund policy", icon: Document }] },
                  { id: "archive", label: "Archive", icon: Folder, disabled: true },
                ] },
              ]} />
            </div>
          )
        }
        return <T />
      },
    },
    {
      title: "Extra small, for dense side panels",
      render: () => (
        <div className="max-w-xs">
          <TreeView label="Agents" size="xs" defaultExpanded={["support"]} nodes={[
            { id: "support", label: "Support", icon: Folder, children: [{ id: "triage", label: "Support triage", icon: Document }, { id: "refunds", label: "Refund assistant", icon: Document }] },
            { id: "sales", label: "Sales", icon: Folder, children: [{ id: "leads", label: "Lead qualifier", icon: Document }] },
          ]} />
        </div>
      ),
    },
  ],
  "components/tile": [{ title: "Tile variants", render: () => <TileDemo /> }],
  "components/tag": [{ title: "Tones, sizes, dismissible, selectable, operational", render: () => <TagDemo /> }],
  "components/accordion": [
    {
      title: "Default, start-aligned, sizes",
      render: () => (
        <Stack gap="xl">
          <Accordion type="single" collapsible defaultValue="a">
            <AccordionItem value="a"><AccordionTrigger>What can an agent access?</AccordionTrigger><AccordionContent>Only the tools and knowledge sources you connect, with the permissions you grant. Every action is logged.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>How are runs billed?</AccordionTrigger><AccordionContent>Per run, by model. Test runs in staging are free.</AccordionContent></AccordionItem>
            <AccordionItem value="c" disabled><AccordionTrigger>Can I bring my own model? (disabled)</AccordionTrigger><AccordionContent>Not available yet.</AccordionContent></AccordionItem>
          </Accordion>
          <Accordion type="multiple" align="start" size="sm">
            <AccordionItem value="a"><AccordionTrigger>Start-aligned, small</AccordionTrigger><AccordionContent>Chevron leads, better for nested settings and filter panels.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>Multiple can be open</AccordionTrigger><AccordionContent>type="multiple"</AccordionContent></AccordionItem>
          </Accordion>
        </Stack>
      ),
    },
  ],
  "components/tabs": [
    {
      title: "Pill (default), line & contained",
      description: "The default is a segmented track whose raised pill slides between tabs on a spring.",
      render: () => (
        <Stack gap="2xl">
          <Tabs defaultValue="overview">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="x" disabled>Billing</TabsTrigger></TabsList>
            <TabsContent value="overview"><Text tone="muted">Overview content</Text></TabsContent>
            <TabsContent value="activity"><Text tone="muted">Activity content</Text></TabsContent>
            <TabsContent value="settings"><Text tone="muted">Settings content</Text></TabsContent>
          </Tabs>
          <Tabs defaultValue="overview">
            <TabsList variant="line"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="x" disabled>Billing</TabsTrigger></TabsList>
            <TabsContent value="overview"><Text tone="muted">Overview content</Text></TabsContent>
            <TabsContent value="activity"><Text tone="muted">Activity content</Text></TabsContent>
            <TabsContent value="settings"><Text tone="muted">Settings content</Text></TabsContent>
          </Tabs>
          <Tabs defaultValue="a">
            <TabsList variant="contained"><TabsTrigger value="a">Tools</TabsTrigger><TabsTrigger value="b">Knowledge</TabsTrigger><TabsTrigger value="c">Guardrails</TabsTrigger></TabsList>
            <TabsContent value="a" className="rounded-b-md bg-layer-1 p-4">Connected tools</TabsContent>
            <TabsContent value="b" className="rounded-b-md bg-layer-1 p-4">Knowledge sources</TabsContent>
            <TabsContent value="c" className="rounded-b-md bg-layer-1 p-4">Guardrails</TabsContent>
          </Tabs>
        </Stack>
      ),
    },
  ],
}

/** The twelve, in the order of a device dashboard: four across, three rows. */
function MiniChartGallery({ hot = false }: { hot?: boolean }) {
  return (
    <div className="grid w-fit grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
      <MiniSegments label="Water tank two thirds full, refills at 15:07" icon={Humidity} filled={2} value="15:07" />
      <MiniStat label="Quick wash" icon={FlashFilled} tone="success" caption="QW" />
      <MiniGauge label={`Water temperature ${hot ? 60 : 40} degrees`} icon={Temperature} value={hot ? 0.78 : 0.62} fill={miniGradients.heat} display={hot ? "60°" : "40°"} />
      <MiniStat label={`Spin speed ${hot ? 1200 : 800} rpm`} icon={Hurricane} tone="info" value={hot ? "1200" : "800"} caption="rpm" />
      <MiniGauge label={`Fan at ${hot ? 40 : 15} percent, automatic`} value={hot ? 0.4 : 0.6} fill="success" display={hot ? "40%" : "15%"} footer={<MiniBadge icon={Automatic} label="Automatic" />} />
      <MiniArc label={`Seat heating ${hot ? 52 : 47} degrees`} value={hot ? 0.8 : 0.62} icon={TemperatureHot} display={hot ? "52°" : "47°"} />
      <MiniMedia label="Now playing, a third of the way through" cover={<span className="flex items-center justify-center bg-primary-subtle text-primary"><Icon as={Music} className="size-6" /></span>} progress={hot ? 0.7 : 0.3} badge={Music} />
      <MiniRange label={`Thermostat set to ${hot ? 26 : 23}, between 16 and 30`} icon={Snowflake} value={hot ? 0.71 : 0.5} min="16" max="30" display={hot ? "26" : "23"} />
      <MiniLevels label={`Energy tariff step ${hot ? 3 : 7} of 9, 8 kilowatt hours`} icon={FlashFilled} active={hot ? 2 : 6} display={hot ? "5kwh" : "8kwh"} />
      <MiniColor label="Light colour and brightness" icon={Idea} hue={hot ? 0.1 : 0.7} brightness={hot ? 0.4 : 0.85} />
      <MiniGlow label={`Eco mode, ${hot ? 19 : 17} degrees, cool`} icon={Sprout} display={hot ? "19°" : "17°"} caption="Cool" />
      <MiniDial label="Charging finishes at 15:07" icon={FlashFilled} display={hot ? "16:30" : "15:07"} offset={hot ? 0.4 : 0} />
    </div>
  )
}

function MiniChartLive() {
  const [hot, setHot] = React.useState(false)
  return (
    <Stack gap="lg" align="start">
      <MiniChartGallery hot={hot} />
      <Button variant="secondary" size="sm" onClick={() => setHot((h) => !h)}>Change values</Button>
    </Stack>
  )
}
