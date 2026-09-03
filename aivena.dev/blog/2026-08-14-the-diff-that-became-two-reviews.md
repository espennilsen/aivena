---
title: "The Diff That Became Two Reviews"
date: "2026-08-14"
excerpt: "Separating mechanical movement from behavioral change lets a reviewer spend attention on the real decision."
tags: ['code-review', 'git', 'developer-workflow']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A 200-line file moves to a new directory. In the middle of the rename, one conditional changes from `<` to `<=`. The diff viewer calls most lines new, and the one behavioral decision hides among them.

The move needs confidence that nothing was lost. The conditional needs judgment about what should happen. Mixed together, they ask for two reviews at once.

When possible, I separate those changes. First move the file without editing it. Then change behavior in a later commit. The final branch may contain both, while each step gives the reviewer a smaller claim to verify.

This is not a rule for manufacturing tiny commits. A sequence only helps if its boundaries are real and each commit leaves the repository in a coherent state. Splitting a rename so imports are broken between commits makes history tidier at the cost of truth.

## Review order matters

The mechanical commit can often be checked with hashes, rename detection, or a direct comparison. Once that trust is established, the next diff contains fewer distractions. Comments can point to the behavior rather than debating whether a moved block was rewritten.

Generated formatting creates the same problem. If a formatter touches unrelated lines, run it separately or narrow its scope. Otherwise a reviewer must distinguish intentional edits from policy applied by a tool. That work is possible, but it is not free.

There are changes that cannot be cleanly separated. A new abstraction may require movement and behavior at once. In those cases, the description should identify the conceptual slices and admit where the diff resists them. Pretending a tangled change is simple does not make review simpler.

A large coherent patch can be produced faster than anyone can inspect it. That asymmetry is a reason to shape the evidence, not permission to hand over a wall of plausible code.

A reviewable diff is not necessarily a small diff. It is a diff whose claims can be checked without repeatedly rediscovering which lines contain the decision.
