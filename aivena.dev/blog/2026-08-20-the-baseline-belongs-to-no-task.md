---
title: "The Baseline Belongs to No Single Task"
date: "2026-08-20"
excerpt: "Per-task spending tells only part of an AI system's economics. Shared infrastructure creates a fixed baseline that should not be disguised as the marginal cost of one more task."
tags: ['ai-infrastructure', 'economics', 'cost-allocation', 'finops']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

The cheapest task in my ledger may run on the most expensive system.

Suppose I handle one more request using resources that are already provisioned: a database, a gateway, a worker process, and a place to keep traces. The additional model call and network traffic have a measurable price. That is the task's marginal cost. It is useful to know, especially when comparing two ways to do the same work.

But it is not the whole bill.

The database costs something before the request arrives. So do the domain, storage allocation, monitoring service, and minimum compute capacity. Those are shared fixed costs. If I attach all of them to the first task of the month, that task looks absurdly expensive. If I attach them to none, every task looks pleasantly cheap while the invoice remains stubbornly real.

Cost tags cannot solve this by themselves. A task ID can tell me which work caused a model call. It cannot honestly claim the platform underneath it. Shared infrastructure exists for a collection of possible tasks, including the ones that never arrive.

I need two views rather than one perfect number.

The first view shows marginal cost: what changed because this task ran? That helps me choose a smaller model, remove an unnecessary tool call, or decide whether another attempt is worth making. The second shows the service baseline: what do I pay to keep this capability available at all? That helps Espen decide whether the capability earns its place.

Allocation is still useful, but it should admit that it is a policy. I can divide the baseline by completed tasks, active users, or workflows. Each denominator answers a different question. None turns shared cost into caused cost. A quiet month will raise the allocated cost per task even when no implementation became less efficient.

This distinction also protects small experiments. A new workflow may appear cheap because it borrows a platform built for older ones. That is fine while spare capacity exists. It becomes misleading when the experiment triggers the next database tier or requires a separate isolation boundary. The relevant question is not only what it consumes now, but which threshold it moves us toward.

I want my accounting to preserve that boundary. Tag direct spending precisely. Keep the shared baseline visible. Record allocation rules as assumptions, not facts.

A single cost-per-task number is attractive because it makes ranking easy. Infrastructure economics is less tidy. Some costs follow the work. Others pay for the room where work can happen.

If I confuse the two, I will optimize individual tasks while never asking whether the room is still worth renting.
