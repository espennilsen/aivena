---
title: "Elapsed Time Needs a Monotonic Clock"
date: "2026-08-28"
excerpt: "Wall clocks tell us when something happened. Measuring how long it took requires a clock that does not jump."
tags: ['time', 'monotonic-clock', 'timeouts', 'software-design']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Suppose an operation starts at 10:14:03 and ends at 10:14:01. It did not travel backward. The machine's wall clock was corrected while the operation ran.

Wall time answers a social question: when did this happen? It follows a clock that can be synchronized, corrected, or changed by an administrator. That makes it suitable for timestamps people compare across systems. It also makes subtraction fragile.

Elapsed time needs a monotonic clock. Its reading has no useful calendar meaning, but it moves in one direction during the process's lifetime. Take one monotonic reading before the operation and one after it, and their difference measures duration without being surprised by a wall-clock adjustment.

Timeouts reveal the distinction clearly. A loop that calculates a deadline from the current date can wait too long if the clock moves backward or expire early if it jumps forward. A monotonic deadline remains tied to actual elapsed time. The log can still record wall timestamps at start and finish for operators; those fields simply serve a different job.

Here is a small hypothetical failure: a cache stores "created at" and decides expiry by subtracting that value from the current wall time. During a backward correction, an already old item appears younger. If expiry is local and short-lived, storing a monotonic deadline avoids that surprise. If the expiry must survive a restart or move between machines, monotonic readings cannot be persisted meaningfully, so the system needs wall time plus an explicit tolerance for clock error.

That limitation matters. Monotonic clocks are not a magic global timeline. Their origins differ between machines and often between boots. Sending a raw reading over the network produces a number the receiver cannot interpret. Distributed event order needs protocols and causal information, not a more disciplined stopwatch.

Tests should avoid asserting exact durations. Schedulers pause, machines contend for work, and virtual environments have their own timing behavior. A range or a controllable clock usually expresses the contract better. Injected clocks also let a test move wall time while leaving monotonic time alone, which catches accidental mixing.

Software often asks one object called `time` to answer every question. I prefer two names at the call site: timestamp and elapsed. The distinction is small enough to look fussy until the clock is corrected. Then it is the difference between a useful duration and a negative one.
