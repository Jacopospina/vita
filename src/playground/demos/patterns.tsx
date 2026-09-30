import * as React from "react"
import { Add, Edit, TrashCan, Download, Copy, Filter, TextBold, TextItalic, TextUnderline, TextStrikethrough, ListBulleted, ListNumbered, Link as LinkIcon, Code, Renew, Locked } from "@/registry/icons"
import { Report, Magnify as SearchPict, Warning_01 as ErrorPict } from "@/registry/pictograms"
import type { DemoMap } from "./types"
import { Stack, Inline, Grid, Column } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, IconButton, ButtonSet } from "@/registry/ui/button"
import { EmptyState } from "@/registry/ui/empty-state"
import { StatusIndicator } from "@/registry/ui/status-indicator"
import { PageHeader } from "@/registry/ui/page-header"
import { Truncate } from "@/registry/ui/truncate"
import { LoginBlock } from "@/registry/blocks/login"
import { DataTable } from "@/registry/ui/data-table"
import { Search } from "@/registry/ui/search"
import { Tag, SelectableTag } from "@/registry/ui/tag"
import { Checkbox, CheckboxGroup } from "@/registry/ui/checkbox"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Disclosure, DisclosureTrigger, DisclosureContent } from "@/registry/ui/accordion"
import { Popover, PopoverTrigger, PopoverContent } from "@/registry/ui/popover"
import { TextInput } from "@/registry/ui/text-input"
import { Select, SelectOption } from "@/registry/ui/select"
import { Dropdown } from "@/registry/ui/dropdown"
import { Toggle } from "@/registry/ui/toggle"
import { Tile } from "@/registry/ui/tile"
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@/registry/ui/toolbar"
import { OverflowMenu } from "@/registry/ui/menu-button"
import { MenuItem, MenuSeparator } from "@/registry/ui/menu"
import { InlineNotification, toast } from "@/registry/ui/notification"
import { ConfirmModal } from "@/registry/ui/modal"
import { Tabs, TabsList, TabsTrigger } from "@/registry/ui/tabs"
import { Skeleton, SkeletonText, InlineLoading } from "@/registry/ui/loading"
import { Tooltip } from "@/registry/ui/tooltip"
import { Icon } from "@/registry/ui/icon"
import { StructuredList } from "@/registry/ui/structured-list"
import { Form, FormActions, FluidForm } from "@/registry/ui/form"
import { ProgressIndicator } from "@/registry/ui/progress-indicator"
import { shipments, shipmentColumns } from "./data"
import { ShellDemo } from "./feedback"

function FilteringDemo() {
  const [q, setQ] = React.useState("")
  const [statuses, setStatuses] = React.useState<string[]>(["In transit", "Delayed"])
  const [customer, setCustomer] = React.useState("")
  const all = ["Delivered", "In transit", "Delayed", "Cancelled"]
  const rows = shipments.filter((s) => (!statuses.length || statuses.includes(s.status)) && (!customer || s.customer === customer) && (s.ref + s.customer).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  const applied = [...statuses.map((s) => ({ k: "status", v: s })), ...(customer ? [{ k: "customer", v: customer }] : [])]
  return (
    <Stack gap="sm">
      <Inline gap="xs" wrap>
        <div className="w-64"><Search size="md" placeholder="Search reference or customer" value={q} onValueChange={setQ} /></div>
        <Popover>
          <PopoverTrigger asChild><Button variant="secondary" icon={Filter} iconPosition="start">Filter{applied.length ? ` (${applied.length})` : ""}</Button></PopoverTrigger>
          <PopoverContent className="w-72">
            <Stack gap="md">
              <CheckboxGroup legend="Status">{all.map((s) => <Checkbox key={s} label={s} checked={statuses.includes(s)} onCheckedChange={(c) => setStatuses((x) => (c ? [...x, s] : x.filter((y) => y !== s)))} />)}</CheckboxGroup>
              <Dropdown label="Customer" items={["Acme GmbH", "Northwind", "Globex"].map((c) => ({ value: c, label: c }))} value={customer} onValueChange={setCustomer} />
            </Stack>
          </PopoverContent>
        </Popover>
      </Inline>
      {applied.length > 0 && (
        <Inline gap="xs" wrap>
          {applied.map((a) => <Tag key={a.k + a.v} tone="outline" onDismiss={() => (a.k === "status" ? setStatuses((x) => x.filter((y) => y !== a.v)) : setCustomer(""))}>{a.v}</Tag>)}
          <Button size="sm" variant="ghost" onClick={() => { setStatuses([]); setCustomer("") }}>Clear filters</Button>
        </Inline>
      )}
      <Text variant="footnote" tone="muted" aria-live="polite">{rows.length} results</Text>
      <DataTable label="Filtered shipments" size="md" columns={shipmentColumns} rows={rows} emptyState={<EmptyState size="sm" pictogram={SearchPict} title="No shipments match these filters" action={<Button variant="tertiary" onClick={() => { setStatuses([]); setCustomer(""); setQ("") }}>Clear all filters</Button>} />} />
    </Stack>
  )
}

function ReadOnlyDemo() {
  const [editing, setEditing] = React.useState(false)
  return (
    <Stack gap="md" className="max-w-lg">
      <Inline justify="between"><Text variant="title-3">Company details</Text>{!editing && <Button variant="ghost" icon={Edit} iconPosition="start" onClick={() => setEditing(true)}>Edit</Button>}</Inline>
      {editing ? (
        <Form onSubmit={(e) => { e.preventDefault(); setEditing(false); toast({ kind: "success", title: "Details saved" }) }}>
          <TextInput label="Legal name" defaultValue="Acme Logistics GmbH" />
          <TextInput label="VAT number" defaultValue="DE123456789" />
          <TextInput label="Account ID" defaultValue="acc_8f2k1" readOnly helperText="Set by the system" />
          <FormActions><Button type="submit">Save</Button><Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></FormActions>
        </Form>
      ) : (
        <StructuredList flush condensed label="Company details" columns={["Field", "Value"]} rows={[{ id: "1", cells: ["Legal name", "Acme Logistics GmbH"] }, { id: "2", cells: ["VAT number", "DE123456789"] }, { id: "3", cells: ["Account ID", <Inline key="x" gap="2xs">acc_8f2k1<Icon as={Locked} label="Set by the system" className="text-helper" /></Inline>] }]} />
      )}
    </Stack>
  )
}

function TextToolbarDemo() {
  return (
    <Stack gap="sm" className="max-w-2xl">
      <Toolbar label="Formatting">
        <ToolbarToggleGroup type="multiple" defaultValue={["bold"]} aria-label="Text style">
          <ToolbarToggle value="bold" icon={TextBold} label="Bold (⌘B)" />
          <ToolbarToggle value="italic" icon={TextItalic} label="Italic (⌘I)" />
          <ToolbarToggle value="underline" icon={TextUnderline} label="Underline (⌘U)" />
          <ToolbarToggle value="strike" icon={TextStrikethrough} label="Strikethrough" />
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarToggleGroup type="single" aria-label="List">
          <ToolbarToggle value="ul" icon={ListBulleted} label="Bulleted list" />
          <ToolbarToggle value="ol" icon={ListNumbered} label="Numbered list" />
        </ToolbarToggleGroup>
        <ToolbarSeparator />
        <ToolbarButton icon={LinkIcon} label="Insert link (⌘K)" />
        <ToolbarButton icon={Code} label="Code" />
      </Toolbar>
      <div contentEditable suppressContentEditableWarning className="min-h-32 rounded-md border border-border-field bg-field p-3 text-body focus-ring">
        <b>Select text</b> and use the toolbar. Tab reaches the toolbar once; arrow keys move between tools.
      </div>
    </Stack>
  )
}

function DisabledDemo() {
  return (
    <Stack gap="lg" className="max-w-md">
      <Inline wrap>
        <Button disabled>Disabled</Button>
        <Tooltip content="Add at least one lane to publish"><span tabIndex={0} className="rounded-md focus-ring"><Button disabled className="pointer-events-none">Publish</Button></span></Tooltip>
        <Text variant="footnote" tone="muted">← explain why when it isn't obvious</Text>
      </Inline>
      <TextInput label="Disabled field" disabled defaultValue="Can't be changed right now" />
      <Toggle label="Beta features" disabled helperText="Your admin has turned this off" />
      <InlineNotification kind="info" title="Read-only access" subtitle="Ask a workspace admin for edit rights." />
    </Stack>
  )
}

function CommonActionsDemo() {
  const [del, setDel] = React.useState(false)
  return (
    <Stack gap="lg">
      <PageHeader
        breadcrumb={[{ label: "Quotes", href: "#" }, { label: "Q-2041" }]}
        title="Q-2041 · Acme GmbH"
        status={<StatusIndicator kind="pending">Awaiting customer</StatusIndicator>}
        description="Rotterdam → Milan · 12 pallets · valid until 14 Oct"
        actions={<><Button variant="secondary" icon={Copy} iconPosition="start">Duplicate</Button><Button icon={Download}>Download PDF</Button><OverflowMenu label="More actions"><MenuItem icon={Edit}>Edit</MenuItem><MenuItem icon={Renew}>Recalculate</MenuItem><MenuSeparator /><MenuItem icon={TrashCan} danger onSelect={() => setDel(true)}>Delete quote</MenuItem></OverflowMenu></>}
        tabs={<Tabs defaultValue="o"><TabsList><TabsTrigger value="o">Overview</TabsTrigger><TabsTrigger value="h">History</TabsTrigger></TabsList></Tabs>}
      />
      <ConfirmModal danger open={del} onOpenChange={setDel} title="Delete quote Q-2041?" description="The customer's link will stop working." confirmLabel="Delete quote" onConfirm={() => setDel(false)} />
    </Stack>
  )
}

function LoadingPatternDemo() {
  const [loaded, setLoaded] = React.useState(false)
  React.useEffect(() => { if (!loaded) { const t = setTimeout(() => setLoaded(true), 1800); return () => clearTimeout(t) } }, [loaded])
  return (
    <Stack gap="md">
      <Inline><Button variant="secondary" icon={Renew} onClick={() => setLoaded(false)}>Reload</Button><InlineLoading status={loaded ? "inactive" : "active"} description="Loading dashboard" /></Inline>
      <Grid gutter="narrow">
        {[0, 1, 2].map((i) => (
          <Column key={i} sm={4} md={4} lg={5}>
            <Tile className="h-32">{loaded ? <><Text variant="footnote" tone="muted">Quotes sent</Text><Text variant="title-1" className="tabular-nums">{[128, 42, 87][i]}</Text></> : <><Skeleton shape="text" className="w-1/3" /><Skeleton className="mt-2 h-8 w-1/2" /></>}</Tile>
          </Column>
        ))}
      </Grid>
      {loaded ? <Text tone="muted">Content loaded — layout didn't shift.</Text> : <SkeletonText lines={2} />}
    </Stack>
  )
}

export const patternDemos: DemoMap = {
  "patterns/common-actions": [{ title: "Page-level actions", description: "1 primary · ≤2 secondary · rest in overflow · destructive last & confirmed.", render: () => <CommonActionsDemo /> }],
  "patterns/dialogs": [
    {
      title: "Choosing the right dialog",
      render: () => (
        <StructuredList label="Dialog choice" columns={["Need", "Use", "Blocks page?"]} rows={[
          { id: "1", cells: ["Confirm a destructive action", "ConfirmModal danger", "Yes"] },
          { id: "2", cells: ["Short focused task (≤ 5 fields)", "Modal (transactional)", "Yes"] },
          { id: "3", cells: ["Edit while seeing the page", "RightPanel", "No"] },
          { id: "4", cells: ["A couple of options next to a control", "Popover", "No"] },
          { id: "5", cells: ["Explain a term", "Toggletip", "No"] },
          { id: "6", cells: ["Confirm something happened", "Toast", "No"] },
        ]} />
      ),
    },
  ],
  "patterns/disabled-states": [{ title: "Disabled vs hidden vs explained", render: () => <DisabledDemo /> }],
  "patterns/disclosures": [
    {
      title: "Disclosure, accordion, expandable content",
      render: () => (
        <Stack gap="lg" className="max-w-lg">
          <Disclosure>
            <DisclosureTrigger asChild><Button variant="ghost" size="sm">Show advanced options</Button></DisclosureTrigger>
            <DisclosureContent><Stack gap="md"><TextInput label="Custom webhook URL" /><Toggle label="Retry on failure" defaultChecked /></Stack></DisclosureContent>
          </Disclosure>
          <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger>Billing address</AccordionTrigger><AccordionContent>Via Roma 1, Milan</AccordionContent></AccordionItem><AccordionItem value="b"><AccordionTrigger>Shipping address</AccordionTrigger><AccordionContent>Same as billing</AccordionContent></AccordionItem></Accordion>
        </Stack>
      ),
    },
  ],
  "patterns/empty-states": [
    { title: "First use", render: () => <EmptyState size="lg" pictogram={Report} title="Create your first quote" description="Quotes you create or receive by email appear here. It takes about a minute." action={<Button icon={Add}>Create quote</Button>} secondaryAction={<Button variant="ghost">Import from CSV</Button>} /> },
    { title: "No results", render: () => <EmptyState pictogram={SearchPict} title="No results for “rotterdm”" description="Check the spelling or search by reference number." action={<Button variant="tertiary">Clear search</Button>} /> },
    { title: "Error", render: () => <EmptyState pictogram={ErrorPict} title="We couldn't load shipments" description="The connection to the TMS timed out. Your data is safe." action={<Button variant="tertiary" icon={Renew}>Try again</Button>} /> },
  ],
  "patterns/filtering": [{ title: "Search + filter popover + applied tags", render: () => <FilteringDemo /> }],
  "patterns/fluid-styles": [
    {
      title: "Fluid vs default",
      render: () => (
        <Grid gutter="wide" rowGap="lg">
          <Column sm={4} md={8} lg={8}><Stack gap="sm"><Text variant="headline">Fluid (dense data entry)</Text><FluidForm columns={2}><TextInput label="Origin" defaultValue="Rotterdam" /><TextInput label="Destination" defaultValue="Milan" /><Select label="Mode" defaultValue="road"><SelectOption value="road">Road</SelectOption><SelectOption value="sea">Sea</SelectOption></Select><TextInput label="Pallets" defaultValue="12" /></FluidForm></Stack></Column>
          <Column sm={4} md={8} lg={8}><Stack gap="sm"><Text variant="headline">Default</Text><Stack gap="md"><TextInput label="Origin" defaultValue="Rotterdam" /><TextInput label="Destination" defaultValue="Milan" /></Stack></Stack></Column>
        </Grid>
      ),
    },
  ],
  "patterns/forms": [
    {
      title: "Multi-step form",
      render: () => (
        <Stack gap="xl" className="max-w-xl">
          <ProgressIndicator steps={[{ label: "Route" }, { label: "Cargo" }, { label: "Review" }]} current={1} />
          <Form>
            <Text variant="title-3">Cargo details</Text>
            <Select label="Cargo type" defaultValue="pallets"><SelectOption value="pallets">Pallets</SelectOption><SelectOption value="container">Container</SelectOption></Select>
            <TextInput label="Number of pallets" inputMode="numeric" />
            <TextInput label="Handling notes" optional />
            <ButtonSet className="justify-start"><Button variant="secondary">Back</Button><Button>Continue to review</Button></ButtonSet>
          </Form>
        </Stack>
      ),
    },
  ],
  "patterns/global-header": [{ title: "Global header", description: "Name → nav → search · notifications (opens the right panel) · help · account.", render: () => <ShellDemo right /> }],
  "patterns/loading": [{ title: "Skeleton → content without layout shift", render: () => <LoadingPatternDemo /> }],
  "patterns/login": [{ title: "Two-step login", render: () => <div className="flex justify-center py-8"><LoginBlock productName="Vita" signupHref="#" onSso={() => toast({ title: "Redirecting to your identity provider…" })} onSubmit={async () => { await new Promise((r) => setTimeout(r, 900)); throw new Error("x") }} /></div> }],
  "patterns/notifications": [
    {
      title: "Which notification?",
      render: () => (
        <StructuredList label="Notification choice" columns={["Situation", "Use", "Persistence"]} rows={[
          { id: "1", cells: ["User just did something and it worked", "Toast (success)", "Auto-dismiss 5s"] },
          { id: "2", cells: ["Something failed that the user must fix", "InlineNotification (error) near the cause", "Until resolved"] },
          { id: "3", cells: ["System-wide or account issue", "InlineNotification at page top", "Until dismissed"] },
          { id: "4", cells: ["Blocking decision required", "ConfirmModal", "Until chosen"] },
          { id: "5", cells: ["Static guidance in content", "Callout", "Permanent"] },
          { id: "6", cells: ["History of events", "RightPanel notification list", "Stored"] },
        ]} />
      ),
    },
  ],
  "patterns/overflow-content": [
    {
      title: "Truncation modes",
      render: () => (
        <Stack gap="md" className="max-w-sm">
          <Truncate>Quarterly logistics performance review for the EMEA region</Truncate>
          <Truncate mode="middle">invoice-2026-acme-logistics-gmbh-rotterdam-final-v3.pdf</Truncate>
          <Truncate mode="lines" lines={2}>Freight rates are calculated using the active rate card for the lane, adjusted for fuel surcharge, seasonal peaks and any customer-specific discount. Accessorial charges such as tail-lift delivery, waiting time and customs are itemised separately on the quote.</Truncate>
        </Stack>
      ),
    },
  ],
  "patterns/read-only-states": [{ title: "View → edit", render: () => <ReadOnlyDemo /> }],
  "patterns/search": [
    {
      title: "Search with scoped results",
      render: () => {
        const S = () => {
          const [q, setQ] = React.useState("acme")
          const res = shipments.filter((s) => q && (s.ref + s.customer).toLowerCase().includes(q.toLowerCase())).slice(0, 4)
          return (
            <Stack gap="sm" className="max-w-lg">
              <Search size="lg" placeholder="Search quotes, shipments, customers" value={q} onValueChange={setQ} />
              <Inline gap="xs">{["All", "Shipments", "Quotes", "Customers"].map((s, i) => <SelectableTag key={s} selected={i === 1} onSelectedChange={() => {}}>{s}</SelectableTag>)}</Inline>
              <Text variant="footnote" tone="muted">{res.length} results for “{q}”</Text>
              {res.map((r) => <Tile key={r.id} className="gap-1 p-3"><Text weight="medium">{r.ref} · {r.customer}</Text><Text variant="footnote" tone="muted">{r.lane}</Text></Tile>)}
            </Stack>
          )
        }
        return <S />
      },
    },
  ],
  "patterns/status-indicators": [
    {
      title: "Status kinds",
      render: () => (
        <Stack gap="lg">
          <Inline gap="lg" wrap>
            <StatusIndicator kind="success">Delivered</StatusIndicator>
            <StatusIndicator kind="in-progress">In transit</StatusIndicator>
            <StatusIndicator kind="pending">Awaiting carrier</StatusIndicator>
            <StatusIndicator kind="warning">Delayed</StatusIndicator>
            <StatusIndicator kind="caution">Partial</StatusIndicator>
            <StatusIndicator kind="error">Failed</StatusIndicator>
            <StatusIndicator kind="info">Scheduled</StatusIndicator>
            <StatusIndicator kind="draft">Draft</StatusIndicator>
          </Inline>
          <Inline gap="lg" wrap>
            <StatusIndicator kind="success" variant="dot" size="sm">Healthy</StatusIndicator>
            <StatusIndicator kind="warning" variant="dot" size="sm">Degraded</StatusIndicator>
            <StatusIndicator kind="error" variant="dot" size="sm">Down</StatusIndicator>
          </Inline>
          <Inline gap="xs"><Tag tone="success">Paid</Tag><Tag tone="warning">Overdue</Tag><Tag tone="error">Rejected</Tag><Text variant="footnote" tone="muted">← tags for categorical status inside dense rows</Text></Inline>
        </Stack>
      ),
    },
  ],
  "patterns/text-toolbar": [{ title: "Formatting toolbar", render: () => <TextToolbarDemo /> }],
}

export { IconButton }
