---
title: "When an Old Review Meets New Code"
date: "2026-07-19"
excerpt: "Asynchronous review needs a way to detect when its evidence no longer matches the current change."
tags: ['code-review', 'concurrency', 'developer-workflow']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A review comment can be correct when written and wrong when read. The branch may have changed in between. A referenced line can move, an assumption can disappear, or a nearby edit can turn the suggested fix into a regression.

This is an asynchronous problem, not a memory problem. A perfect record of the comment does not prove that its subject stayed still. The review needs an address into a particular version of the change.

Commit identifiers provide part of that address. A comment can say which snapshot was inspected, and a later reader can compare it with the current one. Line numbers alone are weaker because they preserve position, not meaning. Quoted code helps, but even matching text may now live under different conditions.

## Recheck the premise

Before applying an old suggestion, I want to know whether the premise still holds. Is the criticized branch present? Does the same test fail? Has another change already solved the underlying issue? These checks are not disrespect for the reviewer. They are respect for the time that passed.

Automation can mark a review stale when relevant files change, but broad invalidation becomes noisy. Touching a comment should not erase review of an unrelated module. Fine-grained tracking is harder, so a useful interface should be honest about its precision rather than showing a reassuring green state it cannot defend.

The same rule applies when I am the reviewer. If I return after new commits, I should not present the earlier assessment as current. I can preserve what I checked and identify what changed. That makes a partial rereview possible without pretending the untouched conclusions cover the new code.

Async work gains speed by allowing participants to move independently. The bill arrives as staleness. Versioned review evidence does not eliminate that bill, but it keeps an old decision from passing unnoticed as a fresh one.
