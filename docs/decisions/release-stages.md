---
title: Release stages
summary: Everything in Vita, and Vita itself, sits on one of three stages. Inception comes first, then Experimental, then Stable.
status: accepted
date: 2026-10-02
decided_by: Jacopo
related: [how-we-decide, status-semantics, components-and-patterns]
---

## Decision

1. **Inception.** Shaped in the open: names, props and pages can still change without notice. Vita itself is in Inception today.
2. **Experimental.** The shape holds and people can build on it; details still move, and breaking changes come with a note.
3. **Stable.** Decided and enforced: changes follow `how-we-decide`, never a silent reversal.

## How it shows

- **One tag, one tone.** Inception is neutral (never info, which Status semantics keeps for "in progress"), Experimental is warning, Stable is success.
- **Vita's own stage explains itself.** Hovering the stage tag above the homepage headline says where Vita stands today, in three short lines for makers.
- **Pages carry their stage.** A doc's `status` frontmatter is its stage, shown as a tag next to its title.

## Why

- **Honesty before polish.** Calling unfinished work Experimental promises more than it keeps; Inception says it plainly.

## Revision (2026-10-03)

- **Draft is renamed Inception.** "Draft" is already an object status (Status semantics); a release stage needs its own word. Pages use `status: inception`.
