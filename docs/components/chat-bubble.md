---
title: Chat bubble
summary: One message in a conversation between a person and an agent. Agent on the left, the person on the right; runs from the same author join.
status: stable
import: "import { ChatThread, ChatBubble, ChatTyping, MiniChat } from \"@/components/corpus/chat\"\n\n<ChatThread messages={messages} typing=\"Thinking\" />"
use_when:
  - A conversation between a person and an agent, or between people
  - Showing what an agent said and when, in order
avoid_when:
  - A long AI answer inside a page → AISurface
  - A system notice ("Handed to Billing") → InlineNotification
  - Comments on a document → a list of comments, not bubbles
related: [agent-conversation, ai-label, composer, thinking]
---

## Parts

| Part | What it is |
|---|---|
| `ChatBubble` | One message: `role` agent or user, `author`, `time`, `status` (sending, sent, failed) |
| `ChatThread` | The column of messages. Runs from the same author join automatically |
| `ChatTyping` | The agent is thinking: Sofia inside a bubble, with what it's doing |
| `MiniChat` | A compact agent panel: header with status, thread, composer |

## Rules

1. **Sides mean authors.** The agent is always on the left on a neutral surface; the person is always on the right in brand colour. Never put an avatar beside a bubble: the side and the author line say who wrote it.
2. **Belonging joins messages.** Consecutive messages from one author sit close, their inner corners tighten, and only the last shows the author and time.
3. **Thinking, not dots.** While the agent works, show `ChatTyping` with what it's doing ("Searching the help center"), never bouncing dots.
4. **Failures stay in place.** A message that didn't send stays in the thread with "Not sent" and a Retry; never a toast.
5. **Sending is one motion.** The text you typed becomes its bubble: the bubble forms around the words right in the composer, then travels to its place in the thread. It flies above everything, so it never appears from behind the input.
6. **Pinned to now.** The conversation stays at the latest message without scrolling, unless the person scrolls up to read history.
7. **Motion.** The agent's messages spring in from their side; the thread glides to make room.
