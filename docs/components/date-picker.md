---
title: Date picker
summary: Dates by typing first, with a calendar when it helps. Simple, single and range.
status: stable
import: "import { DatePicker, DateRangePicker, Calendar } from \"@/components/vita/date-picker\""
use_when:
  - simple, known dates far from today (birthday, contract start years ago): typing is fastest
  - single, near-future scheduling where weekday context matters (go-live, deadline)
  - range, periods (reporting range, booking)
avoid_when:
  - Relative ranges ("Last 7 days") → Dropdown of presets (optionally + custom range)
  - Time only → TextInput with time type
related: [text-input, form]
---

## Rules

1. **Typing always works.** The calendar is a helper, never the only input (accessibility and speed).
2. **Format as placeholder** (`dd/mm/yyyy`), localized to the user's locale in production. Parse on blur, never reformat mid-typing.
3. **Constrain with min/max** (`minDate`, `maxDate`) rather than validating after. Disabled days are visibly muted.
4. **Ranges** show two months; start and end are separate labelled fields.
5. **Presets beat calendars** for analytics: offer "Today · Last 7 days · Last 30 days · Custom…" first.
6. **Errors say the rule:** "Go-live must be a weekday", not "Invalid date".

## Months and presets

- **One or two months.** `months={1}` suits single dates; ranges default to `months={2}` so start and end are visible together.
- **Presets are blended actions.** `presets` puts common choices ("Last 7 days", "This month") beside the calendar as one joined group on a single surface. Picking one selects it and moves the calendar there; the current preset stays highlighted.
- **Ready-made sets.** Use `datePresets` and `rangePresets`, or pass your product's own common choices.

## Calendar

- **Easy targets.** Days are 36px squares with roomy month navigation.
- **One band per range.** A range is a continuous band rounded only on its outer corners: the left of the first day, the right of the last. Days in between are square. When a range wraps, each week row's band is rounded where the row's highlight begins and ends.
- **Months slide.** Moving forward, the new month slides in from the right and the old one slides out to the left; moving back, the reverse. The month name crossfades with it.
- **Drag to turn the month.** Pull the grid sideways with a thumb or the mouse and the next (or previous) month comes along with it, already visible. Let go past a third of the width, or with a flick, and it snaps into place; a shorter pull springs back. The arrows still work; a press that doesn't move still picks a day.
