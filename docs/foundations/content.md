---
title: Content, personas & taxonomy
summary: Words are part of the design system. Personas define who we speak to; the taxonomy fixes the words; the corpus-content skill enforces them.
status: stable
use_when:
  - Writing any user-visible string: labels, buttons, errors, empty states, emails, AI responses
  - Starting a new product or flow (create personas first)
avoid_when:
  - Inventing a term that isn't in the taxonomy → add it to the taxonomy first
  - Writing copy before knowing the persona
---

## The chain

```
corpus/product.md          what the product is, for whom, the job it does
        ↓  (skill: corpus-personas)
corpus/personas/*.md       2–4 personas: goals, context, expertise, vocabulary, anxieties
        ↓
corpus/taxonomy.json       the ONE vocabulary: objects, actions, statuses, banned words, tone per persona
        ↓  (skill: corpus-content)
every string in the UI
```

Templates live in `templates/` in this repo. `npx corpus init` copies them into your project.

## Personas shape the words

A persona is not a demographic. It is:

- **Job:** what they're trying to get done.
- **Context:** device, time pressure, frequency (daily power user vs. monthly visitor).
- **Expertise:** domain experts get domain terms; novices get plain language.
- **Vocabulary:** the words *they* already use. Harvest them from support tickets, sales calls and interviews.
- **Anxieties:** what they fear going wrong. Microcopy should defuse it.

The taxonomy records one **preferred term per concept** and, when personas differ, per-persona overrides.

## Taxonomy rules

1. **One concept, one word.** If it's a "quote" on the list page, it's a "quote" in the email, the toast and the API error. Never "estimate" somewhere else.
2. **Objects are nouns, actions are verbs.** The taxonomy lists both. Buttons are `verb + object` ("Create quote"), never just "Submit".
3. **Banned words** live in `taxonomy.json → avoid`, with the replacement. The audit script flags them in JSX strings.
4. **Statuses are a closed set** per object, each mapped to a `StatusIndicator` kind.

## Voice (clarity × precision)

- **Plain, direct, human.** Write like a knowledgeable colleague, not a system.
- **Sentence case** everywhere.
- **Front-load.** Put the important word first: "Delete 3 files?" not "Are you sure you want to delete these 3 files?"
- **Buttons say exactly what happens.** "Delete project", not "OK". The confirm button repeats the title's verb.
- **Errors:**
  1. What happened.
  2. Why (if useful).
  3. How to fix it.

  Never blame the user, never say "oops", never show error codes alone.
- **Empty states:**
  1. What this place is for.
  2. How to fill it.
- **Numbers:** numerals always ("3 files"), locale-formatted, with units.
- **No filler:** drop "please", "simply", "just", "successfully" (a success toast already implies success).
- **AI copy:** say what the AI did and how sure it is; never anthropomorphise ("I think…").

## Length budgets

| Element | Max |
|---|---|
| Button | 3 words |
| Tab, menu item | 2 words |
| Modal title | 1 line, a question for confirmations |
| Toast title | 5 words |
| Helper text | 1 sentence |
| Error message | 2 sentences |
| Empty-state description | 2 lines |
