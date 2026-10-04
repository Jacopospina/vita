---
title: Skills
summary: Six skills teach AI agents to design and build with Vita like a designer would, installed with Vita into every product.
status: stable
related: [vita-for-ai, installation, content]
---

> [!NOTE] Skills live in `.claude/skills/vita-*`. An agent loads the right one on its own when the task matches.

## The six skills

- **Architect.** Build or change any interface: pick the right component or pattern, use only Vita tokens, never create local components (`vita-architect`).
- **Consistency.** Make every screen look designed by one person: hierarchy, spacing rhythm, alignment and surfaces (`vita-consistency`).
- **Motion Design.** Decide whether and how anything animates: durations, easings, choreography, reduced motion (`vita-motion-design`).
- **Copywriting.** Write and review every word users see: labels, buttons, errors, empty states, in the product's voice. Describe your audience and it refines the personae and taxonomy, then re-tunes the copy to fit (`vita-copywriting`). <!-- setup: vita/personae, vita/ai-voice.md | Tell Vita about your users and your AI's voice. It tailors every word to them. -->
- **Personae.** Create the product's personae, their journeys and the taxonomy of words derived from them (`vita-personae`). <!-- setup: vita/personae | Tell Vita about your users. It writes their personae and taxonomy. -->
- **Theming.** Personalise Vita for a brand by changing only the theme knobs (`vita-theming`).

## Rules

- **Skills decide; the audit enforces.** A skill guides the agent's choices; the audit and the edit hook catch what slips through.
- **Skills read the decisions.** Before changing anything a record in Decisions covers, the agent reads it.
