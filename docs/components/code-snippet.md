---
title: Code snippet
summary: Code, commands and identifiers the user will copy. Copying is one click, with instant feedback.
status: stable
import: "import { CodeSnippet } from \"@/components/vita/code-snippet\""
use_when:
  - Showing commands, API keys, IDs, config the user must copy
  - Displaying code samples in docs/onboarding
avoid_when:
  - Displaying non-copyable monospace data in tables → Text variant="code"
  - Secrets that should be hidden by default → PasswordInput-style reveal + copy
related: [text-input]
---

## Variants

- **inline**: a copyable token within a sentence. The whole token is the copy button.
- **single**: one line, as wide as its text, with Copy right beside it (never across an empty bar). Scrolls sideways only when it outgrows its column.
- **multi**: a block. It collapses after `maxCollapsedLines` (default 12) with a "Show more" toggle.

## Rules

1. **Copy feedback** is the icon morphing to a checkmark and a "Copied" gotcha beside the pointer. No toast, and the tooltip never changes.
2. **Show exactly what should be pasted.** No `$` prompts, no trailing comments the user would have to delete.
3. **Surface:** `layer-1` background, mono `footnote` size. No syntax-theme colors outside docs.
