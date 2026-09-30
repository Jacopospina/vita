---
name: corpus-content
description: Write or review every user-visible word in a Corpus product — labels, buttons, headings, helper text, errors, empty states, toasts, confirmations, emails, AI messages — through the product taxonomy and persona voice. Use whenever UI text is created or changed, or when copy "feels off".
---

# Corpus content

Every string passes through the **taxonomy** (`corpus/taxonomy.json`) and the **persona** (`corpus/personas/*.md`). If either file is missing, run `corpus-personas` first, or ask the user which persona the screen serves.

## Procedure for each string

1. **Identify the concept.** Look up the object or action in `taxonomy.json`. Use the preferred term, or the persona override if this screen serves that persona.
2. **Check `avoid`.** Never use a banned word; use its replacement.
3. **Apply the pattern formula** (below).
4. **Apply the voice rules.**
5. **Check the length budget.**
6. **Missing concept?** Propose a taxonomy addition (term, definition, icon) instead of inventing a word inline.

## Formulas

| Element | Formula | Example |
|---|---|---|
| Button | Verb + object (≤ 3 words) | "Create quote" |
| Page title | Object (plural for lists) or object name | "Quotes" / "Q-2041 · Acme GmbH" |
| Field label | Noun, sentence case | "Pickup date" |
| Helper text | Constraint or format, before the user errs | "Weekdays only. We'll confirm by 17:00." |
| Error | What happened + how to fix | "Enter a pickup date on a weekday." |
| Empty, first-use | Title: create your first X · Body: value + effort · Action | "Create your first quote" / "…about a minute." |
| Empty, no results | "No {objects} match…" + how to broaden + clear action | |
| Toast | Past-tense result, ≤ 5 words | "Quote sent" |
| Confirmation title | Question with verb + count + object | "Delete 3 quotes?" |
| Confirmation body | Consequence | "Customers lose access to the links. This can't be undone." |
| Confirmation button | Repeat the verb + object | "Delete quotes" |
| Status | Taxonomy status word | "Awaiting customer" |
| AI message | What was done + confidence, no "I" | "Suggested from 3 similar quotes · high confidence" |

## Voice

- Plain and direct, like a knowledgeable colleague.
- Sentence case everywhere.
- Front-load the key word.
- Numerals, not words, for numbers.
- No "please", "simply", "just", "oops", "successfully".
- No blame ("You entered an invalid…" becomes "Enter a…").
- Match the persona's expertise: domain terms for experts, plain terms for novices. The taxonomy overrides handle this.

## Review output

Return a table (`Current | Proposed | Rule`), then the patched code. Run the audit: it flags banned taxonomy terms in JSX strings.
