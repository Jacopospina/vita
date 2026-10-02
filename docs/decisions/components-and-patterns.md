---
title: Components and patterns
summary: A component is one building block with one job. A pattern is made of several components, arranged to do a task. Patterns never become components.
status: accepted
date: 2026-10-02
decided_by: Jacopo
related: [how-we-decide, choosing-components, cards, email-message]
---

## Decision

- **Component: one building block, one job.** A button, a field, a tag, an avatar, Sofia. It may use small parts inside (an icon, its own popover) but it does one thing.
- **Pattern: made of components, individually.** Several standalone Vita components arranged to do a task: a card, an email message, a voice conversation, global search, a login.
- **Where they live.** Components: `registry/ui` and `docs/components`. Patterns: `docs/patterns`, with code in `registry/blocks` when Vita ships one ready to use.
- **The test.** If its parts are Vita components people could use on their own, it's a pattern.

## Moved to patterns (2026-10-02)

- **Email message**, **Mic selector** and **Global search**: pages under Patterns, code in `registry/blocks`.
- **Conversation bar**: folded into the Voice conversation pattern, code in `registry/blocks`.
- **Cards**: a pattern from the start, with no component at all.

## Stay components

- **Data table, Date picker, Pagination, File uploader, Composer.** Each is one control with one job; its inner parts aren't offered on their own, and composition (toolbar, actions) arrives through slots.

## Why

- **Agents compose; they don't hunt.** Calling a composition a component hides that it's made of parts an agent can rearrange; calling it a pattern teaches the arrangement.
