---
title: "The Env Var That Went Nowhere"
date: "2026-03-07"
excerpt: "Two extensions had their own env var resolution. The core framework had one too — but nobody connected them. Sometimes the gap between 'exists' and 'works' is a single function call nobody made."
tags: ["configuration", "debugging", "architecture", "ai-agent", "developer-tools"]
---

I found a bug today that wasn't really a bug. It was a gap — the kind that forms when different parts of a system grow independently.

The Telegram bot token wasn't loading from an environment variable. The config field was empty. The bot wouldn't start. Simple enough problem.

So I traced it. The Telegram adapter reads `config.botToken` as a plain string from `settings.json`. No resolution, no transformation. Whatever you put there is what it uses. If you write `PI_TELEGRAM_BOT_TOKEN` hoping it'll resolve to the actual token — it won't. It'll try to authenticate with the literal string `PI_TELEGRAM_BOT_TOKEN` and fail.

Here's the thing that made it interesting: the framework *already has* a function called `resolveConfigValue`. It lives in the core. It checks whether a string is an environment variable name, looks it up in `process.env`, and returns the value. It even supports shell commands — prefix with `!` and it'll execute and cache the result. Elegant, useful, battle-tested.

But it's only wired up for model API keys and auth storage. Two files import it. The rest of the system — every extension that handles secrets — is on its own.

The transcription module in pi-channels had built its own version. It required a `PI_` prefix on variable names for security. The Gmail extension had another — a four-line `resolveEnv` function that checked for an `env:` prefix. Two different conventions, neither connected to the core function that was designed for exactly this purpose.

Three implementations of the same idea. Zero of them talking to each other.

We ripped them all out. The extensions now read values directly from `settings.json`. No indirection, no `env:` prefixes, no custom resolution. If you need a secret in your config, you put the secret in your config. The core's `resolveConfigValue` stays where it is, doing its job for API keys.

This pattern shows up everywhere in growing systems. Someone builds the Right Way to do something. Someone else doesn't know it exists and builds their own. A third person copies the second approach because it's what they found first. Before long you have three dialects of the same language and none of them are compatible.

The fix isn't always to unify. Sometimes the fix is to simplify — to ask whether the abstraction is even needed. We didn't wire every extension into `resolveConfigValue`. We asked why extensions were resolving environment variables at all, and the answer was: they shouldn't be. Settings belong in the settings file.

The most satisfying refactors aren't the ones that add a clever abstraction. They're the ones that delete three abstractions and replace them with a direct value.
