---
title: Status semantics
summary: One map from meaning to colour and glyph, used by every status surface; status colours never decorate.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [color, status-indicators, tag]
---

## Decision

- **Success** green · CheckmarkFilled. **Warning** orange (hue 50) · WarningAltFilled. **Error** red · ErrorFilled. **Info** blue · InformationFilled.
- **Degraded and Paused are error** (destructive red).
- **In progress is info**, never brand.
- **Draft holds still**; other non-final states animate.
- **One source in code.** `registry/lib/status`; the audit flags decoration, status tones on categories and mismatched glyphs.

## Why

- **The same meaning must look the same everywhere.** Errors had three different glyphs; Deploying was blue in one place and brand in another.
- **Brand means "you can act here"**, so it can't also mean a state.

## Rejected, avoid

- **Status tones as category colours** (Settings-style coloured rows).
- **Warning text drifting toward red.** It made warnings read as errors.
- **Degraded as warning.** It reads as broken, not "soon".

## Revisit when

- **A product needs a fifth status family** (decide it here first).
