---
title: Skills
summary: Six skills teach AI agents to design and build with Vita like a designer would, installed with Vita into every product.
status: stable
related: [vita-for-ai, installation, content]
---

> [!NOTE] Skills live in `.claude/skills/vita-*`. An agent loads the right one on its own when the task matches.

## The six skills

- **Architect.** Your product's designer: it asks what you want to achieve, recommends the best pattern, then builds it from Vita components and tokens only (`vita-architect`).
- **Consistency.** Make every screen look designed by one person: hierarchy, spacing rhythm, alignment and surfaces (`vita-consistency`).
- **Motion Design.** Decide whether and how anything animates: durations, easings, choreography, reduced motion (`vita-motion-design`).
- **Copywriting.** Write and review every word users see: labels, buttons, errors, empty states, in the product's voice. Describe your audience and it refines the personae and taxonomy, then re-tunes the copy to fit (`vita-copywriting`). <!-- setup: vita/personae, vita/ai-voice.md | Tell Vita about your users and your AI's voice. It tailors every word to them. -->
- **Personae.** Create the product's personae, their journeys and the taxonomy of words derived from them (`vita-personae`). <!-- setup: vita/personae | Tell Vita about your users. It writes their personae and taxonomy. -->
- **Theming.** Personalise Vita for a brand by changing only the theme knobs (`vita-theming`).

## Three kinds of context

An agent works from three kinds of context. Knowing which one a rule belongs to is how you know what to change.

| Context | What it holds | Where | Loaded |
|---|---|---|---|
| Global | The rules every task follows | `AGENTS.md`, each skill's non-negotiables | Always |
| Local | What one task needs | A component's or pattern's docs, a decision record, the right skill | For that task |
| Ambient | Your product itself | `vita/` (product, personae, taxonomy, AI voice) and `theme.css` | Whenever it's relevant |

- **Global fits in one sitting.** If you can't read it in a few minutes, detail has crept in; move it to a local doc.
- **One rule, one home.** Every rule lives in one place; everywhere else links to it, so changing it never leaves a stale copy.
- **Name the context when you ask for a change.** "Change the taxonomy" or "change the copywriting skill" tells the agent exactly what to edit.

## Rules

- **Skills decide; the audit enforces.** A skill guides the agent's choices; the audit and the edit hook catch what slips through.
- **Skills read the decisions.** Before changing anything a record in Decisions covers, the agent reads it.
