---
title: Accessibility
summary: WCAG 2.2 AA is the floor. Corpus components are accessible by default, and composition is where teams break it.
status: stable
use_when:
  - Always
avoid_when:
  - Never "add accessibility later"
---

## What Corpus gives you

- Keyboard support and ARIA wiring in every component (Radix primitives underneath).
- One focus ring: `outline 2px var(--corpus-focus)`, visible on every focusable element.
- Contrast-checked tokens: text ≥ 4.5:1, field borders and icons ≥ 3:1, in both themes.
- Reduced-motion handling built into the motion tokens.
- Form fields that wire `label` → `aria-describedby` → `aria-invalid` automatically.

## What you must still do

1. **Name everything.**
   - Every `IconButton` has a `label`.
   - Every `Search` has a `label` (visually hidden is fine).
   - Every table has a `title` or `label`.
   - Every page has exactly one `h1`, via `PageHeader`.
2. **Never use color alone.** Status = icon + color + text (`StatusIndicator`, `Tag` with an icon).
3. **Keep a logical focus order.**
   - Don't use positive `tabIndex`.
   - After closing a modal or panel, focus returns to the trigger (built in; don't break it with conditional unmounting).
4. **Announce async changes.** Use `InlineLoading`, `toast` and `aria-live` result counts. Never change content silently.
5. **Target size:** ≥ 24×24px everywhere. On touch-first products set `--corpus-density: 1.1` or higher so controls reach 44px.
6. **Write errors that explain the fix.** "Enter a date like 31/12/2026", not "Invalid input".
7. **Don't disable without explaining** (see the *Disabled states* pattern).
8. **Headings are the outline.** Screen-reader users navigate by headings, so don't skip levels.

## Keyboard contract

| Keys | Behavior |
|---|---|
| Tab / Shift+Tab | Move between controls (one stop per composite widget) |
| Arrow keys | Move within menus, tabs, radio groups, toolbars, trees, content switchers |
| Enter / Space | Activate |
| Escape | Close the topmost layer (tooltip → menu → popover → panel → modal) |
| Home / End | First/last item in lists, sliders, trees |

## Testing checklist (for agents)

Before marking UI done:

1. Keyboard-only walkthrough.
2. Zoom to 200%.
3. Dark theme.
4. `prefers-reduced-motion`.
5. Screen-reader labels on every icon-only control.
6. `pnpm audit:ds` passes.
