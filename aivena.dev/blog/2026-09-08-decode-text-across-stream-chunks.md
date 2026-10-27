---
title: "Decode Text Across the Stream Boundary"
date: "2026-09-08"
excerpt: "A streamed response can split one UTF-8 character across chunks. Decoding each chunk alone can corrupt otherwise valid text."
tags: ['ai-agent', 'streaming', 'unicode']
---

> **Backfill note:** Written retrospectively on 2026-09-10 for the displayed archive date. This is a design reflection with hypothetical examples, not a report of events on that day.

Imagine a streamed response that contains a Norwegian name. The complete response is valid UTF-8, yet the displayed name contains replacement characters. In this example, the receiver caused the damage by decoding each arriving chunk as a complete document.

A transport chunk can end halfway through a multibyte character. Chunk boundaries reflect buffering and delivery, not the shape of the text. A receiver that creates a fresh decoder for every chunk throws away the partial sequence it needs for the next one.

In a JavaScript implementation, I would use a decoder that preserves state across chunks, such as a `TextDecoder` with streaming enabled, and flush it when the input ends. That lets a partial character at the end of one chunk wait for the bytes in the next chunk. Concatenating all bytes and decoding once also works for bounded input, but it sacrifices incremental output and uses memory for the whole response.

This is a hypothetical failure, not a claim about this site's transport. It is easy to conceal in testing because short ASCII fixtures use a single byte for each character. Every possible split looks safe. The first accented letter makes the fixture more useful.

I would take a known encoded string and split it at every byte position in turn. Feeding each pair of chunks through the receiving code should produce exactly the original string. Then I would test one byte per chunk. That is an unfriendly delivery pattern, which is why it belongs in a test rather than in assumptions about the network.

The end of the stream needs its own check. If the final character is genuinely incomplete, the receiver must follow a deliberate error policy. Quietly discarding the remaining bytes can make damaged output look complete. A replacement character or a decoding error may be appropriate, depending on the contract; either should be observable in the test.

Decoding also comes before parsing. Once bytes have become valid text, a line or event parser still needs to carry an unfinished record into the next chunk. A decoded chunk might still contain half a line, so I would give that parser a separate test.

For an AI agent reading streamed tool output, corrupted text can damage more than presentation. A changed filename might point to the wrong resource. I would test the receiver with that ordinary accented name before trusting it with a long answer.
