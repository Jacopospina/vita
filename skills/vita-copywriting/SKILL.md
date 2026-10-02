---
name: vita-copywriting
description: Write or review every user-visible word in a Vita product, labels, buttons, headings, helper text, errors, empty states, toasts, confirmations, emails, AI messages, through the product taxonomy and persona voice. Use whenever UI text is created or changed, or when copy "feels off".
---

# Vita Copywriting

Every string passes through the **taxonomy** (`vita/taxonomy.json`) and the **persona** (`vita/personas/*.md`). If either file is missing, run `vita-personae` first, or ask the user which persona the screen serves.

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
| Button | Verb + object (≤ 3 words) | "Create agent" |
| Page title | Object (plural for lists) or object name | "Agents" / "Support triage" |
| Field label | Noun, sentence case | "Go-live date" |
| Helper text | Constraint or format, before the user errs | "Weekdays only. Deployments start at 09:00." |
| Error | What happened + how to fix | "Enter a go-live date on a weekday." |
| Empty, first-use | Title: create your first X · Body: value + effort · Action | "Create your first agent" / "…about five minutes." |
| Empty, no results | "No {objects} match…" + how to broaden + clear action | |
| Toast | Past-tense result, ≤ 5 words | "Agent deployed" |
| Confirmation title | Question with verb + count + object | "Delete 3 agents?" |
| Confirmation body | Consequence | "They stop running and their history is removed. This can't be undone." |
| Confirmation button | Repeat the verb + object | "Delete agents" |
| Status | Taxonomy status word | "Awaiting approval" |
| AI message | What was done + confidence, no "I" | "Suggested from 3 similar tickets · high confidence" |

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

## Vita's own voice (brand)

When writing **as Vita**, docs, the showcase, onboarding into Vita, release notes, use the Creator voice in `docs/foundations/content.md` ("Vita's own voice"):
- Speak to the maker ("you make", "you shape"), with verbs of making.
- Lead with what they'll create; credit them, not Vita.
- One slogan per surface; the signature is "Give your ideas life."

Inside a product built with Vita, the persona's plain voice and the rules above always win.
