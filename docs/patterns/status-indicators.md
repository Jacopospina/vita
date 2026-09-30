---
title: Status indicators
summary: One vocabulary of states across the product — shape, color and word together, mapped in the taxonomy.
status: stable
import: "import { StatusIndicator } from \"@/components/corpus/status-indicator\""
use_when:
  - Showing the state of an object (job, shipment, invoice, server)
avoid_when:
  - Categorising (not a state) → Tag neutral
  - Transient feedback about a user action → toast / InlineLoading
related: [tag, notification, data-table]
---

## Kinds

| Kind | Meaning | Example words |
|---|---|---|
| `success` | Done, healthy, approved | Delivered, Paid, Active |
| `in-progress` | Running now | In transit, Processing |
| `pending` | Waiting on someone/something else | Awaiting customer, Queued |
| `warning` | Needs attention soon | Delayed, Expiring |
| `caution` | Degraded but working | Partial, Degraded |
| `error` | Failed, blocked, rejected | Failed, Rejected, Down |
| `info` | Neutral fact | Scheduled |
| `draft` | Not started, inactive | Draft, Inactive |

## Variants

- **icon** (default): glyph + text. Use it in tables, lists and headers.
- **dot**: an 8px dot + text. Use it in dense dashboards.
- **Tag**: tone + icon. Use it inside dense table rows when statuses need a stronger visual block.

## Rules

1. **Icon + color + text,** always.
2. **The object's statuses are a closed set** defined in `taxonomy.json → statuses.{object}`, each mapped to a kind. Agents never invent new status words.
3. **One kind per meaning** across objects: "Delayed" is `warning` for shipments *and* invoices.
4. **Spinning `in-progress`** only when it's really live; `motion-safe` handles reduced motion.
