---
title: Design principles
summary: Seven rules every Corpus screen obeys. When two rules conflict, the higher one wins.
status: stable
---

Corpus stands on three commitments:

- **Rigor:** every decision is documented, every component has an anatomy, accessibility and density are designed in.
- **Taste:** hierarchy, restraint, motion that feels physical, content first.
- **Ownership:** you own the code, tokens are CSS variables, components are composable primitives.

The principles are ranked. When they conflict, the lower number wins.

## 1. The system is the only source of UI

Every pixel comes from an Corpus component, pattern or token.

- No local components that re-implement something Corpus already has.
- No raw colors, sizes, radii, shadows, font sizes or durations.
- No one-off patterns.

If Corpus lacks something, the gap is a **design system change**, not a local workaround. Propose it upstream, get a designer's sign-off, and only then build it.

> Non-negotiable. `pnpm audit:ds` fails the build on violations.

## 2. Clarity over cleverness

Every screen answers three questions within five seconds:

1. Where am I?
2. What can I do here?
3. What is the most important thing?

- Use real words from the product taxonomy, never internal jargon.
- One primary action per view.
- Icons carry a label unless they are universally understood (close, search, menu), and even then they get a tooltip.

## 3. Content first, chrome second

The interface frames the user's data; it doesn't compete with it.

- Prefer whitespace to borders, and borders to boxes.
- Prefer one level of surface (`layer-1`) to nested cards.
- Color is reserved for meaning: interactive elements, status and brand moments. Never decoration.

## 4. Hierarchy you can squint at

Blur your eyes. The order in which elements pop must match their importance.

- Hierarchy comes from size, weight and position first; color comes last.
- Use the type ramp roles (`title-1`, `headline`, `body`, `footnote`). Never pick a size because it "looks right".

## 5. Consistent by construction

The same problem gets the same solution everywhere.

- Before designing a flow, check **Patterns**.
- Before picking a component, read **Choosing a component**.
- Same action, same verb, same place.

## 6. Accessible by default

WCAG 2.2 AA is the floor, not a feature.

- Every control is keyboard reachable with a visible focus ring.
- Status is never conveyed by color alone.
- Motion respects reduced-motion settings.
- Targets are at least 24×24px, and 44×44px on touch-first surfaces (density ≥ 1.1).

## 7. Motion explains, never decorates

Animate only to show:

- where something came from,
- where it went, or
- that the system heard you.

Productive motion (fast, subtle) is the default. Expressive motion is for rare, meaningful moments.

## How an agent applies these

1. Identify the **persona** and their **job** (see *Content, personas & taxonomy*).
2. Find the **pattern** that matches the job.
3. Compose it from **components**, chosen with *Choosing a component*.
4. Write every string through the **taxonomy**.
5. Run `pnpm audit:ds` and fix every violation. Do not suppress them.
