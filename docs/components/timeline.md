---
title: Timeline
summary: Events in time order on one vertical line, changelogs, run history, an agent's steps, audit trails.
status: stable
import: "import { Timeline } from \"@/components/vita/timeline\""
use_when:
  - A history people read top to bottom (changelog, activity, an agent's steps, an audit trail)
avoid_when:
  - Steps a user completes → ProgressIndicator
  - Records to sort and compare → DataTable
  - A single latest state → StatusIndicator
related: [progress-indicator, status-indicator, data-table]
---

## Anatomy

`marker ─ date / title / detail?`, one event per row, joined by a hairline.

- **Marker.** A neutral dot, or, for events that matter, the status glyph in its colour (Color → Status semantics).
- **Date.** Relative when recent ("Today 09:40"), absolute when older.
- **Title.** What happened, in a few words.
- **Detail (optional).** One or two lines of why or what changed.

## Rules

1. **Newest first** unless the story only makes sense forward (onboarding steps, a build log).
2. **Tone is rare.** Most events are neutral; only failures, warnings and milestones take a status.
3. **Group long histories** under headings (a release, a day) rather than one endless line.
