import * as React from "react"
import { Add, Edit, TrashCan, Download, Copy, Filter, Close, TextBold, TextItalic, TextUnderline, TextStrikethrough, ListBulleted, ListNumbered, Link as LinkIcon, Code, Renew, Locked } from "@/registry/icons"
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
import { agents, agentColumns } from "./data"
import { ShellDemo } from "./feedback"

function FilteringDemo() {
  const [q, setQ] = React.useState("")
  const [statuses, setStatuses] = React.useState<string[]>(["Deploying", "Degraded"])
  const [team, setTeam] = React.useState("")
  const all = ["Live", "Deploying", "Degraded", "Paused"]
  const rows = agents.filter((s) => (!statuses.length || statuses.includes(s.status)) && (!team || s.team === team) && (s.name + s.team).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
  const applied = [...statuses.map((s) => ({ k: "status", v: s })), ...(team ? [{ k: "team", v: team }] : [])]
  return (
    <Stack gap="sm">
      <Inline gap="xs" wrap>
        <div className="w-64"><Search size="md" placeholder="Search agent or team" value={q} onValueChange={setQ} /></div>
        <Popover>
          <PopoverTrigger asChild><Button variant="secondary" icon={Filter}>Filter{applied.length ? ` (${applied.length})` : ""}</Button></PopoverTrigger>
          <PopoverContent className="w-72">
            <Stack gap="md">
              <CheckboxGroup legend="Status">{all.map((s) => <Checkbox key={s} label={s} checked={statuses.includes(s)} onCheckedChange={(c) => setStatuses((x) => (c ? [...x, s] : x.filter((y) => y !== s)))} />)}</CheckboxGroup>
              <Dropdown label="Team" items={["Support", "Finance", "Sales"].map((c) => ({ value: c, label: c }))} value={team} onValueChange={setTeam} />
            </Stack>
          </PopoverContent>
        </Popover>
      </Inline>
      {applied.length > 0 && (
        <Inline gap="xs" wrap>
          {applied.map((a) => <Tag key={a.k + a.v} tone="outline" onDismiss={() => (a.k === "status" ? setStatuses((x) => x.filter((y) => y !== a.v)) : setTeam(""))}>{a.v}</Tag>)}
          <Button size="sm" variant="ghost" onClick={() => { setStatuses([]); setTeam("") }}>Clear filters</Button>
        </Inline>
      )}
      <Text variant="footnote" tone="muted" aria-live="polite">{rows.length} results</Text>
      <DataTable label="Filtered agents" size="md" columns={agentColumns} rows={rows} emptyState={<EmptyState size="sm" pictogram={SearchPict} title="No agents match these filters" action={<Button variant="tertiary" onClick={() => { setStatuses([]); setTeam(""); setQ("") }}>Clear all filters</Button>} />} />
    </Stack>
  )
}

function ReadOnlyDemo() {
  const [editing, setEditing] = React.useState(false)
  return (
    <Stack gap="md" className="max-w-lg">
      <Inline justify="between"><Text variant="title-3">Workspace settings</Text>{editing ? <IconButton icon={Close} label="Discard changes" shortcut="escape" onClick={() => setEditing(false)} /> : <Button variant="ghost" icon={Edit} shortcut="mod+e" onClick={() => setEditing(true)}>Edit</Button>}</Inline>
      {editing ? (
        <Form onSubmit={(e) => { e.preventDefault(); setEditing(false); toast({ kind: "success", title: "Settings saved" }) }}>
          <TextInput label="Workspace name" defaultValue="Vita Support" />
          <TextInput label="Default model" defaultValue="Vita Large" />
          <TextInput label="Workspace ID" defaultValue="ws_8f2k1" readOnly helperText="Set by the system" />
          <FormActions><Button type="submit" shortcut="mod+s">Save</Button></FormActions>
        </Form>
      ) : (
        <StructuredList flush condensed label="Workspace settings" columns={["Field", "Value"]} rows={[{ id: "1", cells: ["Workspace name", "Vita Support"] }, { id: "2", cells: ["Default model", "Vita Large"] }, { id: "3", cells: ["Workspace ID", <Inline key="x" gap="2xs">ws_8f2k1<Icon as={Locked} label="Set by the system" className="text-helper" /></Inline>] }]} />
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
        <Tooltip content="Connect at least one knowledge source to deploy"><span tabIndex={0} className="rounded-md focus-ring"><Button disabled className="pointer-events-none">Deploy</Button></span></Tooltip>
        <Text variant="footnote" tone="muted">← explain why when it isn't obvious</Text>
      </Inline>
      <TextInput label="Model" disabled defaultValue="Locked while a deployment runs" />
      <Toggle label="Allow web browsing" disabled helperText="Your admin has turned this off" />
      <InlineNotification kind="info" title="Read-only access" subtitle="Ask a workspace admin for edit rights." />
    </Stack>
  )
}

function CommonActionsDemo() {
  const [del, setDel] = React.useState(false)
  return (
    <Stack gap="lg">
      <PageHeader
        breadcrumb={[{ label: "Agents", href: "#" }, { label: "Support triage" }]}
        title="Support triage"
        status={<StatusIndicator kind="success">Live</StatusIndicator>}
        description="Answers and routes support tickets · Vita Large · Production"
        actions={<><Button variant="secondary" icon={Copy}>Duplicate</Button><Button icon={Renew}>Redeploy</Button><OverflowMenu label="More actions"><MenuItem icon={Edit}>Edit</MenuItem><MenuItem icon={Download}>Export config</MenuItem><MenuSeparator /><MenuItem icon={TrashCan} danger onSelect={() => setDel(true)}>Delete agent</MenuItem></OverflowMenu></>}
        tabs={<Tabs defaultValue="o"><TabsList><TabsTrigger value="o">Overview</TabsTrigger><TabsTrigger value="h">History</TabsTrigger></TabsList></Tabs>}
      />
      <ConfirmModal danger open={del} onOpenChange={setDel} title="Delete Support triage?" description="It stops answering tickets and its run history is removed." confirmLabel="Delete agent" onConfirm={() => setDel(false)} />
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
            <Tile className="h-32">{loaded ? <><Text variant="footnote" tone="muted">{["Runs today", "Handoffs", "Resolved"][i]}</Text><Text variant="title-1" className="tabular-nums">{[128, 42, 87][i]}</Text></> : <><Skeleton shape="text" className="w-1/3" /><Skeleton className="mt-2 h-8 w-1/2" /></>}</Tile>
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
          <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger>Guardrails</AccordionTrigger><AccordionContent>Never issue refunds above $200 without approval.</AccordionContent></AccordionItem><AccordionItem value="b"><AccordionTrigger>Escalation</AccordionTrigger><AccordionContent>Hand off to the Support queue after 2 failed answers.</AccordionContent></AccordionItem></Accordion>
        </Stack>
      ),
    },
  ],
  "patterns/empty-states": [
    { title: "First use", render: () => <EmptyState size="lg" pictogram={Report} title="Create your first agent" description="Describe what it should do, connect your tools and deploy. It takes about five minutes." action={<Button icon={Add}>Create agent</Button>} secondaryAction={<Button variant="ghost">Start from a template</Button>} /> },
    { title: "No results", render: () => <EmptyState pictogram={SearchPict} title="No results for “suport”" description="Check the spelling or search by agent ID." action={<Button variant="tertiary">Clear search</Button>} /> },
    { title: "Error", render: () => <EmptyState pictogram={ErrorPict} title="We couldn't load agents" description="The connection timed out. Your agents are still running." action={<Button variant="tertiary" icon={Renew}>Try again</Button>} /> },
  ],
  "patterns/filtering": [{ title: "Search + filter popover + applied tags", render: () => <FilteringDemo /> }],
  "patterns/fluid-styles": [
    {
      title: "Fluid vs default",
      render: () => (
        <Grid gutter="wide" rowGap="lg">
          <Column sm={4} md={8} lg={8}><Stack gap="sm"><Text variant="headline">Fluid (dense data entry)</Text><FluidForm><TextInput label="Agent name" defaultValue="Support triage" /><TextInput label="Owner" defaultValue="Support" /><Select label="Model" defaultValue="large"><SelectOption value="large">Vita Large</SelectOption><SelectOption value="fast">Vita Fast</SelectOption></Select><TextInput label="Max concurrent runs" defaultValue="12" /></FluidForm></Stack></Column>
          <Column sm={4} md={8} lg={8}><Stack gap="sm"><Text variant="headline">Default</Text><Stack gap="md"><TextInput label="Agent name" defaultValue="Support triage" /><TextInput label="Owner" defaultValue="Support" /></Stack></Stack></Column>
        </Grid>
      ),
    },
  ],
  "patterns/forms": [
    {
      title: "Multi-step form",
      render: () => (
        <Stack gap="xl" className="max-w-xl">
          <ProgressIndicator steps={[{ label: "Purpose" }, { label: "Knowledge" }, { label: "Review" }]} current={1} />
          <Form>
            <Text variant="title-3">Knowledge</Text>
            <Select label="Source type" defaultValue="site"><SelectOption value="site">Help center</SelectOption><SelectOption value="drive">Shared drive</SelectOption></Select>
            <TextInput label="Help center URL" inputMode="url" />
            <TextInput label="Pages to exclude" optional />
            <ButtonSet><Button variant="secondary">Back</Button><Button>Continue to review</Button></ButtonSet>
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
          <Truncate>Quarterly support deflection review for the enterprise workspace</Truncate>
          <Truncate mode="middle">knowledge-export-support-workspace-2026-09-30-final-v3.csv</Truncate>
          <Truncate mode="lines" lines={2}>Support triage reads each new ticket, checks the help center and past resolutions, and answers when it is confident. When confidence is below the threshold or the customer asks for a person, it hands the conversation to the Support queue with a summary and suggested reply.</Truncate>
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
          const [q, setQ] = React.useState("support")
          const res = agents.filter((s) => q && (s.name + s.team).toLowerCase().includes(q.toLowerCase())).slice(0, 4)
          return (
            <Stack gap="sm" className="max-w-lg">
              <Search size="lg" placeholder="Search agents, runs, knowledge" value={q} onValueChange={setQ} />
              <Inline gap="xs">{["All", "Agents", "Runs", "Knowledge"].map((s, i) => <SelectableTag key={s} selected={i === 1} onSelectedChange={() => {}}>{s}</SelectableTag>)}</Inline>
              <Text variant="footnote" tone="muted">{res.length} results for “{q}”</Text>
              {res.map((r) => <Tile key={r.id} className="gap-1 p-3"><Text weight="medium">{r.name} · {r.team}</Text><Text variant="footnote" tone="muted">{r.ref} · {r.model}</Text></Tile>)}
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
            <StatusIndicator kind="success">Live</StatusIndicator>
            <StatusIndicator kind="in-progress">Deploying</StatusIndicator>
            <StatusIndicator kind="pending">Awaiting approval</StatusIndicator>
            <StatusIndicator kind="warning">Degraded</StatusIndicator>
            <StatusIndicator kind="caution">Rate limited</StatusIndicator>
            <StatusIndicator kind="error">Failed</StatusIndicator>
            <StatusIndicator kind="info">Scheduled</StatusIndicator>
            <StatusIndicator kind="draft">Draft</StatusIndicator>
          </Inline>
          <Inline gap="lg" wrap>
            <StatusIndicator kind="success" variant="dot" size="sm">Healthy</StatusIndicator>
            <StatusIndicator kind="warning" variant="dot" size="sm">Degraded</StatusIndicator>
            <StatusIndicator kind="error" variant="dot" size="sm">Down</StatusIndicator>
          </Inline>
          <Inline gap="xs"><Tag tone="success">Passed</Tag><Tag tone="warning">Flaky</Tag><Tag tone="error">Failed</Tag><Text variant="footnote" tone="muted">← tags for categorical status inside dense rows</Text></Inline>
        </Stack>
      ),
    },
  ],
  "patterns/text-toolbar": [{ title: "Formatting toolbar", render: () => <TextToolbarDemo /> }],
}

export { IconButton }
