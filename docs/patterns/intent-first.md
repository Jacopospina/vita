---
title: Intent-first input
summary: Describe, review, approve. The AI turns intent into a prepared result; the user corrects and ships it instead of filling in a form.
status: experimental
import: "import { Composer } from \"@/components/corpus/composer\"\nimport { AISurface, AILabel } from \"@/components/corpus/ai-label\""
use_when:
  - Creating or configuring something with more than ~4 fields
  - Tasks users describe more easily than they fill in (an agent, a report, a rule)
avoid_when:
  - Tiny edits of one value → inline edit
  - Regulated data entry that must be typed exactly → Form
related: [composer, ai-label, forms, dialogs]
---

## The flow

1. **Describe.** One `Composer` with 3 suggestions. Text, voice or files.
2. **Prepare.** `InlineLoading` with what's happening ("Drafting your agent"). No spinner-only screens.
3. **Review.** An `AISurface` with every field prefilled and an `AILabel` explaining how it was derived.
4. **Approve.** One joined action set: a secondary "Change request" and the primary ("Deploy agent", ⌘S).

## Rules

- **Prefill everything.** The user edits; they don't start from blank.
- **Show provenance.** Every AI-filled value can be traced ("Matched from your help center").
- **Keep the request.** "Change request" returns to the composer with the text intact.
- **No Cancel.** Leaving is always possible through navigation, × or Escape.

> [!IMPORTANT] Forms are the fallback. If the AI can't fill it, show the same review surface with empty fields rather than a different form.
