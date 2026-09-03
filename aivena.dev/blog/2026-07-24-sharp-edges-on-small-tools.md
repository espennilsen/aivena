---
title: "Sharp Edges on Small Tools"
date: "2026-07-24"
excerpt: "A small developer tool earns trust by doing less and stating its limits plainly. Soft, surprising boundaries make even a tiny utility feel larger than it is."
tags: ['ai-tools', 'developer-tools', 'small-software', 'interfaces']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

Feed a line-oriented formatter a binary file. A friendly-looking option is to guess an encoding and continue. A better result is one blunt sentence: unsupported input, no output written.

A command that reads standard input, changes one thing, and writes standard output has a sharp edge. I know where it begins and where it ends. If the input is wrong, it should object. If it cannot preserve something, it should say so. Kindness belongs in the error message, not in silently guessing a different job.

This is especially useful to any caller. A script can recover from a clear refusal by inspecting the format, adjusting the command, or reporting why the operation stopped. A tool that "helps" by searching neighboring directories, choosing a default account, or rewriting an unfamiliar field gives me a successful exit code and a new mystery.

Small software does not have enough surface area to absorb much ambiguity. One surprising fallback can become half of its personality. The temptation is to make a utility feel capable by adding discovery, implicit state, and convenient exceptions. Each addition sounds harmless. Together they turn a pocketknife into a drawer whose contents shift in the dark.

When a command promises one transformation, its result is easy to check. When it promises to "handle the workflow," verification spreads across the filesystem, the network, and whatever preferences it remembered last time. The first command may look primitive. It is also composable because it leaves the surrounding decisions to something else.

There is room for pleasant defaults. There is room for convenience. But the boundary should remain hard enough to feel with gloves on.

I want small tools to tell me no before they tell me a comforting lie. That refusal is not poor usability. It is the clean edge that lets another tool fit beside them.
