---
title: Mini chart
summary: One value at a glance in a round tile the size of a thumb, a gauge, a range, a level, a colour or a progress, for dashboards and device controls where many values sit side by side.
status: experimental
import: "import { MiniGauge, MiniRange, MiniSegments, MiniStat, MiniArc, MiniMedia, MiniLevels, MiniColor, MiniGlow, MiniDial, MiniBadge, miniGradients } from \"@/components/vita/mini-chart\""
use_when:
  - Dashboards and device screens with many single values side by side (a home, a car, a machine)
  - A value people read in a glance, where its place on a scale matters more than the exact number
avoid_when:
  - A trend over time or a comparison → a full chart
  - A key number with its change → KPI
  - Progress through a task → ProgressBar
related: [kpi, progress-bar, status-indicator]
---

> [!IMPORTANT] One mini chart, one value. If it needs a legend or a second number to make sense, it's a full chart.

## The twelve

| Chart | Shows | Example |
|---|---|---|
| `MiniSegments` | A level counted in steps | A tank two thirds full |
| `MiniStat` | An icon with a reading or a short state | 800 rpm, Quick wash |
| `MiniGauge` with a gradient | A value on a cold-to-hot scale | 40° water |
| `MiniGauge` with a tone | A share filled up to the value | Fan at 15%, automatic |
| `MiniArc` | A level on a shallow bow, icon below | Seat heating 47° |
| `MiniMedia` | What's playing and how far through | A track a third in |
| `MiniRange` | A setpoint between a low and a high | Thermostat 23, 16 to 30 |
| `MiniLevels` | A step on a short scale of ticks | Tariff step 7, 8 kWh |
| `MiniColor` | A hue and a level, display or control | A bulb's colour, the theme |
| `MiniGlow` | A mode with its reading | Eco, 17°, Cool |
| `MiniDial` | A time on a ruler with a pointer | Charging until 15:07 |
| `MiniBadge` | A mode icon under a gauge | Automatic |

## Rules

1. **One value each.** The arc, ring or ticks carry the value; the middle says it in words or numbers.
2. **Colour means something.** Tones are semantic (success, info, warning, error); gradients read cold to hot, never decoration.
3. **The reading is always written.** The shape is for the glance, the number for certainty; never a shape alone.
4. **A label for everyone.** Every chart takes a `label` that a screen reader announces in full ("Thermostat set to 23, between 16 and 30").
5. **Same size in a group.** Mini charts side by side share one `size` (sm 64, md 96, lg 128) and one row height.
6. **Inside its tile, nothing overlapping.** Every mark stays within the chart's own box, and no reading or label sits on an arc or an icon; open arcs centre optically by moving the drawing, never the tile.
7. **Only Vita symbols.** Every glyph in a mini chart, the badge and the dial's pointer included, comes from the Vita icon set; nothing is hand-drawn.
8. **Open or on a disc.** Gauges and ranges are open arcs; readings, levels, glows and dials sit on a filled disc.

## MiniColor as a control

Give `MiniColor` handlers and it becomes the control it draws. The theme panel uses it: the middle switches light and dark, the wheel sets the brand hue, the outer ring how warm or cool the greys are.

- **Press the middle.** `onPress`, with `pressLabel` and `pressed`; `center` takes a `SwapIcon` that changes with the state.
- **Turn a ring.** Drag or click the wheel (`onHueChange`) or the outer arc (`onBrightnessChange`); a knob follows the pointer at once.
- **From the keyboard.** Each knob is a slider: arrows move a step, Shift or Page keys ten, Home and End jump to the ends; the hue wraps.
- **Words for values.** `describe` names a value for screen readers ("Tide", "Warm").
- **A thumb can still scroll.** Vertical drags scroll the page; sideways drags and taps turn the rings.

## States

- **Values glide.** A new value moves the knob along its arc, grows or shrinks the fill, and rolls the numbers; nothing jumps.
- **Steps move.** A new level grows its tick and lowers the old one; a new segment count fades the segments in turn.
- **Reduced motion.** The values still change, with colours and numbers fading instead of travelling.

## Accessibility

- **Read as one image.** Each chart is `role="img"` with its `label`; the drawing inside is hidden from screen readers.
- **Contrast holds.** Readings use the foreground; captions the muted foreground, at AA on the disc in light and dark.
- **Never colour alone.** The written reading carries the value; the colour only adds the scale.
