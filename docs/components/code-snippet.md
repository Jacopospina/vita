---
title: Code snippet
summary: Code, commands and identifiers the user will copy. Copying is one click, with instant feedback.
status: stable
import: "import { CodeSnippet } from \"@/components/corpus/code-snippet\""
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
- **single**: one line, horizontally scrollable, with a copy button.
- **multi**: a block. It collapses after `maxCollapsedLines` (default 12) with a "Show more" toggle.

## Rules

1. **Copy feedback** is the icon morphing to a checkmark plus a "Copied" tooltip for 1.5s. No toast.
2. **Show exactly what should be pasted.** No `$` prompts, no trailing comments the user would have to delete.
3. **Surface:** `layer-1` background, mono `footnote` size. No syntax-theme colors outside docs.
