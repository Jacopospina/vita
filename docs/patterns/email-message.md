---
title: Email message
summary: One email, read or reviewed in place. Subject, sender, recipients and message; when an agent drafted it, a provenance header says so and carries the actions.
status: experimental
import: "import { EmailMessage } from \"@/components/vita/blocks/email-message\""
use_when:
  - Reviewing an email an agent drafted before it's sent
  - Showing a sent or received email inside a product (a thread, an activity log)
avoid_when:
  - A chat turn → ChatBubble
  - Writing an email from scratch → Form with a TextArea, or Composer
related: [avatar, ai-label, chat-bubble, composer]
---

## Anatomy

- **Provenance header** (when `draftedBy` is set). Sofia, "Drafted by {agent}" in the AI spectrum, and the actions (Edit, Send).
- **Subject and time.** The subject leads; the time sits top right.
- **Sender.** Avatar, name and address.
- **Recipients.** To always; Cc and Bcc only when they have recipients.
- **Message.** The body, after a hairline.

## Rules

1. **Say who wrote it.** An agent's draft always carries the provenance header; a person's message never does.
2. **Cc and Bcc appear only when used.** With `editableRecipients`, "Cc" and "Bcc" sit at the end of the To line; choosing one unfolds its line and focuses the field. Each added line has its own × to remove it, and it folds away.
3. **The decision lives in the header.** Send is the primary action; Edit steps down. Nothing to decide, no header actions.
4. **No shadow.** It sits on the page with a hairline, like every card.
