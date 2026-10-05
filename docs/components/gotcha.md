---
title: Gotcha
summary: The tiniest feedback, a small badge beside the pointer ("Copied") that follows it for a moment and fades. It sits where the person is already looking.
status: stable
import: "import { gotcha } from \"@/components/vita/gotcha\"\n\ngotcha(\"Copied\")"
use_when:
  - A small, local action worked and needs one word of acknowledgement (copied, saved, added)
  - The control has no label of its own to change (an icon button)
avoid_when:
  - A result the person may want later, or that landed somewhere else → toast
  - An error → the field's message or an InlineNotification
  - A state the control already shows (a toggle, a selected tab) → nothing
related: [notification, code-snippet, button, tooltip]
---

## Rules

- **Where the eyes are.** It appears just right of the pointer and follows it for about a second and a half, then fades. Near the window's edge it flips to the left.
- **Only when there's no label and no room.** A button with a label shows it in its own state ("Copy link" becomes "Copied"). The gotcha is for when there's no label to change and no space on screen to say it, like an icon button.
- **One word, maybe two.** "Copied", "Saved", "Link copied". A sentence is a toast.
- **Never the only signal for something that matters.** It's an acknowledgement, gone in a moment: anything the person must act on is a toast or a message by the cause.
- **One at a time.** A new gotcha replaces the last one.
- **Mounted with notifications.** `<Toaster />` renders it, so one mount gives both.

## Touch and keyboard

- **Touch.** It appears just above and right of the tap, clear of the finger, and stays put.
- **Keyboard.** It appears beside the focused control.

## Accessibility

- **Announced once.** Screen readers hear the word politely; the badge itself is hidden from them.
- **Calm motion.** It scales in and fades out; under reduced motion it only fades.

## Example

```tsx
<IconButton icon={Copy} label="Copy link" onClick={() => { navigator.clipboard.writeText(url); gotcha("Link copied") }} />
```
