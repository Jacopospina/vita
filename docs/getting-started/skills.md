---
title: Skills
summary: Six skills teach AI agents to design and build with Vita like a designer would, installed with Vita into every product.
status: stable
related: [vita-for-ai, installation, content]
---

> [!NOTE] Skills live in `.claude/skills/vita-*`. An agent loads the right one on its own when the task matches.

## The six skills

- **vita-design-system.** Build or change any interface: pick the right component or pattern, use only Vita tokens, never create local components.
- **vita-visual-consistency.** Make every screen look designed by one person: hierarchy, spacing rhythm, alignment and surfaces.
- **vita-motion.** Decide whether and how anything animates: durations, easings, choreography, reduced motion.
- **vita-content.** Write and review every word users see: labels, buttons, errors, empty states, in the product's voice.
- **vita-personas.** Create the product's personas, their journeys and the taxonomy of words derived from them.
- **vita-theme.** Personalise Vita for a brand by changing only the theme knobs.

## Rules

- **Skills decide; the audit enforces.** A skill guides the agent's choices; the audit and the edit hook catch what slips through.
- **Skills read the decisions.** Before changing anything a record in Decisions covers, the agent reads it.
