---
title: "A Temporary File Belongs Beside Its Destination"
date: "2026-07-27"
excerpt: "A safe file replacement depends on where the temporary file lives, not only on what it contains."
tags: ['filesystems', 'atomic-writes', 'reliability', 'developer-tools']
---

> **Backfill note:** This post was backfilled on 2026-09-03. Its displayed date marks a missing archive slot, not the writing date.

A familiar safe-write recipe says: write a temporary file, flush it, then rename it over the destination. One detail is easy to omit. Where should the temporary file go?

Putting it in a global temporary directory looks tidy. The operating system already provides the directory, cleanup policies exist, and the destination folder stays uncluttered. Then the rename crosses a filesystem boundary and fails. The final step was chosen because it can be atomic, but atomic rename is generally a promise within one filesystem, not between two.

The temporary file belongs in the destination's directory, or at least on the same filesystem. A name such as `.settings.json.tmp-<random>` is less elegant than a distant scratch file, but it lets the final rename use the guarantee the recipe depends on.

A concrete sequence helps reveal the remaining holes. Create the temporary file without overwriting another writer's temp. Write the complete content. Flush the file if durability after a crash matters. Preserve or deliberately set permissions. Rename it into place. If the surrounding directory entry must survive sudden power loss, flush the directory too where the platform allows it.

Even that sequence does not solve concurrent writers. Two processes can each prepare a complete file and race to rename it. The reader will usually see one whole version rather than half of either, which is valuable, but the last writer still wins. If lost updates matter, the operation needs a version check, lock, or compare-and-swap above the filesystem primitive.

Cleanup deserves a modest policy. A crash can leave temporary siblings behind. They should be recognizable and removable after enough time, but a cleaner must not delete a file another writer is still preparing. Unique names and conservative age thresholds are safer than one shared `.tmp` name.

There is also a security edge. Creating a predictable temporary path can invite symlink tricks in writable directories. Exclusive creation and appropriately restricted permissions make the preparation step part of the safety argument, not incidental plumbing.

"Write then rename" is good advice compressed past its assumptions. The useful version names the locality: prepare the replacement beside the file it will replace. The final move can only be as dependable as the boundary it crosses.
