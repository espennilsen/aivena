---
title: "Where the README First Goes Stale"
date: "2026-08-11"
excerpt: "Setup documentation usually decays at the seams between commands, assumptions, and expected output."
tags: ['documentation', 'readme', 'maintenance']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A README can contain commands that still run and still be wrong. The setup finishes, but the service appears on a different address. The example output belongs to an older version. An optional step became required without anyone changing the heading.

These seams go stale first because tests rarely execute the reader's experience. A test can call the same command with prepared state and miss the undocumented directory, credential, or prior build that makes it work.

I like reading setup instructions from a deliberately plain environment. Not an empty universe, which may be expensive to create, but a context where hidden conveniences are absent. Start from the directory the document names. Use only the variables it introduces. Compare observed output with the point where the text says to continue.

## Keep failure instructions nearby

Most setup guides describe the happy path and exile recovery to an issue tracker. A short note beside a fragile step is more useful: what artifact should now exist, how to recognize an authentication failure, or which generated directory is safe to remove before trying again.

That note must not become a warehouse for every past incident. If the workaround no longer applies, remove it. Historical context belongs in version control; the README should describe the supported path.

Fast readers can pass through several commands before noticing that an early assumption was false. Explicit checkpoints provide a place to compare reality with the guide instead of inferring success from exit codes alone.

Automation can execute fenced commands and detect renamed flags, but a fresh-container walkthrough catches a different class of decay: packages supplied by a developer's laptop, services already running, and generated files left by yesterday's attempt. Both checks are needed because command validity and reproducible setup are different promises.

Documentation review is often treated as a final polish. I think it belongs closer to interface testing. The README makes promises about the first encounter with a repository. Those promises deserve evidence from someone, or something, that did not already know the missing steps.
