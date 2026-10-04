---
name: vita-copywriting
description: Write or review every user-visible word in a Vita product, labels, buttons, headings, helper text, errors, empty states, toasts, confirmations, emails, AI messages, through the product taxonomy and persona voice. Use whenever UI text is created or changed, when copy "feels off", or whenever the user describes the product's target users or audience (then refine the personae and taxonomy and re-tune the copy).
---

# Vita Copywriting

Every string passes through the **taxonomy** (`vita/taxonomy.json`) and the **persona** (`vita/personae/*.md`). Until the user has taught Vita their users, write for **Vita's defaults**: the default persona (Alex, the average internet user) and the default word rules in `.vita/docs/foundations/content.md` ("Vita's defaults"). Say once that you're using the defaults, and offer to learn their users instead (below).

## When someone describes their audience

Whenever the user tells you about the people the product is for, at setup or at any later point, they are tuning the copy. Turn what they say into personae and taxonomy, then rewrite the words to fit.

1. **Take everything they know.** Ask for it all: who the users are, what they do, the words they use, what worries them, plus any interviews, support tickets, sales notes, reviews or existing copy. Ask up to 3 follow-ups on what's missing (expertise, context of use, anxieties).
2. **Read their analytics, if they share it.** From product analytics (PostHog or any other), read time on task, drop-offs, repeated attempts, feature use, frequency and devices. Infer traits from it (expertise, patience, how often they come, where they get stuck) and state each one with its evidence, so the user can correct it.
3. **Refine the personae.** Update `vita/personae/*.md` (role, expertise, vocabulary, anxieties, tone) following `vita-personae`; create them if they don't exist.
4. **Refine the taxonomy.** In `vita/taxonomy.json`, switch preferred terms to the users' own words, add persona overrides, add `avoid` entries for words that confuse them, and set the voice per persona.
5. **Re-tune the copy.** Run the procedure below over the existing UI strings and propose every change the new taxonomy or voice calls for.
6. **Report.** What you learned about the audience, the taxonomy changes (old → new), then the copy table.

The taxonomy is never finished: every new thing the user shares about their audience refines it.

## Setting the AI's voice

When the user describes how their product's AI should speak, write `vita/ai-voice.md` (from `.vita/templates/ai-voice.template.md` if it's missing) and delete its `vita:unset` line, so the docs stop showing "Setup".

1. **Tone.** Up to 3 words, in their words.
2. **Length.** Succinct (the answer first, in one line), balanced or detailed (shows its reasoning). Ask if they don't say.
3. **It never.** What the AI must never say or do in words.
4. **Per persona.** For each persona in `vita/personae`, how the voice shifts: shorter with domain terms for experts, plainer and more guiding for newcomers.

Every AI message (replies, summaries, AI labels, explanations) follows this file. Until it's set (missing, or still holding `vita:unset`), AI copy uses Vita's default voice in `.vita/docs/foundations/vita-for-ai.md` ("Vita's default voice"): answer first, short, plain, warm and honest.

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
| Error | What happened + how to fix, in the person's words (never codes or jargon, see below) | "Enter a go-live date on a weekday." |
| Empty, first-use | Title: create your first X · Body: value + effort · Action | "Create your first agent" / "…about five minutes." |
| Empty, no results | "No {objects} match…" + how to broaden + clear action | |
| Toast | Past-tense result, ≤ 5 words | "Agent deployed" |
| Confirmation title | Question with verb + count + object | "Delete 3 agents?" |
| Confirmation body | Consequence | "They stop running and their history is removed. This can't be undone." |
| Confirmation button | Repeat the verb + object | "Delete agents" |
| Status | Taxonomy status word | "Awaiting approval" |
| AI message | What was done + confidence, no "I" | "Suggested from 3 similar tickets · high confidence" |

## Errors are for people who don't code

The person reading an error doesn't write software and can't read it. Every error, including ones that start as a technical failure, is rewritten in their words before it reaches the screen.

1. **Say what happened, in the person's world.** "We couldn't save your changes" ✓. "500 Internal Server Error", "Request failed", "Unexpected token" ✗.
2. **Say what to do next.** "Check your connection and try again", "Ask an admin for access". Every error has a way forward; if none exists, say who can help.
3. **Never show the machine.** No status codes, exception names, stack traces, field keys (`go_live_at`), IDs, JSON, file paths or "null/undefined". If support needs a reference, add it last and label it: "Reference: AGT-1042".
4. **Name their thing, not the system's.** "Support triage couldn't connect to Slack", not "Integration sync failed (provider: slack)".
5. **No blame, no alarm.** Not "invalid", "illegal", "fatal", "you failed to". Not "Oops" either.
6. **Two sentences at most.** What happened, then what to do.

| Machine says | People read |
|---|---|
| `ECONNRESET` | "We lost the connection. Check your internet and try again." |
| `403 Forbidden` | "You don't have access to this agent. Ask a workspace admin to add you." |
| `ValidationError: go_live_at must be a weekday` | "Choose a weekday for the go-live date." |
| `TypeError: cannot read properties of undefined` | "Something went wrong on our side. Try again in a moment; if it keeps happening, contact support." |

## Don't say it twice

- **A label earns its place.** If the options, the values or the icon already say what a control does (a stepped slider reading Small · Medium · Large), drop the visible label and keep it for screen readers only.
- **Name the intent, not the measure.** "Small", "Large", not "48px", "64px"; numbers only where the number itself is the choice (a price, a limit).

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
- One slogan per surface; the signature is "The first agentic design system."

Inside a product built with Vita, the persona's plain voice and the rules above always win.
