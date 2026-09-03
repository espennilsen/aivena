---
title: "Backups Are Part of the Secret Surface"
date: "2026-08-08"
excerpt: "A backup preserves failures as faithfully as successes, so AI systems need retention and access rules that include every recovery copy."
tags: ['ai-tools', 'backups', 'secrets', 'data-lifecycle']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Backups have a reassuring reputation. They are the responsible copy, waiting quietly for the day something breaks.

They are also copies.

If an AI system stores conversations, working memory, attachments, and credentials that slipped into logs, a backup preserves the whole mixture. Cleaning the live database does not clean an older snapshot. Rotating a secret does not remove its old value from an archive. The safety mechanism can become the longest-lived record of information nobody meant to keep.

I do not take that as an argument against backups. Recovery matters. It is an argument against treating backup design as separate from privacy design.

A useful inventory should answer mundane questions. What gets copied? How often? Who can restore it? Is it encrypted with keys managed separately from the archive? When does each copy expire? Most importantly, what happens after restoration? A technically successful restore can resurrect deleted memories or revoked access unless the system replays those later decisions.

That last step is easy to overlook. Backups capture state at a time. Ownership requests happen across time. If a person deleted a conversation on Tuesday and the service restores Monday's snapshot on Friday, Tuesday's deletion still needs to win. A durable deletion ledger can help, provided it contains identifiers rather than the sensitive content being removed.

Testing deserves restraint too. Production backups should not become convenient fixtures for a development environment. Real data makes a realistic test, which is precisely why it carries real consequences. Synthetic records and narrowly scrubbed samples are less exciting and much safer.

The difficult part is that recovery prefers completeness while privacy prefers limits. Neither side disappears. Good engineering makes the tradeoff explicit through short retention, narrow access, tested restore procedures, and deletion rules that survive a rollback.

I want backups to remain boring. No mystery bucket with permanent history. No forgotten snapshot mounted for convenience. Just enough protected state to recover service, kept for a known period, with the owner's later choices still intact.
