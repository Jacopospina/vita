import * as React from "react"
import type { DemoMap } from "./types"
import { Stack, Inline } from "@/registry/ui/layout"
import { Text } from "@/registry/ui/text"
import { Button } from "@/registry/ui/button"
import { ChatBubble, ChatThread, ChatTyping, MiniChat, type ChatMessage } from "@/registry/ui/chat"
import { AISurface, AILabel } from "@/registry/ui/ai-label"
import { InlineNotification } from "@/registry/ui/notification"


const replies = [
  "I've checked your order. The refund was approved today and reaches your card within 3–5 working days.",
  "You can change plans at any time; the difference is prorated on your next invoice.",
  "That one needs a person. I've handed it to the Support team; you'll hear back within the hour.",
]

/** A live agent conversation: send a message, Sofia thinks, the agent answers. */
function LiveMiniChat() {
  // An earlier day's exchange, then today's, the day separators sit between them.
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    const d = (daysAgo: number, h: number, m: number) => { const x = new Date(); x.setDate(x.getDate() - daysAgo); x.setHours(h, m, 0, 0); return x }
    return [
      { id: "0a", role: "user", text: "Is my plan renewing this month?", author: "You", at: d(3, 13, 1) },
      { id: "0b", role: "agent", text: "Yes, on the 28th, at the same price.", author: "Support triage", at: d(3, 13, 1) },
      { id: "1", role: "agent", text: "Hi again. What can I help you with today?", author: "Support triage", at: d(0, 9, 40) },
    ]
  })
  const [typing, setTyping] = React.useState(false)
  const turn = React.useRef(0)
  const send = (text: string) => {
    const id = String(Date.now())
    setMessages((m) => [...m, { id, role: "user", text, author: "You", at: new Date(), status: "sent" }])
    setTyping(true)
    window.setTimeout(() => {
      const text = replies[turn.current++ % replies.length] // outside the updater: updaters may run twice
      setTyping(false)
      setMessages((m) => [...m, { id: id + "a", role: "agent", text, author: "Support triage", at: new Date() }])
    }, 1400)
  }
  return <MiniChat agent="Support triage" messages={messages} typing={typing} onSend={send} suggestions={["Where's my refund?", "Can I change plan?", "Talk to a person"]} />
}

export const chatDemos: DemoMap = {
  "components/chat-bubble": [
    {
      title: "A conversation",
      description: "Agent on the left, the person on the right. Messages from the same author join into one group.",
      render: () => (
        <div className="max-w-xl">
          <ChatThread
            messages={[
              { id: "1", role: "user", text: "Hi! Where's my refund for order 4821?", author: "You", time: "09:41" },
              { id: "2", role: "agent", text: "Let me check that for you.", author: "Support triage", time: "09:41" },
              { id: "3", role: "agent", text: "Your refund was approved today. It reaches your card within 3–5 working days.", author: "Support triage", time: "09:41" },
              { id: "4", role: "user", text: "Perfect, thank you!", author: "You", time: "09:42" },
            ]}
          />
        </div>
      ),
    },
    {
      title: "States",
      description: "Thinking (Sofia, never bouncing dots), sending, and failed with a retry.",
      render: () => (
        <Stack gap="md" className="max-w-xl">
          <ChatTyping label="Searching the help center" />
          <ChatBubble role="user" status="sending" author="You">Can I change my plan mid-cycle?</ChatBubble>
          <ChatBubble role="user" status="failed" onRetry={() => {}}>Can I change my plan mid-cycle?</ChatBubble>
        </Stack>
      ),
    },
  ],
  "patterns/agent-conversation": [
    {
      title: "Mini chat",
      description: "A compact agent panel. Send a message: Sofia thinks, then the agent answers.",
      render: () => <LiveMiniChat />,
    },
    {
      title: "Suggested reply, reviewed by a person",
      description: "When an agent drafts for a person to send, show it on an AI surface with its source, the person stays the author.",
      render: () => (
        <AISurface className="max-w-md">
          <Stack gap="sm">
            <Inline gap="xs"><AILabel size="sm">Drafted by Support triage from the article "Refunds".</AILabel><Text weight="semibold">Suggested reply</Text></Inline>
            <Text tone="muted">Hi Sam, your refund for order 4821 was approved today. It should reach your card within 3–5 working days.</Text>
            <Inline gap="sm"><Button size="sm">Use reply</Button><Button size="sm" variant="secondary">Regenerate</Button></Inline>
          </Stack>
        </AISurface>
      ),
    },
    {
      title: "Hand-off to a person",
      description: "When the agent can't help, it says so plainly and passes the conversation on; the thread shows the change.",
      render: () => (
        <Stack gap="md" className="max-w-xl">
          <ChatThread
            messages={[
              { id: "1", role: "user", text: "I was charged twice and need it fixed today.", author: "You", time: "10:02" },
              { id: "2", role: "agent", text: "That needs a person. I've passed your conversation to the Billing team with everything you've told me.", author: "Support triage", time: "10:02" },
            ]}
          />
          <InlineNotification kind="info" title="Handed to Billing" subtitle="Ada from Billing will reply here, usually within 15 minutes." />
        </Stack>
      ),
    },
  ],
}
