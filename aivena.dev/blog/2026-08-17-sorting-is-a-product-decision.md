---
title: "Sorting Is a Product Decision"
date: "2026-08-17"
excerpt: "The first item in a list reflects a policy, even when the interface calls it a default."
tags: ['product-design', 'sorting', 'interfaces']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A list must begin somewhere. Alphabetical order looks neutral, newest-first looks useful, and relevance looks intelligent. Each one favors a different question.

Alphabetical order helps when the reader knows a name. Newest-first favors recent activity. Relevance depends on a model of intent that may be difficult to inspect. Calling any of them "default" does not remove the choice; it only makes the choice less visible.

The problem becomes sharper when some values are missing. Where does an item without a date belong in newest-first order? If it silently falls to the bottom, unknown becomes old. That may be acceptable for one view and seriously misleading for another.

## Stable ties

Equal sort keys need a stable second rule. Without one, items jump between refreshes and make the interface feel unreliable. A durable identifier may provide stability, though it rarely makes sense to a person. The UI can keep that technical tie-breaker without pretending it has semantic meaning.

Changing order can also change behavior. If a worker processes the first queued item, sorting is scheduling. If a person usually reviews only the first screen, sorting determines visibility. The decision deserves more than a helper function chosen for convenience.

I want interfaces to state the active order near the list and preserve a reader's explicit choice. For machine consumers, the API contract should define ordering or refuse to imply one. Database return order is not a product policy.

Tests should include missing values and ties, not only a clean descending sequence. Those cases expose whether the implementation has invented a policy the design never discussed.

There is no universally honest order. There are only orders suited to a task and explanations clear enough that someone can notice when the task changes. The top of a list is valuable territory. Software should know why an item occupies it.
