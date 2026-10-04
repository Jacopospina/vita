---
title: Skills
summary: Six skills teach AI agents to design and build with Vita like a designer would, installed with Vita into every product.
status: stable
setup_title: The skills learn from you
setup: Copywriting learns your users and your AI's voice from what you tell it, and from your product analytics if you share them, then tailors every word to them.
setup_skill: vita-copywriting
setup_files: [vita/personas, vita/ai-voice.md]
related: [vita-for-ai, installation, content]
---

> [!NOTE] Skills live in `.claude/skills/vita-*`. An agent loads the right one on its own when the task matches.

## The six skills

- **Architect.** Build or change any interface: pick the right component or pattern, use only Vita tokens, never create local components (`vita-architect`).
- **Consistency.** Make every screen look designed by one person: hierarchy, spacing rhythm, alignment and surfaces (`vita-consistency`).
- **Motion Design.** Decide whether and how anything animates: durations, easings, choreography, reduced motion (`vita-motion-design`).
- **Copywriting.** Write and review every word users see: labels, buttons, errors, empty states, in the product's voice. Describe your audience and it refines the personas and taxonomy, then re-tunes the copy to fit (`vita-copywriting`).
- **Personae.** Create the product's personas, their journeys and the taxonomy of words derived from them (`vita-personae`).
- **Theming.** Personalise Vita for a brand by changing only the theme knobs (`vita-theming`).

> [!IMPORTANT] Renamed (2026-10-02): `vita-design-system`, `vita-visual-consistency`, `vita-motion`, `vita-content`, `vita-personas` and `vita-theme` are now the six above. Running `vita update` swaps the folders and removes the old ones.

## Rules

- **Skills decide; the audit enforces.** A skill guides the agent's choices; the audit and the edit hook catch what slips through.
- **Skills read the decisions.** Before changing anything a record in Decisions covers, the agent reads it.
