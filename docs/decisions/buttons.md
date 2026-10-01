---
title: Buttons
summary: One primary per page, dialog or side panel; the secondary is a faint primary wash with primary text; xl is rounder.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [button, dialogs]
---

## Decision

- **Exactly one primary per surface,** paired with a secondary when an alternative is needed.
- **Secondary** = primary at 10% (16% hover) with the link tone of the primary hue as text.
- **No Cancel buttons.** × and Escape close surfaces.
- **xl** (48px) for hero calls to action and dialog/panel actions, with a larger squircle radius.

## Why

- **Hierarchy collapses with two primaries.**
- **Raw primary text on its own wash is ~3.8:1**; the link tone keeps AA.

## Rejected — avoid

- **Neutral grey secondary.** It looked disabled.
- **Raw primary text on the wash** (fails contrast).

## Revisit when

- **The brand hue changes** (re-check the wash contrast).
