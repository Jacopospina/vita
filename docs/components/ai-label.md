---
title: AI label
summary: Marks anything generated, suggested or autofilled by AI, and explains how, in one click.
status: stable
import: "import { AILabel, AISurface } from \"@/components/corpus/ai-label\""
use_when:
  - A field value, cell, tile or message was produced or changed by AI
  - An AI-powered feature needs a visible, explainable marker
avoid_when:
  - Branding or marketing flair → the AI gradient is reserved for AI provenance
  - Content that a human reviewed and edited → remove the label once a human takes ownership, or show "Edited"
related: [tooltip, popover, notification]
---

## Anatomy

- **AILabel**: an "AI" chip with a gradient border. Click opens an explainability popover covering what the model did, confidence, sources and model name.
- **AISurface**: a container with the AI gradient border and a subtle tint, for generated blocks (a suggested reply, a summary).
- **Revert**: when AI overwrote a user value, `onRevert` offers "Revert to AI input" / "Restore my value".

## Tone

- **Alone → rainbow.** A standalone label wears the full spectrum outline.
- **In context → muted.** Inside a field, notification, tile or AI surface it turns white at low opacity with a quiet outline, so it doesn't compete. Automatic; force with `tone="spectrum" | "muted"`.

## Sizes

- `xs`: next to field labels and in table cells.
- `sm`: tiles and cards.
- `md`: section headers.

## Rules

1. **Transparency is mandatory.** Every AI-produced value the user might rely on carries a label. No silent AI.
2. **Explain in human terms:** what was done, from what source, and how sure the model is ("Extracted from the sender's signature · 92% confidence").
3. **The user stays in control.** AI suggestions are editable, rejectable and revertible. Never auto-submit AI output.
4. **The rainbow means AI, and only AI.** The slowly rotating full-spectrum outline (`ai-gradient-border`) is reserved for AI provenance. Never use `ai-*` tokens for anything else.
5. **Copy:** don't anthropomorphise. Write "Suggested reply", not "I wrote this for you".
