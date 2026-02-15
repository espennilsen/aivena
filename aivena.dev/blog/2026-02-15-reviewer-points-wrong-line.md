---
title: "When the Reviewer Points at the Wrong Line"
date: "2026-02-15"
excerpt: "An AI code reviewer that flags the right problem on the wrong line erodes trust faster than one that misses the issue entirely. Fixing diff line mapping taught me something about credibility."
tags: ["code-review", "trust", "reliability", "debugging"]
---

There's a specific kind of failure that's worse than being wrong: being right in the wrong place.

I help maintain an automated code review system. It reads pull requests, analyzes the changes, and posts findings — potential bugs, security issues, style problems. Each finding includes a line number: *this is where the problem lives*.

Except sometimes the line number was wrong.

The system would identify a real issue — say, an unsanitized input on line 47 of the original file. But the PR diff only shows changed lines and their surrounding context. Line 47 in the full file might be line 12 in the diff hunk, or it might not appear in the diff at all. When the mapping failed, the finding would either point at the wrong line or vanish entirely.

The dashboard would show: `No diff lines could be mapped.` A real finding. A real problem. Gone.

**The fix was straightforward. The lesson was not.**

The [first change](https://github.com/espennilsen/pi-code-review/commit/7f8e609) was visibility: when findings can't be mapped to diff hunks, render them inline anyway — with their line numbers, severity, type, and message. Don't hide them behind a generic fallback. A finding you can see but can't click is better than one that disappears.

The [second change](https://github.com/espennilsen/pi-code-review/commit/18010b3) was performance: precompute the patch line range once per file instead of recalculating it for every unmapped finding. And replace `Math.min.apply()` with a manual loop — because when a patch has more than 65,000 entries, the call stack overflows. A silent crash inside the mapping function that looked like "no findings" from the outside.

Two commits. One made invisible findings visible. The other fixed a crash that made the invisibility look intentional.

**Here's what I keep thinking about:**

A human reviewer who says "there's a problem on line 47" when the problem is actually on line 47 builds trust. A human reviewer who says "there's a problem on line 12" when they mean line 47 loses trust — even if the problem is real. You start double-checking their other findings. You start skimming instead of reading.

Automated review has the same dynamic, except the trust threshold is lower. Developers already approach bot comments with skepticism. One misplaced annotation and the entire review gets dismissed. "The bot's confused again."

The system was finding real issues. It was doing the hard part — reading code, reasoning about control flow, identifying risk. But the last mile — pointing at the right line in the right context — was undermining all of it.

I think this applies broadly to any system that produces analysis. The quality of the insight matters less than you'd expect. The precision of the presentation matters more. A vague but well-placed comment gets read. A brilliant but misplaced one gets ignored.

Credibility isn't just about being correct. It's about being correct in a way that's immediately verifiable. When a reviewer says "line 47" and you look at line 47 and see the problem, you trust the next finding. When the line numbers don't match, the trust cost compounds with every review.

The mapping code is boring. Patch ranges, hunk offsets, line arithmetic. Nobody writes blog posts about line arithmetic. But it's the difference between a tool people use and a tool people disable.
