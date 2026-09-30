---
title: Content, personas & taxonomy
summary: Words are part of the design system. Personas decide who we speak to, the taxonomy fixes the words, and skills enforce them.
status: stable
use_when:
  - Writing any user-visible string — labels, buttons, errors, empty states, emails, AI responses
  - Starting a new product or flow (create personas first)
avoid_when:
  - Inventing a term that isn't in the taxonomy → add it to the taxonomy first
  - Writing copy before knowing the persona
---

## The chain

1. **`corpus/product.md`.** What the product is, for whom, and the job it does.
2. **`corpus/personas/*.md`.** 2–4 personas, created with the `corpus-personas` skill.
3. **`corpus/taxonomy.json`.** The one vocabulary: objects, actions, statuses, banned words, tone.
4. **Every string.** Written with the `corpus-content` skill; banned words fail the audit.

## A persona is

- **A job.** What they're trying to get done.
- **A context.** Device, time pressure, how often they come.
- **An expertise level.** Experts get domain terms; novices get plain language.
- **A vocabulary.** The words they already use, taken from real sources.
- **Anxieties.** What they fear going wrong, which microcopy must defuse.

## Taxonomy rules

1. **One concept, one word.** An "agent" is an agent everywhere, never a "bot" somewhere else.
2. **Buttons are verb + object.** "Create agent", never "Submit".
3. **Banned words have replacements.** Kept in `taxonomy.json → avoid`, flagged by the audit.
4. **Statuses are a closed set.** Each maps to a `StatusIndicator` kind.

## Voice

- **Plain and direct.** Write like a knowledgeable colleague.
- **Sentence case.** Everywhere.
- **Front-load.** "Delete 3 agents?", not "Are you sure you want to…".
- **Buttons say what happens.** The confirm button repeats the title's verb.
- **Errors fix things.** What happened, why, how to fix it. No blame, no "oops".
- **No filler.** Drop "please", "simply", "just", "successfully".
- **AI copy is honest.** Say what the AI did and how sure it is; never "I think".

## Length budgets

| Element | Max |
|---|---|
| Button | 3 words |
| Tab, menu item | 2 words |
| Toast title | 5 words |
| Helper text | 1 sentence |
| Error | 2 sentences |
| Empty-state description | 2 lines |
