---
title: Accessibility
summary: WCAG 2.2 AA is the floor. Components are accessible by default; composition is where teams break it.
status: stable
use_when:
  - Always
avoid_when:
  - Never "add accessibility later"
---

## Built in

- **Keyboard and ARIA.** Every component, out of the box.
- **One focus ring.** Visible on every focusable element.
- **Checked contrast.** Text ≥ 4.5:1 on tints, field borders ≥ 3:1, and an automatic high-contrast mode.
- **Reduced motion.** Movement becomes fades automatically.
- **Wired forms.** Labels, helper text and errors are connected for screen readers.

## Your job

1. **Name everything.** Every icon button, search and table has a label; every page has one `h1`.
2. **Never color alone.** Status is icon + color + text.
3. **Keep focus logical.** No positive `tabIndex`; closing a layer returns focus to its trigger.
4. **Announce changes.** Use `InlineLoading`, `toast` and live result counts.
5. **Size targets.** ≥ 24px everywhere, and density ≥ 1.1 on touch products.
6. **Errors explain the fix.** "Enter a date like 31/12/2026", not "Invalid input".
7. **Don't disable silently.** Say why, or keep it enabled and validate.
8. **Headings are the outline.** Don't skip levels.

## Keyboard contract

| Keys | Behavior |
|---|---|
| Tab / Shift+Tab | Between controls |
| Arrows | Within menus, tabs, radios, toolbars, trees |
| Enter / Space | Activate |
| Escape | Close the topmost layer |
| Home / End | First / last item |

> [!TIP] Before calling UI done: keyboard-only pass, 200% zoom, dark mode, reduced motion, and `corpus-audit` at 0.

## Focus ring

- **A crisp line and a flat halo.** Focus is a 1px outline plus a thick halo of solid colour (no blur), easing in. Never remove it; style it only through `focus-ring` / `focus-ring-inset`.
- **It carries meaning.** The ring takes the element's semantic colour through `--corpus-ring`: blue by default, red on invalid fields and danger buttons, amber on warnings.
