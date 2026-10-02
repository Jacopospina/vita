---
title: Avatar
summary: A person, at a glance. Their photo when there is one, otherwise their initials, white on a soft grey gradient. Three sizes.
status: experimental
import: "import { Avatar } from \"@/components/vita/avatar\""
use_when:
  - Showing who wrote, sent, owns or is assigned something (messages, lists, comments, headers)
avoid_when:
  - An agent, an app or a system → IconPlaceholder
  - The AI working → Thinking
related: [email-message, icon-placeholder, list-item]
---

## Sizes

| | Size | Use |
|---|---|---|
| `sm` | 24px | Dense rows, mentions, assignees |
| `md` | 32px | Messages, list items (default) |
| `lg` | 40px | Headers, profiles |

## Rules

1. **People only.** An avatar always means a person; agents and apps use an IconPlaceholder, so nobody mistakes software for a colleague.
2. **Initials, then photo.** Two initials (first and last name) show at once; the photo fades in over them when it loads and never leaves a broken image.
3. **Always named.** The name is the avatar's accessible name; next to text that already says the name, it's still announced once.
