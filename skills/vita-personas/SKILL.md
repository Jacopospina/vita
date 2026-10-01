---
name: vita-personas
description: Create and maintain the product's user personas, their end-to-end journeys, and the product taxonomy (vocabulary) derived from them. Use at the start of any product or major feature, when vita/personas is empty, when someone asks "who is this for", when designing an end-to-end flow, or when words/terminology are inconsistent.
---

# Vita personas → journeys → taxonomy

This is the soul (Anima) shaping the body (Vita). Personas decide who we design for; journeys decide which patterns we need; the taxonomy decides every word.

## Inputs to gather first

1. `vita/product.md`: what the product does, for whom, and the core job. If it's empty, interview the user with up to 6 questions: product, users, their job, context of use, frequency, what they fear going wrong.
2. **Real vocabulary sources**, if available: support tickets, sales-call notes, user interviews, existing UI copy, domain documents. Words must come from users, not from the team.

## Step 1: personas (2–4, never more)

Create `vita/personas/<slug>.md` from `vita/personas/_template.md`. Each persona is defined by behavior, not demographics:

- **Role and job-to-be-done:** what they're hired to achieve, and how success is measured.
- **Context:** device, environment, interruptions, time pressure, and frequency (daily power user vs monthly visitor).
- **Expertise:** domain (novice → expert) and tool (novice → power user). This drives density and vocabulary.
- **Vocabulary:** words they use and words that confuse them.
- **Anxieties:** what they fear (losing data, looking bad to a customer, compliance). Microcopy must defuse these.
- **Design implications:**
  - **Density:** the `--vita-density` recommendation.
  - **Primary patterns:** forms, tables, dashboards.
  - **Tone:** formal vs casual.
  - **What to never do** to this person.

Mark one persona **primary**. When personas conflict, the primary wins.

## Step 2: journeys (end to end)

For the primary persona's top 3 jobs, write a journey in the persona file:

`Trigger → Steps (screen by screen) → Moments of anxiety → Success signal → What happens after`

Map every step to a Vita pattern and its components (`.vita/docs/patterns/*`). Unmapped steps are design-system gaps: list them explicitly.

## Step 3: taxonomy

Write `vita/taxonomy.json` (schema in `vita/taxonomy.json` from the template):

- **objects:** the nouns. One preferred term per concept, with singular/plural, a definition, per-persona overrides only when a persona truly uses a different word, and an icon from the Vita icon set.
- **actions:** the verbs, each with an icon, button variant and whether it needs confirmation or undo (see `patterns/common-actions.md`).
- **statuses:** a closed list per object, each mapped to a `StatusIndicator` kind.
- **avoid:** banned word → replacement. The audit flags these in UI strings.
- **voice:** a tone per persona, plus the product-wide rules.

Rules:

- One concept, one word.
- Prefer the users' word over the team's.
- Never two terms for the same thing in the UI.

## Step 4: hand off

Summarise, in five lines max, for the team:

- The personas.
- The primary persona.
- The top journeys and their patterns.
- The taxonomy decisions that changed existing copy.
- The design-system gaps found.

From now on, every UI task uses the `vita-content` skill with these files.

## Keep it alive

When a new feature introduces a concept, add it to the taxonomy **before** writing UI. When users are observed using a different word, update the taxonomy and let the audit find the old strings.
