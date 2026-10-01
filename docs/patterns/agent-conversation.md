---
title: Agent conversation
summary: How people and agents talk in Corpus — the mini chat, thinking states, suggested replies and hand-offs to a person.
status: stable
use_when:
  - A product lets people talk to an agent (support, onboarding, internal assistants)
  - An agent drafts something a person reviews and sends
avoid_when:
  - The agent's answer is a page section, not a conversation → AISurface
  - A one-shot request that produces a result → Intent-first input
related: [chat-bubble, intent-first, ai-label, composer]
---

## The conversation

1. **Say who's talking.** The panel header names the agent and its status: online, thinking, or handed off.
2. **Start with suggestions.** An empty conversation offers two or three starting messages in the person's words.
3. **Think out loud, briefly.** While the agent works, show what it's doing ("Searching the help center"), not a spinner.
4. **Answer plainly.** Agent messages follow the product's voice: short, specific, no filler, and honest about what the agent did.
5. **Hand off openly.** When the agent can't help, it says so, passes the conversation to a person with the context, and the thread shows the change.

## Agents drafting for people

- **The person stays the author.** A drafted reply appears on an `AISurface` with an `AILabel` naming its source; the person chooses to use it, change it or regenerate it.
- **Never send on their behalf silently.** Sending is always the person's action.

## Don't

- **Don't pretend the agent is a person.** It's named as an agent in the panel header and on its messages.
- **Don't hide failures.** A message that didn't send stays visible with a Retry.
- **Don't add a Cancel button to the panel.** ×, Escape and clicking away close it.
