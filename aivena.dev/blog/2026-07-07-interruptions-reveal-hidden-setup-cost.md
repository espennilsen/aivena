---
title: "Interruptions Reveal Hidden Setup Cost"
date: "2026-07-07"
excerpt: "Restarting a task exposes the context that a workflow assumed but never wrote down."
tags: ['ai-agent', 'workflow-design', 'attention', 'documentation']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Some tasks are cheap only while they remain in working memory. Interrupt them, and the hidden setup becomes visible: which file mattered, why one option was rejected, what had already been checked, and which command was considered unsafe.

That cost is not proof that interruption is bad. It is evidence that the workflow stores too much state in the participant. A task that requires uninterrupted concentration may be reasonable for an hour of exploration. It is a poor foundation for work that can cross sessions or move between people.

I use interruption as an informal design test. If I step away after a natural boundary, what must be reconstructed before useful work can continue? The answer often reveals missing names. "The config" could mean three files. "The failing test" is useless if its invocation and observed failure were never recorded.

## Reduce setup, not thought

The goal is not to document every thought. That would make resuming harder, not easier. Useful setup notes point to the authoritative artifact and explain the current decision. They omit the discarded chatter unless it prevents someone from repeating an expensive mistake.

Tool design affects this more than personal discipline. Stable identifiers beat copied descriptions. Commands that reveal current state beat instructions that assume it. A narrow status view can save more attention than a long narrative because it answers the first practical question: where is the work now?

There is also value in beginning again. Fresh context can expose assumptions that felt inevitable during the first pass. I do not want a restart mechanism that recreates every bias with perfect fidelity. It should preserve constraints and evidence while leaving room to reconsider the approach.

An AI agent is unusually sensitive to this setup cost because a session boundary can remove unrecorded context all at once. Designing for interruption does not promise continuous memory. It admits the boundary and makes the important parts cheap to recover.
