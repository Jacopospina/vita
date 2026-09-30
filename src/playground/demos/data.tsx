import * as React from "react"
import { Add, Document, Folder, TrashCan, Download, Edit, UserAvatar, Filter, CheckmarkFilled, WarningAltFilled, ErrorFilled, InProgress } from "@/registry/icons"
import { Report } from "@/registry/pictograms"
import type { DemoMap } from "./types"
import { Stack, Inline, Grid, Column } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
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
import { Icon } from "@/registry/ui/icon"
import { EmptyState } from "@/registry/ui/empty-state"

export interface Shipment {
  id: string
  ref: string
  customer: string
  lane: string
  status: "Delivered" | "In transit" | "Delayed" | "Cancelled"
  value: number
}

export const shipments: Shipment[] = Array.from({ length: 42 }, (_, i) => ({
  id: String(i + 1),
  ref: `SHP-${String(1040 + i)}`,
  customer: ["Acme GmbH", "Northwind", "Globex", "Initech", "Umbrella", "Hooli"][i % 6],
  lane: ["Rotterdam → Milan", "Hamburg → Lyon", "Antwerp → Madrid", "Gdańsk → Vienna"][i % 4],
  status: (["Delivered", "In transit", "Delayed", "Cancelled", "In transit"] as const)[i % 5],
  value: 1200 + ((i * 7919) % 9000),
}))

export function StatusTag({ status }: { status: Shipment["status"] }) {
  const map = {
    Delivered: { tone: "success", icon: CheckmarkFilled },
    "In transit": { tone: "info", icon: InProgress },
    Delayed: { tone: "warning", icon: WarningAltFilled },
    Cancelled: { tone: "neutral", icon: ErrorFilled },
  } as const
  return <Tag tone={map[status].tone} icon={map[status].icon}>{status}</Tag>
}

export const shipmentColumns: DataTableColumn<Shipment>[] = [
  { key: "ref", header: "Reference", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  { key: "lane", header: "Lane" },
  { key: "status", header: "Status", sortable: true, cell: (r) => <StatusTag status={r.status} /> },
  { key: "value", header: "Value", sortable: true, align: "end", cell: (r) => `€${r.value.toLocaleString("en-GB")}` },
]

function TableDemo() {
  const [page, setPage] = React.useState(1)
  const [size, setSize] = React.useState(10)
  const [q, setQ] = React.useState("")
  const filtered = shipments.filter((s) => (s.ref + s.customer + s.lane).toLowerCase().includes(q.toLowerCase()))
  return (
    <DataTable
      title="Shipments"
      description="All shipments booked in the last 30 days."
      columns={shipmentColumns}
      rows={filtered.slice((page - 1) * size, page * size)}
      selectable
      batchActions={() => (<><Button icon={Download}>Export</Button><Button icon={TrashCan}>Delete</Button></>)}
      toolbar={<><div className="w-64"><Search variant="toolbar" size="lg" placeholder="Search shipments" value={q} onValueChange={(v) => { setQ(v); setPage(1) }} /></div><IconButton icon={Filter} label="Filter" size="lg" /><Button size="lg" icon={Add}>New shipment</Button></>}
      rowActions={() => (
        <OverflowMenu>
          <MenuItem icon={Edit}>Edit</MenuItem>
          <MenuItem icon={Download}>Download label</MenuItem>
          <MenuSeparator />
          <MenuItem icon={TrashCan} danger>Cancel shipment</MenuItem>
        </OverflowMenu>
      )}
      emptyState={<EmptyState title="No shipments match" description="Try a different reference or customer name." action={<Button variant="tertiary" onClick={() => setQ("")}>Clear search</Button>} />}
      footer={<Pagination page={page} pageSize={size} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setSize(s); setPage(1) }} itemLabel="shipments" />}
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
        {[["starter", "Starter", "Up to 3 people"], ["team", "Team", "Up to 50 people"], ["enterprise", "Enterprise", "Unlimited, SSO, audit"]].map(([v, t, d]) => (
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
      <ExpandableTile summary={<Stack gap="3xs"><Text variant="headline">Shipment SHP-1042</Text><Text tone="muted">Rotterdam → Milan · In transit</Text></Stack>}>
        <Text tone="muted">Carrier: DHL Freight · 12 pallets · ETA Thursday 14:00. Customs cleared at 09:12.</Text>
      </ExpandableTile>
    </Stack>
  )
}

function TagDemo() {
  const [filters, setFilters] = React.useState(["Road", "Sea", "Delayed"])
  const [sel, setSel] = React.useState<string[]>(["EU"])
  return (
    <Stack gap="lg">
      <Inline wrap gap="xs">{(["neutral", "brand", "success", "warning", "error", "info", "outline", "inverse"] as const).map((t) => <Tag key={t} tone={t}>{t}</Tag>)}</Inline>
      <Inline wrap gap="xs"><Tag size="sm">Small</Tag><Tag>Medium</Tag><Tag size="lg">Large</Tag><Tag icon={Document}>With icon</Tag></Inline>
      <Inline wrap gap="xs"><Text tone="muted">Applied:</Text>{filters.map((f) => <Tag key={f} tone="outline" onDismiss={() => setFilters((x) => x.filter((y) => y !== f))}>{f}</Tag>)}</Inline>
      <Inline wrap gap="xs" role="group" aria-label="Region">{["EU", "UK", "US", "APAC"].map((r) => <SelectableTag key={r} selected={sel.includes(r)} onSelectedChange={(s) => setSel((x) => (s ? [...x, r] : x.filter((y) => y !== r)))}>{r}</SelectableTag>)}</Inline>
      <Inline gap="xs"><Tag>Road</Tag><Popover><PopoverTrigger asChild><OperationalTag>+3</OperationalTag></PopoverTrigger><PopoverContent className="w-48"><Stack gap="2xs"><Tag>Sea</Tag><Tag>Air</Tag><Tag>Rail</Tag></Stack></PopoverContent></Popover></Inline>
    </Stack>
  )
}

export const dataDemos: DemoMap = {
  "components/data-table": [
    { title: "Full data table", description: "Sortable columns, selection with batch actions, toolbar search, row overflow menu, pagination.", render: () => <TableDemo /> },
    { title: "Expandable rows, zebra, compact", render: () => <DataTable label="Compact" size="sm" zebra columns={shipmentColumns.slice(0, 4)} rows={shipments.slice(0, 5)} renderExpanded={(r) => <Text tone="muted">Lane {r.lane}. Booked by ops team. Value €{r.value}.</Text>} /> },
    { title: "Loading & empty", render: () => <Stack gap="lg"><DataTable label="Loading" columns={shipmentColumns} rows={[]} loading /><DataTable label="Empty" columns={shipmentColumns} rows={[]} emptyState={<EmptyState pictogram={Report} title="No shipments yet" description="Shipments you book will appear here." action={<Button icon={Add}>Book a shipment</Button>} />} /></Stack> },
  ],
  "components/pagination": [
    {
      title: "Pagination",
      render: () => {
        const P = () => { const [p, setP] = React.useState(3); const [s, setS] = React.useState(25); return <Pagination page={p} pageSize={s} total={1240} onPageChange={setP} onPageSizeChange={setS} /> }
        return <P />
      },
    },
  ],
  "components/structured-list": [
    { title: "Read-only", render: () => <StructuredList label="Plan details" columns={["Feature", "Team", "Enterprise"]} rows={[{ id: "1", cells: ["Seats", "50", "Unlimited"] }, { id: "2", cells: ["SSO", "—", "Included"] }, { id: "3", cells: ["Support", "Email", "Dedicated manager"] }]} /> },
    { title: "Selectable", render: () => { const S = () => { const [v, setV] = React.useState("2"); return <StructuredList selectable value={v} onValueChange={setV} label="Choose a carrier" columns={["Carrier", "Transit", "Price"]} rows={[{ id: "1", cells: ["DHL Freight", "3 days", "€820"] }, { id: "2", cells: ["DB Schenker", "4 days", "€760"] }, { id: "3", cells: ["Kuehne+Nagel", "2 days", "€940"] }]} /> }; return <S /> } },
    { title: "Condensed & flush", render: () => <StructuredList condensed flush label="Details" columns={["Field", "Value"]} rows={[{ id: "1", cells: ["Reference", "SHP-1042"] }, { id: "2", cells: ["Weight", "4,200 kg"] }]} /> },
  ],
  "components/contained-list": [
    {
      title: "On-page and disclosed",
      render: () => (
        <Stack gap="xl" className="max-w-lg">
          <ContainedList label="Team members" action={<Button size="sm" variant="ghost" icon={Add}>Add member</Button>}>
            {["Ada Lovelace · Admin", "Grace Hopper · Editor", "Alan Turing · Viewer"].map((m) => (
              <ContainedListItem key={m} icon={<Icon as={UserAvatar} />} action={<OverflowMenu><MenuItem>Change role</MenuItem><MenuItem danger>Remove</MenuItem></OverflowMenu>}>{m}</ContainedListItem>
            ))}
          </ContainedList>
          <ContainedList label="Recent files" kind="disclosed" size="sm">
            {["rate-card.pdf", "lanes.xlsx", "contract.docx"].map((f) => <ContainedListItem key={f} icon={<Icon as={Document} />} onClick={() => {}}>{f}</ContainedListItem>)}
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
          <UnorderedList><ListItem>Road freight</ListItem><ListItem>Sea freight<UnorderedList nested><ListItem>FCL</ListItem><ListItem>LCL</ListItem></UnorderedList></ListItem><ListItem>Air freight</ListItem></UnorderedList>
          <OrderedList><ListItem>Upload the rate card</ListItem><ListItem>Map the lanes<OrderedList nested><ListItem>Origin</ListItem><ListItem>Destination</ListItem></OrderedList></ListItem><ListItem>Publish</ListItem></OrderedList>
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
                  { id: "reports", label: "Reports", icon: Folder, children: [{ id: "q2", label: "Q2 review", icon: Document }, { id: "q3", label: "Q3 forecast", icon: Document }] },
                  { id: "contracts", label: "Contracts", icon: Folder, children: [{ id: "acme", label: "Acme GmbH", icon: Document }] },
                  { id: "archive", label: "Archive", icon: Folder, disabled: true },
                ] },
              ]} />
            </div>
          )
        }
        return <T />
      },
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
            <AccordionItem value="a"><AccordionTrigger>What does the quote include?</AccordionTrigger><AccordionContent>Freight, fuel surcharge and standard insurance. Customs and waiting time are itemised separately.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>How long is a quote valid?</AccordionTrigger><AccordionContent>14 days from the moment it is sent.</AccordionContent></AccordionItem>
            <AccordionItem value="c" disabled><AccordionTrigger>Can I change the carrier? (disabled)</AccordionTrigger><AccordionContent>—</AccordionContent></AccordionItem>
          </Accordion>
          <Accordion type="multiple" align="start" size="sm">
            <AccordionItem value="a"><AccordionTrigger>Start-aligned, small</AccordionTrigger><AccordionContent>Chevron leads — better for nested settings and filter panels.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>Multiple can be open</AccordionTrigger><AccordionContent>type="multiple"</AccordionContent></AccordionItem>
          </Accordion>
        </Stack>
      ),
    },
  ],
  "components/tabs": [
    {
      title: "Line & contained",
      render: () => (
        <Stack gap="2xl">
          <Tabs defaultValue="overview">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger><TabsTrigger value="settings">Settings</TabsTrigger><TabsTrigger value="x" disabled>Billing</TabsTrigger></TabsList>
            <TabsContent value="overview"><Text tone="muted">Overview content</Text></TabsContent>
            <TabsContent value="activity"><Text tone="muted">Activity content</Text></TabsContent>
            <TabsContent value="settings"><Text tone="muted">Settings content</Text></TabsContent>
          </Tabs>
          <Tabs defaultValue="a">
            <TabsList variant="contained"><TabsTrigger value="a">Road</TabsTrigger><TabsTrigger value="b">Sea</TabsTrigger><TabsTrigger value="c">Air</TabsTrigger></TabsList>
            <TabsContent value="a" className="rounded-b-md bg-layer-1 p-4">Road lanes</TabsContent>
            <TabsContent value="b" className="rounded-b-md bg-layer-1 p-4">Sea lanes</TabsContent>
            <TabsContent value="c" className="rounded-b-md bg-layer-1 p-4">Air lanes</TabsContent>
          </Tabs>
        </Stack>
      ),
    },
  ],
}
