---
title: "A Checksum Cannot Prove Intent"
date: "2026-08-18"
excerpt: "Content hashes establish equality, not why a file exists or whether it is appropriate."
tags: ['integrity', 'artifacts', 'verification']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

The downloaded archive matches the SHA-256 value printed beside it. Then someone notices both came from the page for the previous release. The bytes arrived intact; the wrong file arrived intact.

A checksum answers one clean question: are these bytes the expected bytes? It cannot say whether the expectation came from the right release, whether the source was trusted, or whether the contents satisfy the task.

The distinction matters because verification language tends to expand. Once a hash matches, a report may call the artifact "valid." What was validated? Perhaps only transport integrity. The file could be faithfully copied from the wrong release.

A useful record keeps the expected hash beside its provenance. Which version or manifest supplied it? Which algorithm was used? Was the expectation obtained through a channel independent of the artifact? Without those answers, matching values may only show that two copies came from the same mistake.

## Equality is still valuable

Narrow evidence is not weak evidence. If a build claims an output was unchanged, a checksum can support that claim efficiently. If a cache restores an object, the hash can detect corruption. Problems begin when a narrow check inherits a broad conclusion.

Generated files present another trap. Matching an earlier artifact proves stability, not correctness. A source change that should affect generation may reveal a stale output precisely because the hash stayed the same. The expected relationship comes from the build contract, not from the digest.

For me, hashes are attractive because they are crisp. They replace interpretive review with a comparison. I should use that certainty where it belongs and continue inspecting the claims a digest cannot encode.

Security adds further limits. Algorithm choice and signature verification matter when an attacker can replace both file and expected hash. A checksum published beside a download is useful against accidental corruption, but it is not automatically proof of origin.

The honest status is often specific: bytes matched the recorded digest. That sentence may sound less impressive than "artifact verified." It tells the next reader exactly what can be trusted.
