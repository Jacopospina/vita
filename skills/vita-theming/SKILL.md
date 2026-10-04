---
name: vita-theming
description: Personalise Vita for a product or brand by changing only the theme knobs, brand hue/chroma, neutral tint, radius, density, typefaces, type scale, motion speed, and verify contrast. Use when someone wants to rebrand, change colors, make the UI denser/roomier, rounder/squarer, change fonts, or match a brand guideline.
---

# Vita Theming

Everything visual derives from about 10 knobs in `src/styles/vita/theme.css`. **Edit only that file.** Never override tokens or component classes.

## Map the request to knobs

| Request | Knob(s) |
|---|---|
| "Use our brand color #…" | Convert to OKLCH. Set `--vita-brand-hue` to its hue and `--vita-brand-chroma` to its chroma (cap at 0.25). Keep lightness system-controlled. |
| "Greys feel cold/warm" | `--vita-neutral-hue` (brand hue for harmony) + `--vita-neutral-chroma` (0–0.02) |
| "More rounded / sharper" | `--vita-radius` (0 · 0.25rem · 0.5rem · 0.75rem · 1rem) |
| "Denser for power users" / "bigger for touch" | `--vita-density` (0.8 → 1.2) |
| "Change the font" | `--vita-font-sans`, `--vita-font-display`, `--vita-font-mono` (load the font too) |
| "Text too small / too flat" | `--vita-type-base` (0.875rem product, 1rem content) and `--vita-type-ratio` (1.125–1.25) |
| "Too much animation" | `--vita-motion-scale` (0.75 faster, 1.25 calmer, 0 off) |
| Presets | `data-vita-preset="square|soft|mono"` on `<html>` as a starting point |

## Guardrails

1. **Contrast check after any color change:** primary with white text ≥ 4.5:1 in both themes. Yellow and lime hues (85–120) with chroma above 0.15 usually fail: lower the chroma or warn the user.
2. **Support hues keep their meaning:** you can shift success/warning/error/info hues by ±15°, but never swap them.
3. **Density follows the primary persona**, not taste (see `vita/personae`).
4. **One sans and one mono.** A display face is allowed only for marketing surfaces.
5. **Don't change semantic tokens** (`tokens.css`) per product. If a new semantic role is needed, that's a design-system change.
6. **Corners always come from the radius knob.** Whatever radius the product picks (Default or its own), every corner follows it: no `rounded-none`, no local radius. After a radius change, check a picker, a tree row, a tile and a panel; a corner that didn't move is a bug to fix in the component, not in the theme.

## Deliver

Show the diff to `theme.css`, the contrast results, and a screenshot of the playground (`pnpm dev` → Theme panel) or of the product.
