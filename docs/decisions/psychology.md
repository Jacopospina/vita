---
title: Psychology on the person's side
summary: Vita grounds its layout, choice, feedback and wording rules in how people perceive, decide and remember, carried by the vita-psychology skill. Every principle is used to help the person, never to steer them.
status: accepted
date: 2026-10-05
decided_by: Jacopo
related: [buttons, fields-and-options, touch, cursors, motion, status-semantics]
---

> [!IMPORTANT] A principle that works against the person is a violation, whatever it gains the product. Vita's identity is honest AI and people in control; persuasion tricks are out, in writing.

## Decision

- **Principles live in a skill, not a page.** `skills/vita-psychology/SKILL.md` holds them, each written as a decision and the Vita component or token that carries it. Agents load it when laying out, grouping, ordering, choosing defaults, designing feedback or reviewing a flow.
- **Four moments.** Seeing (gestalt: proximity, common region, similarity, continuity, figure and ground, closure, hierarchy), attention (Hick, chunking, progressive disclosure, isolation, position, change blindness, goal gradient), doing (Fitts, feedback, recognition over recall, forgiveness, error prevention, convention), judging (defaults, anchors, framing, choice overload, peak and end, trust).
- **Components encode the principles.** `Group`, `ButtonSet`, `KpiGroup`, `TileSet`, `ListGroup`, `Form`, `ConfirmModal`, `toast` and `EmptyState` exist because of them; the skill points at the component before the rule.
- **The skill owns the why.** The Architect and Consistency skills keep their rules and link here for the reasoning; a principle is written once.
- **Decisions name their principle.** When the skill changes a choice, the agent says which principle decided it, so a reviewer can disagree with the principle, not the taste.

## Why

- **Judgment outlasts checklists.** Rules cover the cases we foresaw; a principle lets an agent decide the case we didn't, the way a designer would.
- **A reason is reviewable.** "Proximity: the helper moved under its field" can be argued with; "it looks better" cannot.
- **No reference page.** A list of sixty biases is already in every agent's training; the value is the mapping to Vita, which fits in a skill.

## Rejected

- **Persuasion as a design tool.** Confirmshaming, pre-checked consent, false urgency or scarcity, hidden costs, asymmetric friction on leaving, guilt as motivation. Vita names them so an agent refuses them even when asked.
- **A standalone foundations page.** It would duplicate the skill and invite a textbook; the skill is the single home.
- **Folding it into the Architect skill.** Architect decides which component; this decides how a screen is read and judged. Different triggers, and Architect is already at its cap.

## Revisit when

- **A principle contradicts a measured outcome.** A usability test that shows a Vita rule hurting people supersedes the principle behind it, with the evidence in the record.
- **Enforcement becomes mechanical.** A principle the audit can check (one primary action in view, a confirmation on irreversible actions, a cap on menu length) moves from guidance to a rule in `scripts/vita-rules.mjs`.
