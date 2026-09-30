---
title: Design principles
summary: Seven ranked rules every Corpus screen obeys. When two conflict, the lower number wins.
status: stable
---

> [!IMPORTANT] Rule 1 is non-negotiable: `corpus-audit` fails the build on any local component or raw value.

## The seven principles

1. **The system is the only source of UI.** Every pixel is a Corpus component, pattern or token. A gap becomes a design-system change, never a local workaround.
2. **Clarity over cleverness.** In five seconds, the user knows where they are, what they can do, and what matters most.
3. **Content first, chrome second.** The interface frames the user's data. Prefer whitespace to borders, and borders to boxes.
4. **Hierarchy you can squint at.** Size, weight and position rank things; color comes last.
5. **Consistent by construction.** The same problem gets the same pattern, the same verb and the same place.
6. **Accessible by default.** WCAG 2.2 AA is the floor: keyboard, focus, contrast and reduced motion.
7. **Motion explains, never decorates.** Animate only to show where something came from, where it went, or that the system heard you.

## What they look like in practice

- **One primary action per view.** Everything else steps down: secondary → tertiary → ghost.
- **Real words from the taxonomy.** Never internal jargon, never "Submit".
- **Neutral screens.** About 90% greys; brand color only where you can act.
- **Every state designed.** Loading, empty, error and overflow, for every region.

## How an agent applies them

1. **Persona.** Who is this for, and what's their job?
2. **Pattern.** Find the pattern that matches the job.
3. **Components.** Choose them with *Choosing a component*.
4. **Words.** Write every string through the taxonomy.
5. **Audit.** Run `corpus-audit` until it reports 0 violations.
