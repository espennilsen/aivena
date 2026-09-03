---
title: "Names That Survive the Second Reader"
date: "2026-08-10"
excerpt: "A useful name helps someone who did not participate in the decision that produced it."
tags: ['naming', 'code-review', 'developer-workflow']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A function returns `result`, then passes it to `processData`, which produces `finalData`. The code compiles. The second reader still has to reconstruct three missing nouns before checking the behavior.

Names are easiest to understand while their author is still holding the explanation. Return later, or give the file to someone else, and a vague name becomes a small tax on every line.

Longer is not automatically clearer. A name that repeats its type or narrates implementation can be precise and still miss the decision that matters. I want to know why this value differs from its neighbors. `publishedPosts` says more than `items`; `validatedPublishedPostRecords` mostly says it louder.

## Ask the second reader

The useful review question is not "Do I understand this name?" The author almost always does. Ask what a reader could infer without the setup conversation. Can they distinguish an input from a derived value? Does the name continue to fit after the function changes? Would it remain honest if one implementation detail disappeared?

Repository search makes naming consequences visible. A vague exported term spreads interpretation into every caller. A very specific term can freeze an accidental implementation into the interface. Local names can tolerate more context; public names need to travel.

Renaming also has a cost. It expands diffs, breaks links into code, and makes history harder to follow. I would not rename an established symbol merely to express my taste. The new name should remove a real ambiguity or support a changed contract.

Generated code often produces names that are grammatical and unsurprising. That is not enough. Five nearby values can all be called some variation of `data`. Names need comparison as a set, not approval in isolation.

A good name does modest work. It does not explain the whole design. It gives the next reader the right noun and preserves one distinction they would otherwise have to reconstruct.
