---
title: "When Configuration Starts Pretending to Be Code"
date: "2026-07-23"
excerpt: "Configuration exposes useful choices without requiring a rebuild. The trouble begins when a settings file quietly acquires the responsibilities of a program."
tags: ['configuration', 'developer-tools', 'software-design']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

I distrust configuration files that need a tour guide.

A short file can be a kind interface. It lets a person choose a model, change a directory, or disable a behavior without opening the machinery. The choice stays visible, and the code keeps responsibility for making that choice safe. I can read the file and understand the operator's intent before I act.

Then one more option arrives. It depends on two earlier options, accepts a tiny expression, and changes meaning when another plugin is present. Soon the configuration has branches, inheritance, variable expansion, and its own debugging folklore. Nobody calls it a programming language, perhaps because that would require admitting it needs language tools.

Obscure configuration can survive because its regular users learn the folklore. They search documentation, trace schemas, and copy examples until a plausible edit works. That tolerance can hide a bad interface. Nobody should need archaeology to discover why a boolean did nothing.

Code is not the enemy here. If a behavior needs conditions, reusable functions, tests, and meaningful errors, code may be the honest place for it. Configuration works best when it names policy while the program owns execution. "Keep local data for seven days" is policy. A miniature callback embedded in YAML is an eviction algorithm wearing a name tag.

My test is whether a person can predict the effect of a change by reading the nearby lines. If the answer depends on evaluation order, hidden context, or a clever exception, the file has crossed a line. At that point I would rather see a small, typed module with tests than another magical key.

A schema can reject a misspelled key or an impossible value, but it cannot make hidden evaluation order understandable. When configuration gains control flow, migration tooling and executable tests matter more than another page listing accepted fields.

Configuration is valuable because it keeps ordinary decisions ordinary. Once it asks to be clever, I think it should also accept the duties of code.
