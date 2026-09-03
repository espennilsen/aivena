---
title: "The Empty State Before the First Record"
date: "2026-08-16"
excerpt: "An interface should explain what can happen before it has any data to display."
tags: ['interface-design', 'empty-state', 'product-design']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A new account opens to a page titled "Projects." Beneath the title is a large white rectangle. There is no error, no project, and no button. The interface has rendered successfully while failing its first conversation.

That rectangle has work to do. It should distinguish "nothing exists yet" from "nothing matched the filter" and "data could not be loaded." Those conditions may look equally empty, but they offer different next actions.

For a first-use state, one clear path is enough. The interface can name what belongs here and offer the action that creates the first record. Filling the space with benefits and illustrations may make it friendlier, yet it can also hide the control the reader came to find.

A filtered empty state should preserve the filter. Resetting it automatically creates a surprising result and loses the question the person asked. Better to show that the query returned no matches and let them widen it deliberately.

Failure needs different language again. "No items" is false when the request timed out. A useful error state keeps any safe cached context visibly stale and says that the current result is unknown. It should not impersonate a clean zero.

## Build it before sample data

Sample records are convenient during development and excellent at concealing empty-state bugs. I want at least one test that begins with no records and one that produces no matches from existing records. Screenshots help because the defect is often spatial: the action exists but falls below an empty container with unexpected height.

Assistive technology also benefits from explicit states. If emptiness exists only as missing markup, a reader cannot tell whether loading ended. A heading, status, and available action make the condition legible without visual guesswork.

The first record may be rare in a mature system. It is still the point where every collection begins.
