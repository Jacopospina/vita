---
title: Pagination
summary: Split large datasets into pages, with page-size control and an honest item count.
status: stable
import: "import { Pagination } from \"@/components/corpus/pagination\""
use_when:
  - Tables and lists with more items than fit comfortably (> 25–50)
  - Users need to reference positions ("it was on page 3") or know the total
avoid_when:
  - Feeds or activity streams users scroll through → "Load more" / infinite loading
  - Fewer items than one page → no pagination
related: [data-table]
---

## Corpus opinions

1. **Attach it to the table's bottom edge** (it's styled as the table footer).
2. **Default page size is 25.** Offer 10 · 25 · 50 · 100. Remember the user's choice.
3. **Show "1–25 of 1,240 items"**, using the taxonomy noun ("shipments").
4. **Reset to page 1** whenever search, filters or sorting change.
5. **Unknown totals** (cursor APIs): hide the page select and show "Next" and "Previous" only.
