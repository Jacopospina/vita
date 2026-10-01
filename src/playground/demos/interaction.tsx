import * as React from "react"
import { Copy, Download, Share, Edit } from "@/registry/icons"
import type { DemoMap } from "./types"
import { Stack, Inline, Group } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, IconButton, ButtonSet } from "@/registry/ui/button"
import { Kbd } from "@/registry/ui/kbd"
import { Composer } from "@/registry/ui/composer"
import { Tag } from "@/registry/ui/tag"
import { TextInput } from "@/registry/ui/text-input"
import { Select, SelectOption } from "@/registry/ui/select"
import { AISurface, AILabel } from "@/registry/ui/ai-label"
import { ProgressIndicator } from "@/registry/ui/progress-indicator"
import { InlineLoading } from "@/registry/ui/loading"
import { toast } from "@/registry/ui/notification"
import { LEFT_HAND_KEYS, useShortcut } from "@/registry/hooks/use-shortcut"
import { cn } from "@/registry/lib/utils"

const rows = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
]

function KeyboardMap() {
  const [pressed, setPressed] = React.useState<string | null>(null)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => setPressed(e.key.toLowerCase())
    const up = () => setPressed(null)
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])
  const extra = new Set(["escape", "shift", "caps", "mod"])
  return (
    <Stack gap="md">
      <Stack gap="none" className="w-fit overflow-hidden rounded-lg border border-border-subtle">
        <Group className="*:rounded-none">
          {["esc"].map((k) => (
            <span key={k} className={cn("flex h-10 w-16 items-center justify-center border-r border-b border-border-subtle font-mono text-caption", "bg-primary text-primary-foreground", pressed === "escape" && "scale-95")}>{k}</span>
          ))}
          <span className="flex-1 border-b border-border-subtle bg-layer-1" />
        </Group>
        {rows.map((r, i) => (
          <Group key={i} className="*:rounded-none">
            {r.map((k, j) => {
              const left = LEFT_HAND_KEYS.has(k) || extra.has(k)
              return (
                <span
                  key={j}
                  className={cn(
                    "flex h-10 min-w-10 items-center justify-center border-r border-b border-border-subtle px-2 font-mono text-caption duration-fast-01",
                    left ? "bg-primary-subtle text-selected-foreground" : "bg-layer-1 text-disabled-foreground",
                    pressed === k && "scale-95 bg-primary text-primary-foreground",
                    (k === "enter" || k === "shift" || k === "caps" || k === "tab") && "min-w-16",
                  )}
                >
                  {k}
                </span>
              )
            })}
          </Group>
        ))}
        <Group className="*:rounded-none">
          <span className="flex h-10 w-20 items-center justify-center border-r border-border-subtle bg-primary-subtle font-mono text-caption text-selected-foreground">⌘ / ctrl</span>
          <span className={cn("flex h-10 flex-1 items-center justify-center bg-primary-subtle font-mono text-caption text-selected-foreground", pressed === " " && "scale-99")}>space</span>
        </Group>
      </Stack>
      <Inline gap="md" wrap>
        <Inline gap="2xs"><span className="size-3 rounded-sm bg-primary-subtle" /><Text variant="caption" tone="muted">Left hand — shortcuts allowed</Text></Inline>
        <Inline gap="2xs"><span className="size-3 rounded-sm bg-layer-1" /><Text variant="caption" tone="muted">Right hand — belongs on the mouse</Text></Inline>
        <Text variant="caption" tone="muted">Press any key to see where it lives.</Text>
      </Inline>
    </Stack>
  )
}

function ShortcutsDemo() {
  const [log, setLog] = React.useState("Try ⌘S, ⌘E or ⌘D")
  useShortcut("mod+d", () => setLog("Duplicated"))
  return (
    <Stack gap="md">
      <Inline gap="md" wrap>
        <ButtonSet>
          <Button variant="secondary" shortcut="mod+e" onClick={() => setLog("Editing")}>Edit</Button>
          <Button shortcut="mod+s" onClick={() => setLog("Saved")}>Save</Button>
        </ButtonSet>
        <IconButton icon={Copy} label="Duplicate" shortcut="mod+d" onClick={() => setLog("Duplicated")} />
      </Inline>
      <Inline gap="xs"><Kbd keys="mod+s" /><Kbd keys="mod+e" /><Kbd keys="mod+d" /><Kbd keys="escape" /><Text tone="muted">→ {log}</Text></Inline>
    </Stack>
  )
}

export function IntentFlow() {
  const [stage, setStage] = React.useState<"ask" | "thinking" | "review">("ask")
  const [ask, setAsk] = React.useState("")
  return (
    <Stack gap="lg" className="max-w-2xl">
      <ProgressIndicator steps={[{ label: "Describe" }, { label: "Review" }, { label: "Deploy" }]} current={stage === "review" ? 1 : 0} />
      {stage !== "review" ? (
        <Stack gap="sm">
          <Text variant="title-3">What should your agent do?</Text>
          <Composer
            size="lg"
            placeholder="e.g. Answer refund questions from our help center and hand off anything over $200"
            suggestions={["Triage support tickets in Zendesk", "Summarise sales calls into Salesforce", "Answer HR policy questions in Slack"]}
            loading={stage === "thinking"}
            onSubmit={(v) => {
              setAsk(v)
              setStage("thinking")
              setTimeout(() => setStage("review"), 1400)
            }}
          />
          {stage === "thinking" && <InlineLoading description="Drafting your agent" />}
        </Stack>
      ) : (
        <AISurface className="flex flex-col gap-4 p-6">
          <Inline gap="xs"><AILabel size="sm" title="Drafted from your request">Built from: “{ask}”. Knowledge and tools were matched to your workspace.</AILabel><Text variant="title-3">Review your agent</Text></Inline>
          <TextInput label="Name" defaultValue="Refund assistant" />
          <TextInput label="Instructions" defaultValue="Answer refund questions using the help center. Hand off to Support when the amount is over $200." />
          <Select label="Knowledge" defaultValue="help"><SelectOption value="help">Help center (412 articles)</SelectOption></Select>
          <Inline gap="xs"><Tag>Zendesk</Tag><Tag>Slack</Tag><Text variant="footnote" tone="muted">Tools</Text></Inline>
          <ButtonSet>
            <Button variant="secondary" onClick={() => setStage("ask")}>Change request</Button>
            <Button shortcut="mod+s" onClick={() => { toast({ kind: "success", title: "Agent deployed", subtitle: "Refund assistant is live" }); setStage("ask") }}>Deploy agent</Button>
          </ButtonSet>
        </AISurface>
      )}
    </Stack>
  )
}

export const interactionDemos: DemoMap = {
  "getting-started/interaction": [
    { title: "One hand per device", description: "Corpus shortcuts live on the left half of the keyboard; the right hand stays on the mouse.", render: () => <KeyboardMap /> },
    { title: "Shortcuts on real controls", description: "Buttons take a `shortcut` prop: it binds the key, announces it and shows it in tooltips.", render: () => <ShortcutsDemo /> },
    {
      title: "Belonging has no gaps",
      render: () => (
        <Stack gap="lg">
          <ButtonSet><Button variant="tertiary" icon={Download}>Export</Button><Button variant="tertiary" icon={Copy}>Duplicate</Button><Button variant="tertiary" icon={Share}>Share</Button></ButtonSet>
          <Group><Button variant="secondary" icon={Edit}>Edit</Button><Button>Deploy agent</Button></Group>
        </Stack>
      ),
    },
    { title: "Intent over input", description: "Say it, review it, ship it — one composer instead of a twelve-field form.", render: () => <IntentFlow /> },
  ],
  "components/composer": [
    {
      title: "Composer",
      description: "Type, dictate or attach. Suggestions fill it with one click.",
      render: () => (
        <div className="max-w-2xl">
          <Composer suggestions={["Create a support agent", "Connect Slack", "Show failed runs today"]} onSubmit={(v) => toast({ kind: "success", title: "Sent", subtitle: v })} />
        </div>
      ),
    },
    { title: "Large, text only", render: () => <div className="max-w-2xl"><Composer size="lg" voice={false} attachments={false} placeholder="Ask about your agents" onSubmit={() => {}} /></div> },
  ],
  "patterns/intent-first": [{ title: "Describe → review → deploy", render: () => <IntentFlow /> }],
}
