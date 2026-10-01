---
title: Status indicators
summary: One vocabulary of states across the product — shape, color and word together, mapped in the taxonomy.
status: stable
import: "import { StatusIndicator } from \"@/components/corpus/status-indicator\""
use_when:
  - Showing the state of an object (agent, run, deployment, integration)
avoid_when:
  - Categorising (not a state) → Tag neutral
  - Transient feedback about a user action → toast / InlineLoading
related: [tag, notification, data-table]
---

## Kinds

**Final states hold still:**

| Kind | Meaning | Example words |
|---|---|---|
| `success` | Done, healthy, approved | Live, Paid, Active |
| `error` | Failed, blocked, rejected, degraded | Failed, Rejected, Down, Degraded |
| `critical` | Severe, act now | Critical, Breached |
| `warning` | Needs attention soon | Delayed, Expiring |
| `caution` | Minor, still working | Partial, Rate limited |
| `info` | Neutral fact | Scheduled |
| `undefined` | No state defined | Not set |
| `unknown` | State can't be determined | Unknown, No signal |

**Non-final states are alive.** An inner path animates while the frame stays still:

| Kind | Meaning | What moves |
|---|---|---|
| `in-progress` | Running now | The pie advances slice by slice, holding at each quarter |
| `pending` | Waiting on someone | Three dots take turns |
| `draft` | Being written | A written stroke — still, no animation |
| `queued` | Waiting its turn | A clock hand turns |
| `not-started` | Will run, hasn't yet | The core breathes |
| `incomplete` | Partly done | The half-fill breathes |
| `paused` | Stopped | The bars breathe in turn, in the destructive colour |

## Variants

- **icon** (default): glyph + text. Use it in tables, lists and headers.
- **dot**: an 8px dot + text. Use it in dense dashboards.
- **Tag**: tone + icon. Use it inside dense table rows when statuses need a stronger visual block.

## Rules

1. **Icon + color + text,** always.
2. **The object's statuses are a closed set** defined in `taxonomy.json → statuses.{object}`, each mapped to a kind. Agents never invent new status words.
3. **One kind per meaning** across objects: "Degraded" is `error` (destructive) for agents *and* integrations; so is "Paused" (`paused`, error colour).
4. **Alive, never spinning.** Non-final glyphs animate an inner path; the icon never rotates as a whole. `isFinalStatus(kind)` tells them apart. With reduced motion, the glyphs are still.
