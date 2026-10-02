---
title: Content, personas & taxonomy
summary: Words are part of the design system. Personas decide who we speak to, the taxonomy fixes the words, and skills enforce them.
status: stable
use_when:
  - Writing any user-visible string, labels, buttons, errors, empty states, emails, AI responses
  - Starting a new product or flow (create personas first)
avoid_when:
  - Inventing a term that isn't in the taxonomy → add it to the taxonomy first
  - Writing copy before knowing the persona
---

## The chain

1. **`vita/product.md`.** What the product is, for whom, and the job it does.
2. **`vita/personas/*.md`.** 2–4 personas, created with the `vita-personae` skill.
3. **`vita/taxonomy.json`.** The one vocabulary: objects, actions, statuses, banned words, tone.
4. **Every string.** Written with the `vita-copywriting` skill; banned words fail the audit.

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
- **Don't explain the obvious.** If a signifier already says it (a pointer cursor, a hover state, a chevron, a button's shape), the words don't repeat it: no "Click to…", "Tap here to…", "Change status" in labels or tooltips.
- **Name the thing.** Confirmations, toasts and errors say which object they mean, so nobody has to remember what they just did.
- **Buttons say what happens.** The confirm button repeats the title's verb.
- **Errors fix things.** What happened, why, how to fix it. No blame, no "oops".
- **No filler.** Drop "please", "simply", "just", "successfully".
- **No em dashes.** Use a comma, colon, full stop or parentheses. The build fails on one.
- **AI copy is honest.** Say what the AI did and how sure it is; never "I think".

## Vita's own voice

When Vita speaks for itself (these docs, the showcase, onboarding, release notes), it speaks as the Creator. Inside products built with Vita, the persona's plain voice always wins.

- **Speak to the maker.** "You make", "you shape": people are creators, never operators of a tool.
- **Verbs of making.** Make, shape, craft, compose, bring to life, release.
- **Possibility first.** Lead with what they'll create, then how; credit them, not Vita.
- **One slogan per surface.** The signature is "The first agentic design system." (decision: The slogan).
- **While agents work, a making word.** Sketching, Glazing, Weaving and more, one at a time; never "Loading".

## Write for the scan

People scan before they read: across the top, a shorter line below, then down the left edge. Write so the scan alone carries the meaning.

- **Most important first.** The first two paragraphs, and the first words of every heading, carry the point; people may read nothing else.
- **Headings start with the information.** "Billing errors" beats "About the errors you may see in billing".
- **Group what belongs together.** Sections, cards and tables give the eye places to stop, so nothing hides in a wall of text.
- **Emphasise the words that matter** (semibold, the emphasis weight), a few per section, never whole sentences.
- **Links say where they go.** "Read the billing guide", never "click here".
- **Lists over paragraphs.** Steps are numbered; options and rules are bulleted.

## Concise, scannable, objective

Research on reading on screens found that text written this way made people far faster and more accurate, and they remembered more of it.

- **Concise.** Cut about half the words. Shorter pages read as more complete, not less.
- **Scannable.** Short paragraphs (two sentences at most), headings, lists, emphasised keywords and tables.
- **Objective.** No promotional language, no buzzwords, no claims without proof.
- **Readable lines.** Body text stays around 45 to 75 characters a line; Vita's prose width does this for you.

## Length budgets

| Element | Max |
|---|---|
| Button | 3 words |
| Tab, menu item | 2 words |
| Toast title | 5 words |
| Helper text | 1 sentence |
| Error | 2 sentences |
| Empty-state description | 2 lines |
