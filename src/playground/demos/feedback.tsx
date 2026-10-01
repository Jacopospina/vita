import * as React from "react"
import { Notification, Help, Bot, Headphones, CloudUpload, Rocket, Time, Search as SearchIcon, UserAvatar, Dashboard, Activity, Document, Settings, Chat } from "@/registry/icons"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, IconButton } from "@/registry/ui/button"
import { Loading, InlineLoading, Skeleton, SkeletonText } from "@/registry/ui/loading"
import { Thinking } from "@/registry/ui/thinking"
import { Icon } from "@/registry/ui/icon"
import { InlineNotification, Callout, toast, capsule } from "@/registry/ui/notification"
import { ProgressBar } from "@/registry/ui/progress-bar"
import { ProgressIndicator } from "@/registry/ui/progress-indicator"
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalAction, ConfirmModal } from "@/registry/ui/modal"
import { Popover, PopoverTrigger, PopoverContent, PopoverFooter, Toggletip } from "@/registry/ui/popover"
import { Tooltip, DefinitionTooltip } from "@/registry/ui/tooltip"
import { TextInput } from "@/registry/ui/text-input"
import { Dropdown } from "@/registry/ui/dropdown"
import { Checkbox } from "@/registry/ui/checkbox"
import { Shell, ShellBody, ShellMain, Header, HeaderNavItem, HeaderGlobalAction, LeftPanel, SideNavItem, SideNavSection, SideNavMenu, RightPanel } from "@/registry/ui/ui-shell"
import { Tile } from "@/registry/ui/tile"
import { Link } from "@/registry/ui/link"

function InlineLoadingDemo() {
  // One indicator morphs through the whole story: saving → couldn't save → (Retry) → saving → saved.
  // In this demo every first attempt fails and the retry succeeds.
  const [status, setStatus] = React.useState<"inactive" | "active" | "finished" | "error">("inactive")
  const attempt = React.useRef(0)
  const save = () => {
    const n = ++attempt.current
    setStatus("active")
    window.setTimeout(() => {
      if (n % 2 === 1) return setStatus("error")
      setStatus("finished")
      window.setTimeout(() => setStatus("inactive"), 2000)
    }, 1400)
  }
  const text = status === "active" ? "Saving…" : status === "finished" ? "Saved" : status === "error" ? "Couldn't save." : undefined
  return (
    <Inline gap="md">
      <Button variant="secondary" disabled={status === "active"} onClick={save}>Save draft</Button>
      <InlineLoading status={status} description={text} onRetry={save} />
      <InlineLoading mode="searching" description="Searching the help center" />
    </Inline>
  )
}

function CapsuleDemo() {
  const sync = () => {
    const id = capsule({ icon: <Icon as={CloudUpload} size="md" />, title: "Syncing knowledge", subtitle: "Help center", story: { progress: 8 }, duration: 0 })
    let v = 8
    const t = window.setInterval(() => {
      v = Math.min(100, v + 23)
      capsule.update(id, { story: { progress: v }, subtitle: v >= 100 ? "Up to date" : "Help center" })
      if (v >= 100) {
        window.clearInterval(t)
        capsule.update(id, { duration: 1800 })
      }
    }, 650)
  }
  return (
    <Inline wrap>
      <Button variant="secondary" onClick={() => capsule({ icon: <Icon as={Headphones} size="md" />, title: "Voice agent", subtitle: "Connected", story: { progress: 100 } })}>Connected · 100</Button>
      <Button variant="secondary" onClick={() => capsule({ icon: <Icon as={Rocket} size="md" />, title: "Agent deployed", subtitle: "Support triage", story: { status: "success" } })}>Deployed · status</Button>
      <Button variant="secondary" onClick={sync}>Syncing · live progress</Button>
      <Button variant="secondary" onClick={() => capsule({ icon: <Icon as={Bot} size="md" />, title: "Refund assistant", subtitle: "Thinking", story: <Thinking size="md" mode="generating" /> })}>Thinking · custom story</Button>
    </Inline>
  )
}

function ProgressDemo() {
  const [v, setV] = React.useState(35)
  return (
    <Stack gap="lg" className="max-w-md">
      <ProgressBar label="Indexing help-center.csv" value={v} helperText={`${v}% · about 20 seconds left`} />
      <Inline><Button size="sm" variant="secondary" onClick={() => setV((x) => Math.min(100, x + 15))}>Advance</Button></Inline>
      <ProgressBar label="Deploying Support triage" helperText="This usually takes under a minute" />
      <ProgressBar label="Agent reading the help center" tone="spectrum" value={v} helperText="Spectrum tone for agent work" />
      <ProgressBar label="Indexing complete" status="finished" helperText="1,240 articles indexed" />
      <ProgressBar label="Indexing failed" value={62} status="error" helperText="refund-policy.pdf is password-protected" />
      <ProgressBar label="Runs this month" value={7} max={10} size="sm" helperText="7,000 of 10,000 runs" />
    </Stack>
  )
}

function StepsDemo() {
  const [cur, setCur] = React.useState(2)
  const steps = [{ label: "Purpose", secondaryLabel: "Support triage" }, { label: "Knowledge" }, { label: "Tools" }, { label: "Test" }, { label: "Deploy" }]
  return (
    <Stack gap="xl">
      <ProgressIndicator steps={steps} current={cur} onStepClick={setCur} />
      <Inline><Button size="sm" variant="secondary" disabled={cur === 0} onClick={() => setCur(cur - 1)}>Back</Button><Button size="sm" disabled={cur === steps.length - 1} onClick={() => setCur(cur + 1)}>Next</Button></Inline>
      <div className="max-w-xs"><ProgressIndicator vertical steps={[{ label: "Account" }, { label: "Workspace", invalid: true, secondaryLabel: "Workspace name missing" }, { label: "Billing" }]} current={1} /></div>
    </Stack>
  )
}

function ModalDemo() {
  const [confirm, setConfirm] = React.useState(false)
  const [danger, setDanger] = React.useState(false)
  return (
    <Inline wrap>
      <Modal>
        <ModalTrigger asChild><Button>Transactional modal</Button></ModalTrigger>
        <ModalContent size="sm">
          <ModalHeader label="Support triage" title="Deploy to production" description="The agent starts answering real tickets as soon as it's live." />
          <ModalBody><Stack gap="md"><TextInput label="Release note" defaultValue="Handles refund questions" /><Checkbox label="Notify the Support team" defaultChecked /></Stack></ModalBody>
          <ModalFooter><Button variant="secondary">Save as draft</Button><ModalAction shortcut="mod+s" onAction={async () => { await new Promise((r) => setTimeout(r, 700)); toast({ kind: "success", title: "Agent deployed", subtitle: "Support triage is live" }) }}>Deploy agent</ModalAction></ModalFooter>
        </ModalContent>
      </Modal>
      <Modal>
        <ModalTrigger asChild><Button variant="secondary">Passive modal</Button></ModalTrigger>
        <ModalContent size="xs"><ModalHeader title="Keyboard shortcuts" /><ModalBody><Text tone="muted">Press ⌘K to search, N to create.</Text></ModalBody></ModalContent>
      </Modal>
      <Modal>
        <ModalTrigger asChild><Button variant="tertiary">Large, scrolling</Button></ModalTrigger>
        <ModalContent size="lg"><ModalHeader title="Acceptable use policy" /><ModalBody scroll className="max-h-80 border-b-0">{Array.from({ length: 12 }).map((_, i) => <Text key={i} className="mb-4">Clause {i + 1}. Agents deployed on Vita must act only within the permissions granted by the workspace owner and must disclose that they are automated when interacting with people.</Text>)}</ModalBody></ModalContent>
      </Modal>
      <Button variant="secondary" onClick={() => setConfirm(true)}>Confirm</Button>
      <Button variant="danger-tertiary" onClick={() => setDanger(true)}>Danger modal</Button>
      <ConfirmModal open={confirm} onOpenChange={setConfirm} title="Publish new instructions?" description="Every live run will use the new instructions from now on." confirmLabel="Publish instructions" onConfirm={() => toast({ kind: "success", title: "Instructions published" })} />
      <ConfirmModal danger open={danger} onOpenChange={setDanger} title="Delete 3 agents?" description="They stop running and their history is removed. This can't be undone." confirmLabel="Delete agents" onConfirm={async () => { await new Promise((r) => setTimeout(r, 500)); toast({ kind: "success", title: "3 agents deleted" }) }} />
    </Inline>
  )
}

export function ShellDemo({ rail, right, edit }: { rail?: boolean; right?: boolean; edit?: boolean }) {
  const [open, setOpen] = React.useState(!!right || !!edit)
  return (
    <div className="h-120 overflow-hidden rounded-lg border border-border-subtle [&>div]:h-full">
      <Shell>
        <Header productName="Vita" actions={<><HeaderGlobalAction icon={SearchIcon} label="Search" /><HeaderGlobalAction icon={Notification} label="Notifications" badge active={open && !edit} onClick={() => setOpen((o) => !o)} /><HeaderGlobalAction icon={Help} label="Help" /><HeaderGlobalAction icon={UserAvatar} label="Account" /></>}>
          <HeaderNavItem href="#" active>Agents</HeaderNavItem>
          <HeaderNavItem href="#">Runs</HeaderNavItem>
          <HeaderNavItem href="#">Reports</HeaderNavItem>
        </Header>
        <ShellBody>
          <LeftPanel rail={rail}>
            <SideNavSection>
              <SideNavItem href="#" icon={Dashboard} active>Dashboard</SideNavItem>
              <SideNavItem href="#" icon={Activity}>Runs</SideNavItem>
              <SideNavMenu icon={Document} title="Knowledge" defaultOpen={!rail}><SideNavItem href="#">Sources</SideNavItem><SideNavItem href="#">Collections</SideNavItem></SideNavMenu>
            </SideNavSection>
            <SideNavSection title="Workspace"><SideNavItem href="#" icon={Settings}>Settings</SideNavItem></SideNavSection>
          </LeftPanel>
          <ShellMain className="p-6"><Stack gap="md"><Text variant="title-2">Dashboard</Text><Tile className="h-32" /><Tile className="h-32" /></Stack></ShellMain>
          {edit ? (
            <RightPanel
              open={open}
              onOpenChange={setOpen}
              title="Support triage"
              footer={<Button onClick={() => { setOpen(false); toast({ kind: "success", title: "Changes saved", subtitle: "Support triage" }) }}>Save changes</Button>}
            >
              <Stack gap="md">
                <TextInput label="Agent name" defaultValue="Support triage" />
                <Dropdown label="Model" defaultValue="l" items={[{ value: "l", label: "Vita Large" }, { value: "f", label: "Vita Fast" }]} />
                <Checkbox label="Hand off to a person when unsure" defaultChecked />
              </Stack>
            </RightPanel>
          ) : (
            <RightPanel open={open} onOpenChange={setOpen} title="Notifications" size="sm">
              <Stack gap="sm">
                <InlineNotification kind="success" title="Agent deployed" subtitle="Support triage · 2 min ago" />
                <InlineNotification kind="warning" title="Slack token expires" subtitle="In 3 days" />
                <InlineNotification kind="info" title="Evaluation finished" subtitle="Invoice extractor · 96% pass" />
              </Stack>
            </RightPanel>
          )}
        </ShellBody>
      </Shell>
    </div>
  )
}

export const feedbackDemos: DemoMap = {
  "components/thinking": [
    {
      title: "Thinking — four modes",
      description: "Particles that blend like liquid. Pick the mode by what is happening; agentic modes wear the AI spectrum.",
      render: () => (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {([
            ["basic", "Basic logic", "No agent involved"],
            ["retrieving", "Retrieving", "Recalling from memory"],
            ["generating", "Generating", "Creating — the orb shape-shifts"],
            ["searching", "Searching", "Looking things up"],
          ] as const).map(([mode, title, sub]) => (
            <Stack key={mode} gap="sm" align="center" className="text-center">
              <Thinking mode={mode} size="xl" label={title} tone={mode === "basic" ? "brand" : undefined} />
              <Stack gap="none" align="center"><Text variant="headline">{title}</Text><Text variant="caption" tone="muted">{sub}</Text></Stack>
            </Stack>
          ))}
        </div>
      ),
    },
    { title: "Sizes", render: () => <Inline gap="xl" align="end"><Thinking mode="generating" size="sm" /><Thinking mode="generating" size="md" /><Thinking mode="generating" size="lg" /><Thinking mode="generating" size="xl" /><Thinking mode="generating" size="2xl" /></Inline> },
    { title: "Overlay (blocks a region)", render: () => <div className="relative h-40 rounded-md bg-layer-1 p-4"><Text tone="muted">Region content</Text><Loading overlay mode="retrieving" label="Loading report" /></div> },
    { title: "Skeleton (preferred)", render: () => <Stack gap="md" className="max-w-md"><Inline gap="sm"><Skeleton shape="circle" className="size-10" /><Stack gap="xs" className="flex-1"><Skeleton shape="text" className="w-1/2" /><Skeleton shape="text" className="w-1/3" /></Stack></Inline><SkeletonText lines={4} /><Skeleton className="h-32" /></Stack> },
  ],
  "components/inline-loading": [{ title: "Save lifecycle", render: () => <InlineLoadingDemo /> }],
  "components/notification": [
    {
      title: "Inline — four kinds",
      render: () => (
        <Stack gap="sm">
          <InlineNotification kind="info" title="Scheduled maintenance" subtitle="Sunday 02:00–03:00 CET" onClose={() => {}} />
          <InlineNotification kind="success" title="Instructions published" subtitle="Live runs use them from now on." onClose={() => {}} />
          <InlineNotification kind="warning" title="2 tools need re-authorising" subtitle="Agents can't use them until you reconnect." action={{ label: "Reconnect tools", onClick: () => {} }} />
          <InlineNotification kind="error" title="Couldn't sync the help center" subtitle="Last successful sync 2 hours ago." action={{ label: "Retry", onClick: () => {} }} />
        </Stack>
      ),
    },
    {
      title: "Toast banners",
      description: "Top-right, frosted glass. With an icon tile, without one, or time-sensitive.",
      render: () => (
        <Inline wrap>
          <Button variant="secondary" onClick={() => toast({ icon: Bot, source: "Vita", title: "Agent deployed", subtitle: "Support triage is live and answering tickets." })}>With icon</Button>
          <Button variant="secondary" onClick={() => toast({ icon: false, title: "Link copied", subtitle: "Anyone in the workspace can open it." })}>Without icon</Button>
          <Button variant="secondary" onClick={() => toast({ icon: Time, eyebrow: "Time sensitive", source: "Approvals", title: "Refund over $200 waiting", subtitle: "Refund assistant needs your approval within 10 minutes.", action: { label: "Review", onClick: () => {} }, duration: 8000 })}>Time sensitive</Button>
          <Button variant="secondary" onClick={() => toast({ kind: "success", title: "Agent paused", subtitle: "It stops taking new conversations.", action: { label: "Undo", onClick: () => toast({ kind: "info", title: "Restored" }) }, duration: 8000 })}>With undo</Button>
        </Inline>
      ),
    },
    { title: "Callout", render: () => <Callout kind="info" title="How agents use knowledge">Agents only answer from the sources you connect. Anything outside them is handed to a person.</Callout> },
  ],
  "components/capsule": [
    {
      title: "Capsule — quick feedback, top centre",
      description: "Always: icon left · title and subtitle centre · the semantic story right.",
      render: () => <CapsuleDemo />,
    },
  ],
  "components/progress-bar": [{ title: "Determinate, indeterminate, finished, error, quota", render: () => <ProgressDemo /> }],
  "components/progress-indicator": [{ title: "Horizontal & vertical", render: () => <StepsDemo /> }],
  "components/modal": [{ title: "Modal types", render: () => <ModalDemo /> }],
  "components/popover": [
    {
      title: "Popover & toggletip",
      render: () => (
        <Inline gap="lg">
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary">Edit columns</Button></PopoverTrigger>
            <PopoverContent>
              <Stack gap="sm"><Text variant="headline">Visible columns</Text><Checkbox label="Team" defaultChecked /><Checkbox label="Model" defaultChecked /><Checkbox label="Runs (24h)" /></Stack>
            </PopoverContent>
          </Popover>
          <Inline gap="2xs"><Text>Confidence threshold</Text><Toggletip>Below this score the agent hands the conversation to a person instead of answering. <Link inline href="#">Learn more</Link></Toggletip></Inline>
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost">Assign</Button></PopoverTrigger>
            <PopoverContent caret><Dropdown label="Owner" items={[{ value: "a", label: "Ada" }, { value: "g", label: "Grace" }]} /><PopoverFooter><Button>Assign</Button></PopoverFooter></PopoverContent>
          </Popover>
        </Inline>
      ),
    },
  ],
  "components/tooltip": [
    {
      title: "Icon tooltip, definition tooltip, placements",
      render: () => (
        <Stack gap="lg">
          <Inline gap="sm">{(["top", "right", "bottom", "left"] as const).map((s) => <IconButton key={s} icon={Chat} label={`Tooltip ${s}`} tooltipSide={s} variant="secondary" />)}</Inline>
          <Text>Each agent has a <DefinitionTooltip term="guardrail" definition="A rule the agent can never break, checked before every action." /> set by the workspace owner.</Text>
          <Tooltip content="Only text. Never interactive."><Button variant="ghost">Hover me</Button></Tooltip>
        </Stack>
      ),
    },
  ],
  "components/ui-shell-header": [{ title: "Header with nav and global actions", render: () => <ShellDemo /> }],
  "components/ui-shell-left-panel": [{ title: "Expanded side nav", render: () => <ShellDemo /> }, { title: "Rail (hover to expand)", render: () => <ShellDemo rail /> }],
  "components/ui-shell-right-panel": [
    { title: "Notifications panel", render: () => <ShellDemo right /> },
    { title: "Editing in context, with a primary action", render: () => <ShellDemo edit /> },
  ],
}
