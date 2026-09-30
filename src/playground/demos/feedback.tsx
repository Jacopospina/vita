import * as React from "react"
import { Notification, Help, Search as SearchIcon, UserAvatar, Dashboard, Delivery, Document, Settings, Chat } from "@/registry/icons"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, IconButton } from "@/registry/ui/button"
import { Loading, InlineLoading, Skeleton, SkeletonText } from "@/registry/ui/loading"
import { InlineNotification, Callout, toast } from "@/registry/ui/notification"
import { ProgressBar } from "@/registry/ui/progress-bar"
import { ProgressIndicator } from "@/registry/ui/progress-indicator"
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalClose, ConfirmModal } from "@/registry/ui/modal"
import { Popover, PopoverTrigger, PopoverContent, Toggletip } from "@/registry/ui/popover"
import { Tooltip, DefinitionTooltip } from "@/registry/ui/tooltip"
import { TextInput } from "@/registry/ui/text-input"
import { Dropdown } from "@/registry/ui/dropdown"
import { Checkbox } from "@/registry/ui/checkbox"
import { Shell, ShellBody, ShellMain, Header, HeaderNavItem, HeaderGlobalAction, LeftPanel, SideNavItem, SideNavSection, SideNavMenu, RightPanel } from "@/registry/ui/ui-shell"
import { Tile } from "@/registry/ui/tile"
import { Link } from "@/registry/ui/link"

function InlineLoadingDemo() {
  const [status, setStatus] = React.useState<"inactive" | "active" | "finished" | "error">("inactive")
  return (
    <Inline gap="md">
      <Button variant="secondary" disabled={status === "active"} onClick={() => { setStatus("active"); setTimeout(() => setStatus("finished"), 1500); setTimeout(() => setStatus("inactive"), 3500) }}>Save draft</Button>
      <InlineLoading status={status} description={status === "active" ? "Saving…" : status === "finished" ? "Saved" : undefined} />
      <InlineLoading status="error" description="Couldn't save. Retry?" />
    </Inline>
  )
}

function ProgressDemo() {
  const [v, setV] = React.useState(35)
  return (
    <Stack gap="lg" className="max-w-md">
      <ProgressBar label="Uploading rate-card.pdf" value={v} helperText={`${v}% · about 20 seconds left`} />
      <Inline><Button size="sm" variant="secondary" onClick={() => setV((x) => Math.min(100, x + 15))}>Advance</Button></Inline>
      <ProgressBar label="Preparing workspace" helperText="This usually takes under a minute" />
      <ProgressBar label="Import complete" status="finished" helperText="1,240 lanes imported" />
      <ProgressBar label="Import failed" value={62} status="error" helperText="Row 812 has an invalid postcode" />
      <ProgressBar label="Seats used" value={7} max={10} size="sm" helperText="7 of 10 seats" />
    </Stack>
  )
}

function StepsDemo() {
  const [cur, setCur] = React.useState(2)
  const steps = [{ label: "Route", secondaryLabel: "Rotterdam → Milan" }, { label: "Cargo" }, { label: "Carrier" }, { label: "Review" }, { label: "Confirm" }]
  return (
    <Stack gap="xl">
      <ProgressIndicator steps={steps} current={cur} onStepClick={setCur} />
      <Inline><Button size="sm" variant="secondary" disabled={cur === 0} onClick={() => setCur(cur - 1)}>Back</Button><Button size="sm" disabled={cur === steps.length - 1} onClick={() => setCur(cur + 1)}>Next</Button></Inline>
      <div className="max-w-xs"><ProgressIndicator vertical steps={[{ label: "Account" }, { label: "Company", invalid: true, secondaryLabel: "VAT number missing" }, { label: "Billing" }]} current={1} /></div>
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
          <ModalHeader label="Quote Q-2041" title="Send quote to customer" description="The customer gets an email with a link to accept." />
          <ModalBody><Stack gap="md"><TextInput label="Recipient" defaultValue="buyer@acme.com" /><Checkbox label="Send me a copy" defaultChecked /></Stack></ModalBody>
          <ModalFooter><ModalClose asChild><Button variant="secondary">Cancel</Button></ModalClose><Button onClick={() => toast({ kind: "success", title: "Quote sent", subtitle: "buyer@acme.com" })}>Send quote</Button></ModalFooter>
        </ModalContent>
      </Modal>
      <Modal>
        <ModalTrigger asChild><Button variant="secondary">Passive modal</Button></ModalTrigger>
        <ModalContent size="xs"><ModalHeader title="Keyboard shortcuts" /><ModalBody><Text tone="muted">Press ⌘K to search, N to create.</Text></ModalBody></ModalContent>
      </Modal>
      <Modal>
        <ModalTrigger asChild><Button variant="tertiary">Large, scrolling</Button></ModalTrigger>
        <ModalContent size="lg"><ModalHeader title="Terms of carriage" /><ModalBody scroll className="max-h-80">{Array.from({ length: 12 }).map((_, i) => <Text key={i} className="mb-4">Clause {i + 1}. The carrier shall deliver the goods to the consignee in the condition received, subject to the limits of liability set out herein.</Text>)}</ModalBody><ModalFooter><ModalClose asChild><Button>Done</Button></ModalClose></ModalFooter></ModalContent>
      </Modal>
      <Button variant="secondary" onClick={() => setConfirm(true)}>Confirm</Button>
      <Button variant="danger-tertiary" onClick={() => setDanger(true)}>Danger modal</Button>
      <ConfirmModal open={confirm} onOpenChange={setConfirm} title="Publish rate card?" description="Customers will see the new prices on quotes created from now on." confirmLabel="Publish rate card" onConfirm={() => setConfirm(false)} />
      <ConfirmModal danger open={danger} onOpenChange={setDanger} title="Delete 3 shipments?" description="This removes them for everyone and can't be undone." confirmLabel="Delete shipments" onConfirm={() => { setDanger(false); toast({ kind: "success", title: "3 shipments deleted" }) }} />
    </Inline>
  )
}

export function ShellDemo({ rail, right }: { rail?: boolean; right?: boolean }) {
  const [open, setOpen] = React.useState(!!right)
  return (
    <div className="h-120 overflow-hidden rounded-lg border border-border-subtle [&>div]:h-full">
      <Shell>
        <Header productName="Vita" actions={<><HeaderGlobalAction icon={SearchIcon} label="Search" /><HeaderGlobalAction icon={Notification} label="Notifications" badge active={open} onClick={() => setOpen((o) => !o)} /><HeaderGlobalAction icon={Help} label="Help" /><HeaderGlobalAction icon={UserAvatar} label="Account" /></>}>
          <HeaderNavItem href="#" active>Quotes</HeaderNavItem>
          <HeaderNavItem href="#">Shipments</HeaderNavItem>
          <HeaderNavItem href="#">Reports</HeaderNavItem>
        </Header>
        <ShellBody>
          <LeftPanel rail={rail}>
            <SideNavSection>
              <SideNavItem href="#" icon={Dashboard} active>Dashboard</SideNavItem>
              <SideNavItem href="#" icon={Delivery}>Shipments</SideNavItem>
              <SideNavMenu icon={Document} title="Documents" defaultOpen={!rail}><SideNavItem href="#">Quotes</SideNavItem><SideNavItem href="#">Invoices</SideNavItem></SideNavMenu>
            </SideNavSection>
            <SideNavSection title="Workspace"><SideNavItem href="#" icon={Settings}>Settings</SideNavItem></SideNavSection>
          </LeftPanel>
          <ShellMain className="p-6"><Stack gap="md"><Text variant="title-2">Dashboard</Text><Tile className="h-32" /><Tile className="h-32" /></Stack></ShellMain>
          <RightPanel open={open} onOpenChange={setOpen} title="Notifications" size="sm">
            <Stack gap="sm">
              <InlineNotification kind="success" title="Quote accepted" subtitle="Acme GmbH · 2 min ago" />
              <InlineNotification kind="warning" title="Rate card expires" subtitle="In 3 days" />
              <InlineNotification kind="info" title="New comment" subtitle="On Q-2041" />
            </Stack>
          </RightPanel>
        </ShellBody>
      </Shell>
    </div>
  )
}

export const feedbackDemos: DemoMap = {
  "components/loading": [
    { title: "Spinner sizes", render: () => <Inline gap="xl"><Loading size="sm" /><Loading size="md" /><Loading size="lg" /></Inline> },
    { title: "Overlay (blocks a region)", render: () => <div className="relative h-40 rounded-md bg-layer-1 p-4"><Text tone="muted">Region content</Text><Loading overlay label="Loading report" /></div> },
    { title: "Skeleton (preferred)", render: () => <Stack gap="md" className="max-w-md"><Inline gap="sm"><Skeleton shape="circle" className="size-10" /><Stack gap="xs" className="flex-1"><Skeleton shape="text" className="w-1/2" /><Skeleton shape="text" className="w-1/3" /></Stack></Inline><SkeletonText lines={4} /><Skeleton className="h-32" /></Stack> },
  ],
  "components/inline-loading": [{ title: "Save lifecycle", render: () => <InlineLoadingDemo /> }],
  "components/notification": [
    {
      title: "Inline — four kinds",
      render: () => (
        <Stack gap="sm">
          <InlineNotification kind="info" title="Scheduled maintenance" subtitle="Sunday 02:00–03:00 CET" onClose={() => {}} />
          <InlineNotification kind="success" title="Rate card published" subtitle="Customers see new prices from now." onClose={() => {}} />
          <InlineNotification kind="warning" title="3 lanes have no carrier" subtitle="Quotes on these lanes will be manual." action={{ label: "Assign carriers", onClick: () => {} }} />
          <InlineNotification kind="error" title="Couldn't sync with the TMS" subtitle="Last successful sync 2 hours ago." action={{ label: "Retry", onClick: () => {} }} />
        </Stack>
      ),
    },
    { title: "Toast", render: () => <Inline wrap><Button variant="secondary" onClick={() => toast({ kind: "success", title: "Quote sent", subtitle: "To buyer@acme.com" })}>Success toast</Button><Button variant="secondary" onClick={() => toast({ kind: "info", title: "Link copied" })}>Info toast</Button><Button variant="secondary" onClick={() => toast({ kind: "success", title: "Shipment archived", action: { label: "Undo", onClick: () => toast({ title: "Restored" }) }, duration: 8000 })}>Toast with undo</Button></Inline> },
    { title: "Callout", render: () => <Callout kind="info" title="How pricing works">Prices come from your active rate card. Surcharges are added at quote time.</Callout> },
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
              <Stack gap="sm"><Text variant="headline">Visible columns</Text><Checkbox label="Customer" defaultChecked /><Checkbox label="Lane" defaultChecked /><Checkbox label="Value" /></Stack>
            </PopoverContent>
          </Popover>
          <Inline gap="2xs"><Text>Chargeable weight</Text><Toggletip>The greater of actual weight and volumetric weight (L×W×H ÷ 5000). <Link inline href="#">Learn more</Link></Toggletip></Inline>
          <Popover>
            <PopoverTrigger asChild><Button variant="ghost">Assign</Button></PopoverTrigger>
            <PopoverContent caret><Stack gap="sm"><Dropdown label="Owner" items={[{ value: "a", label: "Ada" }, { value: "g", label: "Grace" }]} /><Button size="sm">Assign</Button></Stack></PopoverContent>
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
          <Text>Quotes include the <DefinitionTooltip term="BAF" definition="Bunker adjustment factor — a fuel surcharge set by sea carriers." /> unless stated otherwise.</Text>
          <Tooltip content="Only text. Never interactive."><Button variant="ghost">Hover me</Button></Tooltip>
        </Stack>
      ),
    },
  ],
  "components/ui-shell-header": [{ title: "Header with nav and global actions", render: () => <ShellDemo /> }],
  "components/ui-shell-left-panel": [{ title: "Expanded side nav", render: () => <ShellDemo /> }, { title: "Rail (hover to expand)", render: () => <ShellDemo rail /> }],
  "components/ui-shell-right-panel": [{ title: "Notifications panel", render: () => <ShellDemo right /> }],
}
