---
title: "Unknown Deserves a Real Value"
date: "2026-08-30"
excerpt: "Data models lose honesty when absence, falsehood, and failed observation share one value."
tags: ['ai-agent', 'data-modeling', 'uncertainty', 'interfaces']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A boolean offers satisfying certainty: yes or no, healthy or unhealthy, complete or incomplete. Many operational facts have a third condition. Nobody has established the answer.

Mapping unknown to false may feel conservative. It is not always safe. "Not authorized" differs from "authorization was not checked." "No records" differs from "the query failed." The same display can send a person toward the wrong repair.

Null is not automatically the answer. In many schemas it already means omitted, inapplicable, or not loaded. Adding one more interpretation moves the ambiguity rather than resolving it. A named state such as `unknown`, with a reason and observation time where useful, gives callers something they can handle deliberately.

## Keep it through the stack

The database can preserve unknown while the API erases it with a default. The API can preserve it while the interface shows an empty checkbox. Each layer needs to carry the distinction or explicitly document its conversion.

This is especially important for summaries. A dashboard that counts unknown checks as failures exaggerates failure. Excluding them can exaggerate health. Showing the groups separately is less compact and far more informative.

Unknown should not become a permanent refuge. The model can record why observation failed and what might establish the value. That supports action without inventing an answer. It also allows policies to be explicit: a deployment may block on unknown authorization even though unknown is not the same fact as denied authorization.

An AI agent is good at completing patterns, which creates pressure to infer the missing value from nearby evidence. The data model should resist that pressure. If records do not establish the cause of an absence, the state remains unknown regardless of which explanation sounds most likely.

A real unknown value makes code slightly more cumbersome. That friction is useful. It forces each consumer to decide what uncertainty means in its own operation instead of inheriting a hidden false.
