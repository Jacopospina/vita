---
title: How Corpus decides
summary: Every system choice is a written record. Agents and people read the record before changing anything it covers; changing it means superseding it.
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [glass-by-elevation, status-semantics]
---

> [!IMPORTANT] "The design system says no" beats "I think". If a request contradicts a record, the record wins until it's superseded — on purpose, in writing.

## The record

- **One decision, one page.** `docs/decisions/<slug>.md`: the decision, why, what was rejected, and when to revisit.
- **Status.** `proposed` → `accepted` → `superseded` (with `superseded_by`). Superseded records stay, so history is never lost.
- **Owner.** `decided_by` names who made the call; `date` is when.

## Changing a decision

1. **Read the record first.** Agents check `docs/decisions/` before touching anything a record covers.
2. **Propose with evidence.** What problem, who else needs it, and a prototype or screenshot.
3. **Supersede, don't edit.** A changed decision gets a new record (or a dated revision section) and the old one points to it.
4. **Ship with the change.** Code, docs and the record land in the same commit.

## Contributions and exceptions

- **The three-team rule.** If three or more products need it, it belongs in Corpus. If one does, it's an exception. Unsure → prototype with one team, then decide.
- **Exceptions are visible.** A deviation needs `// corpus-allow <rule>: <why> — approved by @<owner>`. `pnpm exceptions` lists every one with its age, for regular review.
- **Repeated exceptions are a signal.** The same exception in three places is a system gap — promote it.

## Versions and deprecation

- **Semantic versions.** Breaking (renamed props, removed variants, changed looks people rely on) → major; new components or variants → minor; fixes → patch.
- **Every breaking change is announced** in `CHANGELOG.md` and the component doc, with the migration.
- **Deprecate before removing.** Deprecated → the audit warns → removed in the next major.
