---
title: KPI
summary: A key number with its label and trend. Group related KPIs in one surface; put a page's headline numbers on the right of its header.
status: stable
import: "import { Kpi, KpiGroup } from \"@/components/corpus/kpi\""
use_when:
  - Dashboards and overview pages — the handful of numbers that summarise a thing
  - A page header's summary (PageHeader kpis)
avoid_when:
  - Many numbers to compare row by row → DataTable
  - A state rather than a number → StatusIndicator
  - Progress toward a limit → ProgressBar
related: [page-header, data-table, status-indicator, common-actions]
---

## Anatomy

`Label` → **Value** → `↑ 12% vs last week` → helper text

- **Label.** What is counted, in plain words ("Runs today").
- **Value.** A number, formatted with `format` (currency, percent, units, compact). It swaps digit by digit when it changes, always in regular weight.
- **Trend (optional).** An arrow for the direction and the change, coloured by whether it's good for this metric (`better`), plus the period it compares against.
- **Helper (optional).** One caption line of context.

## Trend colour

| Change | `better="up"` (runs, revenue) | `better="down"` (errors, cost, wait time) |
|---|---|---|
| Up | Green | Red |
| Down | Red | Green |
| None | Muted, flat dash | Muted, flat dash |

## Rules

1. **Three to five per group.** More numbers than that is a table.
2. **Belonging has no gaps.** Related KPIs share one `KpiGroup` surface with dividers, never separate cards with gaps.
3. **Always say against what.** A trend without a `period` is a guess.
4. **Never colour alone.** The arrow carries the direction; colour adds good or bad.
5. **In a page header, small and bare.** `<KpiGroup bare>` with `size="sm"` Kpis, on the right of the title, before any actions.

## Sizes

- **`sm`.** Page headers and strips.
- **`md`.** Cards and dashboards (default).
- **`lg`.** One hero number.
