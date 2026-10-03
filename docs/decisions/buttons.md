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

## Rejected, avoid

- **Neutral grey secondary.** It looked disabled.
- **Raw primary text on the wash** (fails contrast).

## Revisit when

- **The brand hue changes** (re-check the wash contrast).

## Revision, 2026-10-03: width and touch

- **Full width only in action bars** (panels, dialogs, popovers: surfaces above the page). In page content a button is as wide as its label, `lg` or `xl`; the login form's buttons included. A full-bleed button on a page reads as a bar that isn't there.
- **On touch, a button with an icon shows only its icon**, except the primary and buttons that fill a bar (see *Touch adapts by itself*, revision 2026-10-03).
- **Label and icon take the button's colour in the same frame.** Text carriers no longer transition an inherited colour on their own; a red button was briefly red with blue letters.
