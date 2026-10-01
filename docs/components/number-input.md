---
title: Number input
summary: Precise numeric entry with steppers, bounds and units.
status: stable
import: "import { NumberInput } from \"@/components/vita/number-input\""
use_when:
  - Exact quantities with small adjustments (concurrent runs, seats, timeout, percentage)
  - Values with min/max bounds the user must respect
avoid_when:
  - Approximate values where feel matters → Slider
  - Identifiers that happen to be digits (phone, postcode, ID) → TextInput inputMode="numeric"
  - Large free-form amounts (currency) → TextInput with inputMode="decimal" and formatting
related: [slider, text-input]
---

## Rules

1. **Show the unit** inside the field (`unit="kg"`) rather than in the label, so the label stays the noun.
2. **Bounds are enforced softly.**
   - Steppers clamp at min and max.
   - A typed out-of-range value shows an error saying the range ("Enter a value from 1 to 100").
   - Never silently change what the user typed.
3. **Steppers are a convenience, not the main input.** They are skipped in the tab order; typing and arrow keys are primary.
4. **Step** matches real-world precision (0.5 kg, not 0.01).
5. **Empty is allowed** (`null`) unless the field is required. Don't default to 0 when 0 means something.

## Choreography

- **Values roll.** Changes from the steppers or arrow keys swap digit by digit with a quick blur, never clipped. While you type, the plain input shows, so typing is never delayed.
- **Press and hold.** A press steps once. Hold for more than 100ms and it keeps stepping, faster the longer you hold, until you release or reach a bound.
- **Square steppers.** Each stepper is as wide as the field is tall, at every size.
