---
title: Fields and options
summary: Soft field borders at rest; dropdown options are whole-row targets with a reserved left tick slot.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [text-input, option, dropdown]
---

## Decision

- **Field borders are soft at rest** (`border`), stronger on hover, ringed on focus; increased contrast restores ≥ 3:1.
- **Options are whole rows.** Click, Enter or Space toggles; never a checkbox inside a row.
- **The tick lives in a reserved left slot**, so labels never move.
- **Inline notifications sit on white;** icon tiles are a faint wash on white and a solid white tile inside grey list groups.

## Why

- **The 3:1 field border felt heavy** across dense forms.
- **Checkboxes inside rows** made the row a smaller, worse target.

## Rejected — avoid

- **A right-aligned tick that shifts labels.**

## Revisit when

- **Accessibility testing shows fields are hard to find** at rest (raise the border back toward 3:1).
