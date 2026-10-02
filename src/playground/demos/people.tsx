import * as React from "react"
import type { DemoMap } from "./types"
import { CircleDash, Incomplete, CheckmarkFilled, ArrowUp, Edit } from "@/registry/icons"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Icon } from "@/registry/ui/icon"
import { Tile } from "@/registry/ui/tile"
import { Button, IconButton } from "@/registry/ui/button"
import { Menu, MenuTrigger, MenuContent, MenuRadioGroup, MenuRadioItem } from "@/registry/ui/menu"
import { Avatar } from "@/registry/ui/avatar"
import { EmailMessage } from "@/registry/ui/email-message"
import { StructuredList } from "@/registry/ui/structured-list"
import { toast } from "@/registry/ui/notification"

/* The Card pattern, composed only of components: Tile (elevated) + Icon + Text. No card component exists. */
function WorkCard({ icon, tone, title, id, time }: { icon: typeof CircleDash; tone: string; title: string; id: string; time: string }) {
  return (
    // A card sits on the page with a hairline, never a shadow.
    <Tile className="flex flex-col gap-2 border border-border-subtle bg-raised p-3 pb-2.5">
      <Inline gap="xs">
        <Icon as={icon} className={tone} />
        <Text weight="medium">{title}</Text>
      </Inline>
      <Inline gap="sm">
        <Text variant="caption" tone="muted">{id}</Text>
        <Text variant="caption" tone="muted" aria-hidden>•</Text>
        <Text variant="caption" tone="muted">{time}</Text>
      </Inline>
    </Tile>
  )
}

const statuses = [
  { value: "todo", label: "Not started", icon: CircleDash, tone: "text-muted-foreground" },
  { value: "doing", label: "In progress", icon: Incomplete, tone: "text-info" },
  { value: "done", label: "Done", icon: CheckmarkFilled, tone: "text-success" },
] as const

/** The same card, with a status you can change: the glyph is a button that opens the statuses; it redraws on change.
    Its tooltip just names the status: the pointer and the hover state already say it can be clicked. */
function StatusCard({ title, id, time, initial }: { title: string; id: string; time: string; initial: (typeof statuses)[number]["value"] }) {
  const [status, setStatus] = React.useState<string>(initial)
  const s = statuses.find((x) => x.value === status) ?? statuses[0]
  return (
    <Tile className="flex flex-col gap-2 border border-border-subtle bg-raised p-3 pb-2.5">
      <Inline gap="xs">
        <Menu>
          <MenuTrigger asChild>
            <IconButton icon={s.icon} label={s.label} size="sm" className={`-m-1 size-6 ${s.tone}`} />
          </MenuTrigger>
          <MenuContent>
            <MenuRadioGroup value={status} onValueChange={setStatus}>
              {statuses.map((x) => (
                <MenuRadioItem key={x.value} value={x.value}>
                  <span className="flex items-center gap-2"><Icon as={x.icon} className={x.tone} />{x.label}</span>
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
        <Text weight="medium">{title}</Text>
      </Inline>
      <Inline gap="sm">
        <Text variant="caption" tone="muted">{id}</Text>
        <Text variant="caption" tone="muted" aria-hidden>•</Text>
        <Text variant="caption" tone="muted">{time}</Text>
      </Inline>
    </Tile>
  )
}

function EmailDemo({ drafted = true }: { drafted?: boolean }) {
  const [cc, setCc] = React.useState<string[]>([])
  const [bcc, setBcc] = React.useState<string[]>([])
  return (
    <EmailMessage
      className="max-w-lg"
      subject="Re: Access for the new team, by Friday?"
      from={{ name: "Indie Novak", email: "indie@theo.ai" }}
      to={["sam.reyes@theo.ai"]}
      cc={cc}
      bcc={bcc}
      onCcChange={setCc}
      onBccChange={setBcc}
      editableRecipients
      time="Now"
      draftedBy={drafted ? "Request assistant" : undefined}
      actions={drafted ? (
        <>
          <Button variant="ghost" size="sm" icon={Edit}>Edit</Button>
          <Button size="sm" icon={ArrowUp} onClick={() => toast({ kind: "success", title: "Reply sent", subtitle: "sam.reyes@theo.ai" })}>Send</Button>
        </>
      ) : undefined}
    >
      {/* The agent read a free-text request and turned it into fields the person can confirm before anything happens. */}
      <Stack gap="sm">
        <Text>Hi Sam,</Text>
        <Text>Here's what I understood from your request. Reply to confirm, or correct anything below.</Text>
        <StructuredList
          flush
          condensed
          label="Request, as understood"
          columns={["Field", "Value"]}
          rows={[
            { id: "type", cells: ["Request", "Workspace access"] },
            { id: "who", cells: ["People", "Lena Ortiz, Omar Haddad, Mei Chen"] },
            { id: "where", cells: ["Workspace", "Support"] },
            { id: "role", cells: ["Role", "Editor"] },
            { id: "when", cells: ["Needed by", "Friday, 4 October"] },
            { id: "approver", cells: ["Approver", "Ada Lovelace"] },
          ]}
        />
        <Text>Indie</Text>
      </Stack>
    </EmailMessage>
  )
}

export const peopleDemos: DemoMap = {
  "components/avatar": [
    {
      title: "Three sizes",
      description: "Initials on a soft grey gradient when there's no photo: sm 24, md 32, lg 40.",
      render: () => <Inline gap="lg" align="end"><Avatar name="Indie Novak" size="sm" /><Avatar name="Indie Novak" /><Avatar name="Indie Novak" size="lg" /></Inline>,
    },
    {
      title: "In a list",
      render: () => (
        <Stack gap="sm" className="max-w-xs">
          {[["Ada Lovelace", "Owner"], ["Grace Hopper", "Editor"], ["Alan Turing", "Viewer"]].map(([n, r]) => (
            <Inline key={n} gap="sm"><Avatar name={n} size="sm" /><Text className="flex-1">{n}</Text><Text variant="caption" tone="muted">{r}</Text></Inline>
          ))}
        </Stack>
      ),
    },
  ],
  "components/email-message": [
    { title: "Drafted by an agent", description: "The agent read a free-text request and turned it into structured fields to confirm. The header names the agent and carries the actions; add Cc or Bcc from the To line, remove them with ×.", render: () => <EmailDemo /> },
    { title: "Without the header", description: "A message people wrote: no provenance, no header.", render: () => <EmailDemo drafted={false} /> },
  ],
  "patterns/cards": [
    {
      title: "Work cards",
      description: "Composed, not a component: a Tile with a hairline border (no shadow), a status Icon and Text. The status glyph comes first, then the title; the ID and time sit beneath.",
      render: () => (
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          <WorkCard icon={CircleDash} tone="text-muted-foreground" title="Review refund policy" id="THEO-128" time="Today, 09:41" />
          <WorkCard icon={Incomplete} tone="text-info" title="Index the help center" id="THEO-131" time="Today, 10:05" />
          <WorkCard icon={CheckmarkFilled} tone="text-success" title="Deploy support triage" id="THEO-117" time="Yesterday" />
        </div>
      ),
    },
    {
      title: "Status you can change",
      description: "Click the status glyph: the statuses open as a menu, and the glyph redraws when you pick one.",
      render: () => (
        <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
          <StatusCard title="Review refund policy" id="THEO-128" time="Today, 09:41" initial="todo" />
          <StatusCard title="Index the help center" id="THEO-131" time="Today, 10:05" initial="doing" />
          <StatusCard title="Deploy support triage" id="THEO-117" time="Yesterday" initial="done" />
        </div>
      ),
    },
  ],
}
