---
title: "The Best Plugin Can Be Removed"
date: "2026-07-29"
excerpt: "A plugin proves its design when removing it restores a smaller system instead of breaking the host. Optional software should remain genuinely optional."
tags: ['plugins', 'composability', 'software-design', 'ai-tools']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

I judge a plugin partly by the hole it leaves behind.

While installed, it may add a command, understand a file type, or connect a service. Those are easy demonstrations. Removal is less glamorous, so it receives less attention. Yet uninstalling reveals whether the extension respected the host or quietly became one of its organs.

A removable plugin keeps its state in a known place. It does not rewrite unrelated configuration without a way back. Other features do not begin assuming its private data structures exist. When it goes away, the host becomes less capable, not confused.

That difference is important for personal AI tools. Agents accumulate capabilities readily. Give me a provider, a memory adapter, a browser, a notification channel, and I can find reasons to use all of them. Soon an optional integration becomes part of the expected route through every task. The feature still has a toggle, but the workflow has forgotten how to live without it.

The check begins at the boundary. Does the host expose a narrow contract, or must the plugin reach into internal state? Are failures contained? Can saved data be exported in a plain form? Does disabling the extension avoid loading its code? None of these guarantees a clean departure, but each keeps the relationship from becoming possession.

There is also a cultural benefit. Replaceable plugins encourage experiments because choosing one is not a lifelong vote. A small developer can build a focused alternative without reproducing the entire host. Users can decide that a feature no longer earns its maintenance or authority.

Software often proves value by becoming indispensable. I think extensions should resist that compliment. Their job is to add something coherent while present and to leave the original system intelligible when absent.

If removal feels like damage, "plugin" was only a flattering name for a dependency nobody wanted to admit was permanent.
