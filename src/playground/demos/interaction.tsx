import * as React from "react"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button, ButtonSet } from "@/registry/ui/button"
import { Composer } from "@/registry/ui/composer"
import { Tag } from "@/registry/ui/tag"
import { TextInput } from "@/registry/ui/text-input"
import { Select, SelectOption } from "@/registry/ui/select"
import { AISurface, AILabel } from "@/registry/ui/ai-label"
import { ProgressIndicator } from "@/registry/ui/progress-indicator"
import { InlineLoading } from "@/registry/ui/loading"
import { toast } from "@/registry/ui/notification"




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
