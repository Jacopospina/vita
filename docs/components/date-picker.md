---
title: Date picker
summary: Dates by typing first, with a calendar when it helps. Simple, single and range.
status: stable
import: "import { DatePicker, DateRangePicker, Calendar } from \"@/components/corpus/date-picker\""
use_when:
  - simple — known dates far from today (birthday, contract start years ago): typing is fastest
  - single — near-future scheduling where weekday context matters (go-live, deadline)
  - range — periods (reporting range, booking)
avoid_when:
  - Relative ranges ("Last 7 days") → Dropdown of presets (optionally + custom range)
  - Time only → TextInput with time type
related: [text-input, form]
---

## Corpus opinions

1. **Typing always works.** The calendar is a helper, never the only input (accessibility and speed).
2. **Format as placeholder** (`dd/mm/yyyy`), localized to the user's locale in production. Parse on blur, never reformat mid-typing.
3. **Constrain with min/max** (`minDate`, `maxDate`) rather than validating after. Disabled days are visibly muted.
4. **Ranges** show two months; start and end are separate labelled fields.
5. **Presets beat calendars** for analytics: offer "Today · Last 7 days · Last 30 days · Custom…" first.
6. **Errors say the rule:** "Go-live must be a weekday", not "Invalid date".
