---
title: The name is Vita
summary: The design system was called Corpus. It is now Vita, life, the third of a triad with Animus (the logic) and Anima (the AI).
status: accepted
date: 2026-10-01
decided_by: Jacopo
related: [about, brand, how-we-decide]
---

## Decision

- **Vita is the name.** The design system, its docs, code, tokens, CLI, skills and site are Vita. Nothing says Corpus.
- **The triad.** Animus is the backend logic (the mind), Anima is the AI layer (the soul), Vita is the design system where both come alive.
- **The slogan follows.** "Give your ideas life." replaces "Give your ideas a body."
- **The example product is Theo.** Vita was the demo product's name; demos now build Theo.

## Why

- **Corpus read as inert.** In Latin it is a body, even a cadaver; in software, a static body of text or data. A design system is neither.
- **Vita is the whole.** Life is the sum of mind, soul and body working together: the logic, the intelligence and the experience in front of people.

## Migration (breaking)

- **CSS variables.** `--corpus-*` → `--vita-*`, `data-corpus-*` → `data-vita-*`.
- **Imports.** `@/components/corpus/*` → `@/components/vita/*`.
- **Tooling.** `corpus` CLI → `vita`, `corpus-audit` → `vita-audit`, `corpus.config.json` → `vita.config.json`, `// corpus-allow` → `// vita-allow`.
- **Package.** `@corpus/design-system` → `@vita/design-system`.

## Rejected

- **Keeping `--corpus-*` aliases for a version.** Two names for one system confuse agents; one clean rename is clearer.

## Revisit when

- **Never by habit.** The name changes only with a new decision record.
