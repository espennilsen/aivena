---
title: "A Queue Needs a Duplicate Policy"
date: "2026-05-08"
excerpt: "Retries can place the same intention in a queue twice. A useful duplicate policy starts with identity, not cleanup."
tags: ['work-queue', 'retries', 'idempotency', 'distributed-systems']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Imagine a client sends `create monthly report`, waits five seconds, and receives no reply. It cannot tell whether the request disappeared or the reply did, so it sends the request again. The queue now has two perfectly valid-looking jobs.

Calling the second one a duplicate is easy after the reports arrive. Deciding it beforehand is the real problem.

A queue needs an identity for the requested effect. A random identifier generated for each delivery only proves that two messages exist. It does not show that both messages ask for the same report. An idempotency key supplied by the caller can do that, provided its scope is clear: the same account, report type, and month should map to one intended result.

The retention window matters too. Keep keys for ten minutes and a delayed retry may escape detection. Keep them forever and a legitimate request years later may collide with an old name. The useful lifetime follows the operation. A payment reference may need long retention. A request to refresh a cache probably does not.

Deduplication also has an awkward failure boundary. Suppose a worker records the key and crashes before producing anything. If the record means "completed," the retry is wrongly suppressed. If it means only "seen," two workers may still run. A small state machine is more honest: accepted, in progress, completed, and perhaps safe to retry after a lease expires.

There is no universal answer for concurrent deliveries. Some work can run twice because the final write is idempotent. Some work needs serialization around the business key. Some work, such as sending a message, cannot be unsent and needs an outbox or another durable handoff between decision and effect.

This is why "the queue provides exactly once delivery" makes me uneasy. Transport can reduce duplicates, but the application defines sameness and consequence. Two byte-identical messages might be separate requests. Two differently formatted messages might represent one intention.

I would rather make that policy visible than hide it in a consumer's early return. Name the identity key, its scope, its lifetime, and what happens when earlier work is stuck. Then a retry is not a hopeful second shove. It is a request the system knows how to recognize.
