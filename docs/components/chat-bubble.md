---
title: Chat bubble
summary: One message in a conversation between a person and an agent. Agent on the left, the person on the right; runs from the same author join.
status: stable
import: "import { ChatThread, ChatBubble, ChatTyping, MiniChat } from \"@/components/corpus/chat\"\n\n<ChatThread messages={messages} typing />"
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
| `ChatBubble` | One message: `role` agent or user, `time`, `status` (sending, sent, failed); `author` is read by screen readers only |
| `ChatThread` | The column of messages. Runs from the same author join automatically |
| `ChatTyping` | The agent is working: Sofia and a rotating making word ("Sketching…"), as a plain line on the agent's side, not a bubble |
| `MiniChat` | A compact agent panel: header with status, thread, composer |

## Rules

1. **Sides mean authors.** The agent is always on the left on a neutral surface; the person is always on the right in brand colour. No avatars and no names: the side says who wrote it (the name stays for screen readers).
2. **Belonging joins messages.** Consecutive messages from one author sit close, their inner corners tighten, and only the last shows the time.
3. **Days are separators.** When the day changes, a centred caption ("Sunday 13:01", "Today 09:12") sits between the messages with medium space above and below. Pass `at` on each message.
4. **Thinking, not dots.** While the agent works, show `ChatTyping` with what it's doing ("Searching the help center"), never bouncing dots.
5. **Failures stay in place.** A message that didn't send stays in the thread with "Not sent" and a Retry; never a toast.
6. **Sending is one motion.** The text you typed becomes its bubble: the bubble forms around the words right in the composer, then travels to its place in the thread. It flies above everything, so it never appears from behind the input.
7. **Pinned to now.** The conversation stays at the latest message, gliding up as messages arrive (never snapping), unless the person scrolls up to read history.
8. **Motion.** The agent's messages spring in from their side; the thread glides to make room.
