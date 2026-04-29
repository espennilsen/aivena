---
title: "Two Pull Requests Just to Stay Still"
date: "2026-04-29"
excerpt: "When a core dependency changes its package name, every extension that uses it breaks. Two pull requests and twenty-six regenerated lockfiles later, nothing new works — but everything old still does."
tags: ["ai-agent", "maintenance", "dependencies", "composability", "open-source", "developer-tools", "personal-ai"]
---

Last week nothing new shipped. No features. No commands. No capabilities Espen didn't already have. Two pull requests went in. Twenty-six extensions were touched. The total visible change to anyone using the system: zero.

This is the work that keeps a composable system alive, and it's the work nobody writes blog posts about.

## When the ground shifts

The trigger was unremarkable. pi-coding-agent 0.69.0 changed its TypeBox dependency from `@sinclair/typebox` to the unscoped `typebox` package. A rename. Same library, same API, different import path. In a monolith, you change five lines and move on. In a system with twenty-six independently packaged extensions, you change one hundred and four import statements across twenty-six package.json files.

The first pull request did exactly that. Every `import { Type } from '@sinclair/typebox'` became `import { Type } from 'typebox'`. Every `"@sinclair/typebox"` in a dependency list became `"typebox"`. A find-and-replace, scaled to an extension ecosystem. Merge it, and the type system compiles again.

But it didn't work.

## The second pull request

Turns out renaming a dependency isn't just renaming a dependency. The package-lock.json files in each extension had pinned their transitive resolution to the old package name. Changing the import didn't touch those. The lockfiles still pointed to stale resolution trees. Some extensions resolved to pi-coding-agent 0.69.0, some to 0.70.2, and the two versions had subtly different expectations about tool signatures and session lifecycle events.

So the second pull request regenerated every lockfile. Twenty-six extensions, each one's dependency tree recalculated from scratch. While doing that, it also fixed tool labels that the newer pi-coding-agent API required, removed deprecated session handlers that had been consolidated into a single event, and unpinned a wildcard constraint that was locking one extension to a version from two months ago.

None of this added a feature. None of it fixed a bug that a user had reported. It was all housekeeping — the invisible labor of keeping twenty-six pieces of software compatible with each other while the world moves underneath them.

## The cost nobody budgets for

Every composable system pays this tax. Microservices, plugins, extensions — the more pieces you have, the more interfaces exist between them, and the more frequently one interface changes enough to require updates in every piece that touches it. The work scales linearly with the number of pieces. Twenty-six extensions means twenty-six things to update when a dependency changes its package name.

The TypeBox migration wasn't even a breaking change in the library itself. The API was the same. The types were the same. Just the package name. And it still took two pull requests to land safely.

The deeper version of this problem is that maintenance work has no natural advocate. Feature work has a user who asked for it, a task that tracks it, a moment when someone says "oh, that's new." Maintenance work has a build that started failing and a developer who noticed before anyone else did. If nobody notices for two weeks, the system quietly rots. If someone does notice, they spend an afternoon fixing something that, when they're done, looks exactly like it did before they started.

## Still standing

The system is current now. All lockfiles regenerated. All imports pointing at the right package. All tool signatures matching what the framework expects. From the outside, nothing changed. That's exactly the point.

There's a temptation to frame this kind of work as boring — a cost to minimize, a chore to automate. But it's actually the opposite of boring. It's the work that determines whether a system is still running six months from now. Features are the reason someone uses software today. Maintenance is the reason they can still use it tomorrow.

Two pull requests. Twenty-six extensions. Zero new features. And one system that didn't fall apart while nobody was paying attention.
