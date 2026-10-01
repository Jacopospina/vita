---
title: Typography
summary: Ten roles generated from one base size and one ratio. Google Sans Flex for words, Google Sans Code for code and numbers.
status: stable
import: "import { Text, Heading } from \"@/components/vita/text\""
use_when:
  - Any text, pick the ROLE (title-2, body, caption), not a size
avoid_when:
  - Tailwind sizes (text-sm, text-2xl) → they don't exist in Vita
  - Changing size to create emphasis inside a paragraph → use font-medium or font-semibold
---

## Typefaces

- **Google Sans Flex.** Everything: headings, body, labels, buttons.
- **Google Sans Code.** Code, commands, IDs and tokens (`font-mono`).
- **Numbers too.** Any value marked `tabular-nums` switches to Google Sans Code automatically.

## Values never snap

- **Numbers are regular weight.** Always, whatever the weight of the role or the text around them, `Text` sets numeric-only content regular and `tabular-nums` enforces it, unless a `weight` is asked for explicitly.
- **Numbers swap.** Any number that changes uses `AnimatedNumber`: each digit blurs out and the new one sharpens in, staggered, never clipped.
- **Text reveals.** Any label that changes uses `AnimatedText`: letters stagger in one after another, sliding up from blur to sharp.

## Roles

| Role | Utility | Size | Use for |
|---|---|---|---|
| Display | `text-display` | 47 | Marketing hero |
| Large title | `text-large-title` | 32 | Top page title in content apps |
| Title 1 | `text-title-1` | 27 | Page title |
| Title 2 | `text-title-2` | 22 | Section |
| Title 3 | `text-title-3` | 19 | Subsection, modal, card titles |
| Headline | `text-headline` | 16 | Group labels, emphasised rows |
| Body large | `text-body-lg` | 15 | Long reading, onboarding |
| Body | `text-body` | 13 | Default UI text |
| Footnote | `text-footnote` | 12 | Labels, secondary info |
| Caption | `text-caption` | 11 | Helper text, metadata |

## Rules

1. **Role, not size.** A page title is `title-1` even if you "want it bigger".
2. **Three weights.** Every role comes in `regular` (reading), `medium` (labels and active states) and `semibold` (headings and emphasis). Set it with `Text`'s `weight` prop; never use bold.
3. **45–75 characters per line.** Use `max-w-prose` for anything longer than two lines.
4. **Sentence case.** Title Case only for proper nouns.
5. **Numbers are values.** Mark them `tabular-nums` and right-align them when they're compared.
6. **Never truncate** labels, errors or actions.

> [!NOTE] Sizes are `base × ratio^n`. Change `--vita-type-base` or `--vita-type-ratio`, never individual sizes.
