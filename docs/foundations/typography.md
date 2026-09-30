---
title: Typography
summary: Ten typographic roles, generated from one base size and one ratio.
status: stable
import: "import { Text, Heading } from \"@/components/corpus/text\""
use_when:
  - Any text: pick the ROLE (title-2, body, caption), not a size
avoid_when:
  - Tailwind sizes (text-sm, text-2xl) → they don't exist in Corpus
  - Changing font-size to create emphasis inside a paragraph → use font-medium/semibold
---

## Roles

| Role | Utility | Default | Use for | Max per view |
|---|---|---|---|---|
| Display | `text-display` | 50px | Marketing hero | 1 |
| Large title | `text-large-title` | 35px | Top-level page title in content-heavy apps | 1 |
| Title 1 | `text-title-1` | 29px | Page title (product UI) | 1 |
| Title 2 | `text-title-2` | 24px | Section heading | — |
| Title 3 | `text-title-3` | 20px | Subsection, modal and tile titles | — |
| Headline | `text-headline` | 17px semibold | Group labels, list titles, emphasised rows | — |
| Body large | `text-body-lg` | 16px | Long-form reading, onboarding copy | — |
| Body | `text-body` | 14px | Default UI text, table cells, inputs | — |
| Footnote | `text-footnote` | 13px | Field labels, breadcrumbs, secondary info | — |
| Caption | `text-caption` | 12px | Helper text, timestamps, metadata | — |

Sizes are `base × ratio^n`. Change `--corpus-type-base` and `--corpus-type-ratio` in `theme.css`, never individual sizes.

## Rules

1. **Semantic level ≠ visual size.** Use `<Heading level={2}>` for the outline, and `Text variant` only when the visual must differ from the level.
2. **Two weights per screen.**
   - Regular for reading.
   - Semibold for headings and emphasis.
   - `font-medium` only for active and selected UI states. No light or thin weights.
3. **Line length 45–75 characters** for anything longer than two lines (`max-w-prose`).
4. **Sentence case everywhere**: titles, buttons, tabs, menu items. Title Case only for proper nouns.
5. **Numbers in tables and metrics use `tabular-nums`**, and right-align when they are comparable.
6. **Truncation:** see the *Overflow content* pattern. Never truncate labels, errors or actions.

## Typefaces

- **Default:** Inter Variable, falling back to the platform's system UI font.
- **Square preset:** Helvetica Neue / Arial.
- **Mono** (code, IDs, tokens): JetBrains Mono.

One sans and one mono. No third typeface in product UI.
