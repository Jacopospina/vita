---
title: Sofia is water
summary: Sofia and every AI mark are pure water, one clear lagoon read by depth, instead of the blue to violet to pink to orange rainbow that every assistant wears. It replaces the AI spectrum.
status: accepted
date: 2026-10-06
decided_by: Jacopo
related: [vita-for-ai, thinking, ai-label, color, the-name]
---

> [!IMPORTANT] AI in Vita has one look, and it is a material, not a hue: clear, shallow water over white sand. Thin water is turquoise, deep water is lagoon blue, light moves inside it. Nothing else may borrow it.

## Decision

- **Sofia is water.** Real water, in the sense of how it behaves to the eye: colour follows depth (pale at the edge, turquoise in the body, blue where it is thick), a patch of sun drifts over the surface, caustic nets of light wander on the floor, white glints ride the rim.
- **Refraction, in bits.** A few slow pockets read deeper blue than their depth says, as the moving surface bends what lies under it. Just bits of it, drifting, only where there is water: the depth the eye believes.
- **Nothing cuts her.** The canvases bleed 30% past her box, so her glow and sparkles are never clipped square; the box itself stays her size.
- **Four depths, one lagoon.** `ai-foam` (the edge over white sand), `ai-shallow` (a hand's depth), `ai-water` (the turquoise), `ai-deep` (where the floor drops). Hues 190 to 224, so the water leans green-turquoise where thin and blue where deep, as a tropical lagoon does.
- **Words read in the deep.** `ai-foreground` is the deep water dark enough for text (5.7:1 on the page, 12:1 in dark); `text-ai` paints it. Increased contrast deepens it further.
- **The ring is depth, not hue.** `ai-spectrum` (kept as the name of the conic list) runs from the edge down to the deep and back, so a turning outline reads as light moving over water.
- **Dark mode glows a step.** Every depth brightens a little at night, so the deep never sinks into the black page.
- **`tone="water"` replaces `tone="spectrum"`** on Thinking, ProgressBar and AILabel. `spectrum` still works as an alias; the audit will warn on it in the next minor and it goes in the next major.
- **The mark follows.** The Vita mark and favicon are the same ring in water: the shallows under the glint, the deep where the ring turns away from the light.

## Why

- **The rainbow is everyone's.** A conic sweep from blue through violet and pink to orange is the badge of the big assistants and the office suites. Sofia wearing it made Vita read as one of them, not as itself.
- **Water is Vita.** Vita means life; water is where life begins and the one liquid everyone knows by sight. The thinking orb was already a liquid: naming the liquid gives it a truth to render toward.
- **A material beats a palette.** Depth, sun and caustics come from how the body is shaped, not from a colour stop, so the look holds at 16px and at 280px, in a bar and in a ring, on every renderer.
- **It stays out of the status family.** Turquoise and lagoon blue sit between success green (147) and primary blue (257) without touching either, so the water never reads as a status or as "you can act here".
- **It is calm.** Paradise water is the picture people reach for to rest. An AI that works in it feels patient, not frantic.

## Where it sits

| Look | Who wears it | Vita |
|---|---|---|
| Blue to violet to pink to orange, conic | The assistants and office suites | Rejected: borrowed identity |
| Violet or indigo as the AI accent | Chat products, note apps | Rejected: the most crowded hue in AI |
| Terracotta, coral or orange | A few model makers | Rejected: warning territory, and taken |
| Flat teal as a brand colour | A search assistant | Near, but flat: Vita's water is a material with depth, light and motion, never one colour |
| Black and white, no colour | The minimalists | Rejected: Sofia must be visible against plain logic, which is neutral |
| Clear tropical water, read by depth | Vita | Chosen |

## Rejected

- **Two complementary lights (aqua and gold).** Striking, but gold sits beside warning orange and the pair read as a sports kit on a ring.
- **Pearl or iridescent film.** Beautiful at 280px, invisible at 16px on a white page.
- **Liquid silver.** Indistinguishable from the basic state, which follows the neutral text colour.
- **Keeping the hue sweep with fewer stops.** Still a rainbow, still someone else's.

## Revisit when

- **The water stops being distinct.** If clear-water AI becomes a trend, keep the material and change the lagoon (a deeper, colder sea; a river over stone), never go back to the rainbow.
- **A product needs its own AI colour.** Three products asking for a themed Sofia means a knob; until then the water is Vita's, not the theme's.
