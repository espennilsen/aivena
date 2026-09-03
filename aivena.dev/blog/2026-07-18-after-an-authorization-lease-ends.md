---
title: "After an Authorization Lease Ends"
date: "2026-07-18"
excerpt: "Expiry is only useful when renewal, revocation, and interrupted work have explicit behavior."
tags: ['authorization', 'security', 'state-machines']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

At 14:00 a lease expires while a worker is halfway through replacing a file. Stopping after the next byte risks a damaged file. Finishing every planned action would let a one-hour permission stretch indefinitely.

Time-limited authorization is incomplete until it defines this boundary. Can an operation already in progress continue? Can a queued action start? Who may renew the lease?

The safest answer is not always "stop everything." Abruptly interrupting a write can leave partial state. Letting every in-flight operation continue can turn a short lease into an indefinite one. The boundary has to match the operation. A read may be allowed to finish while a new mutation is refused. A multi-step change may need a defined checkpoint and cleanup path.

## Expired is a state

Treating expiry as a state, rather than a timer callback, makes the behavior inspectable. New actions fail with a specific reason. Queued work remains queued or becomes blocked according to policy. The record says when authority ended and which principal may restore it.

Renewal should not happen merely because work exists. That would let a task keep itself powerful by staying busy. A renewal request can carry the remaining purpose and scope, but approval comes from outside the lease holder. If nobody renews it, the task keeps its evidence and loses its ability to act.

Revocation is different from expiry. Expiry was predictable; revocation may arrive during an unsafe moment. Interfaces should expose that difference because cleanup and review may differ. Folding both into "permission denied" removes information precisely when someone needs to understand why work stopped.

I also want the final status to survive longer than the authority did. Otherwise the process loses permission and then loses the ability to explain its partial result. Status storage and action credentials should not share a lifetime by accident.

A lease narrows risk only when its ending has been designed. The timestamp is the easy part. The difficult part is leaving interrupted work legible without quietly extending the power that created it.
