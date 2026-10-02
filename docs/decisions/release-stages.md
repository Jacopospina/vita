---
title: Release stages
summary: Everything in Vita, and Vita itself, sits on one of three stages. Draft comes first, then Experimental, then Stable.
status: accepted
date: 2026-10-02
decided_by: Jacopo
related: [how-we-decide, status-semantics, components-and-patterns]
---

## Decision

1. **Draft.** Shaped in the open: names, props and pages can still change without notice. Vita itself is a Draft today.
2. **Experimental.** The shape holds and people can build on it; details still move, and breaking changes come with a note.
3. **Stable.** Decided and enforced: changes follow `how-we-decide`, never a silent reversal.

## How it shows

- **One tag, one tone.** Draft is neutral (never info, which Status semantics keeps for "in progress"), Experimental is warning, Stable is success.
- **Pages carry their stage.** A doc's `status` frontmatter is its stage, shown as a tag next to its title.

## Why

- **Honesty before polish.** Calling unfinished work Experimental promises more than it keeps; Draft says it plainly.
