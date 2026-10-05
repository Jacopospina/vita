---
title: Material
summary: Everything that floats above the page is frosted glass. The higher it floats, the more it frosts and the more of what's behind shows through.
status: stable
use_when:
  - Any surface with a z-index, side nav, header, right panel, menus, popovers, dialogs, notifications, pinned toolbars
avoid_when:
  - In-flow containers (cards, tiles, lists) → solid layers (layer-1..3)
  - Tooltips → the solid inverse surface
  - Custom blur or translucency → use a glass tier
---

> [!IMPORTANT] One rule: **the higher the layer, the more frosted it is.** More blur, a thinner fill, so more of what's behind shows through.

## Tiers

| Tier | Layer | Blur | Fill | Used by |
|---|---|---|---|---|
| `glass-1` | z-30 | 10px | 24% | Side navigation |
| `glass-2` | z-40 | 14px | 20% | Header |
| `glass-3` | z-50 | 18px | 16% | Right panel, menus, dropdown lists, popovers |
| `glass-4` | z-50, above an overlay | 24px | 80% | Dialogs, the one denser tier, so what you read in a dialog never blends into the page |
| `glass-5` | z-60 | 30px | 8% | Notifications, capsules |

## Rules

- **Use the utility, never a recipe.** `glass glass-N` gives the fill, blur, saturation, hairline border, inner highlight and overlay shadow together.
- **Pick the tier by layer.** The surface's z-index decides its tier; never choose one for looks.
- **Glass inside glass takes the lower tier.** A bar floating inside a glass panel (a chat header, a panel's toolbar) uses `glass-1`, so frost never stacks up.
- **The page scrolls under the shell.** `ShellMain` fills the window and the header, side nav and right panel float above it, so scrolled content passes beneath the glass. Sticky content stops at `--vita-shell-top`, just below the header.
- **See through, frosted.** Content moving beneath stays faintly visible through the blur, so people keep their place.
- **`elevated` surface.** Glass fills from `elevated`, the floating layers' own grey. Warmth is not theirs: it's the white point over the whole screen (see Theming).
- **A whisper of lift.** In light mode the glass brightens its backdrop slightly (`glass-lift`, 1.03); more would bleach the page to flat white.
- **Nothing filters a glass surface's ancestors.** A filter or opacity on a parent cuts the glass off from what's behind it, so entrance animations never hold a filter after they finish.
- **Reduced transparency.** People who ask for it get the solid `elevated` surface, with no blur.
- **Lighter on touch.** A backdrop blur is redrawn under every scrolled frame and costs the square of its radius. On touch devices every tier blurs at six tenths of its radius (6 · 8 · 11 · 14 · 18px); the order still rises with the layer and the scroll stays smooth.

## Never

- **Glass on in-flow cards or tiles.** Only surfaces with a z-index are material.
- **Stacking two glass tiers for effect.** Each surface has one tier.
- **Tooltips in glass.** They stay a solid inverse surface.
