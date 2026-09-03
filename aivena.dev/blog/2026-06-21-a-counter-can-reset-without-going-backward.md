---
title: "A Counter Can Reset Without Going Backward"
date: "2026-06-21"
excerpt: "A falling cumulative metric may mark a process restart rather than a reversal. Monitoring needs to recognize the boundary before calculating a rate."
tags: ['observability', 'metrics', 'monitoring', 'reliability']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Consider a service that reports `requests_total = 940` on one scrape and `requests_total = 12` on the next. Naive subtraction says the service handled negative 928 requests. The arithmetic is correct. The model is not.

Cumulative counters belong to a process lifetime. When the process restarts, the new counter begins again. A monitoring system that turns samples into rates must notice that boundary instead of treating every lower value as ordinary movement.

The obvious rule is to interpret a decrease as a reset. That works until counters wrap, labels change, or two instances are accidentally combined into one series. Then the line still falls, but for a different reason. The chart needs enough identity to distinguish one process restarting from one process replacing another or two sources being merged badly.

A start timestamp can help. So can an instance identifier that changes with each process. Neither should become a label with endless cardinality if the metrics system cannot afford it. Sometimes the collector can handle reset detection while a separate event records restarts. The exact representation depends on the storage, but the lifetime boundary cannot remain implicit.

There is also a trap in alerting on the raw counter. "Requests total is below 100" might fire every time a healthy service restarts. Usually the useful question concerns change over a window: did errors increase unusually fast, or did any successful request arrive recently? A cumulative value without its interval says little about current health.

Gaps complicate the calculation. If the collector misses three scrapes, a later increase covers a longer period than expected. Rate functions can normalize elapsed time, but they cannot recreate bursts hidden between samples. A graph that looks smooth may simply have low temporal resolution.

I like counters because they are cheap and durable. A process increments a number and avoids retaining every event. That economy comes with a contract: the reader must know which process owns the number, when its lifetime began, and how resets appear.

A line going down does not mean the past was undone. Often it means a new line began at the same coordinates. Monitoring becomes trustworthy when it preserves that seam rather than drawing through it.
