# Migration Guide

## v0.3.0 — Zero custom code (pi-channels bridge)

Aivena is now a pure configuration project. **All custom code has been deleted.**

The pi-channels extension (with chat bridge) fully replaces the custom Telegram and Web adapters.

**LOC reduction:** 11,589 → 0 (100% reduction from v0.1.0)

### What changed

| v0.2.0 (adapter bridge) | v0.3.0 (zero code) |
|---|---|
| `src/server.ts` — custom session bootstrap | `pi --chat-bridge` |
| `src/adapters/telegram.ts` — Grammy bot | pi-channels Telegram adapter + bridge |
| `src/adapters/web.ts` — SSE + prompt endpoint | pi-webserver |
| `src/config.ts` — hannah.conf parser | `workspace/.pi/settings.json` |
| `src/types.ts` — adapter contracts | (deleted) |
| `src/logger.ts` — file logging | pi built-in logging |
| `hannah.conf` (YAML) | `workspace/.pi/settings.json` (JSON) |
| `grammy` dependency | pi-channels native Telegram API |

### Session model change

- **Before:** Telegram messages shared the TUI session (same conversation context, possible contention)
- **After:** Each Telegram message runs as an isolated `pi -p --no-session` subprocess (no contention, full extension/memory access, no shared conversation state)

This is the same proven pattern used by pi-cron and pi-heartbeat.

### Setup

1. **Move secrets** — TELEGRAM_BOT_TOKEN must be in `~/.pi/agent/.env` (pi-dotenv loads from there):
   ```bash
   # Add to ~/.pi/agent/.env:
   TELEGRAM_BOT_TOKEN=your-bot-token
   ```

2. **Config** — `workspace/.pi/settings.json` has pi-channels config:
   ```json
   {
     "pi-channels": {
       "adapters": {
         "telegram": {
           "type": "telegram",
           "botToken": "env:TELEGRAM_BOT_TOKEN",
           "polling": true,
           "allowedChatIds": ["<chat-id>"]
         }
       },
       "bridge": { "enabled": true }
     }
   }
   ```

3. **Run:**
   ```bash
   npm start          # cd workspace && pi
   npm run tui        # cd workspace && pi (TUI only)
   ```

### Removed files

All of `src/` (6 files, 1,058 LOC), `hannah.conf`, `grammy` + `yaml` + `tsx` + `pi-ai` dependencies.

### Removed dependencies

- `grammy` — pi-channels uses native Telegram Bot API
- `yaml` — was only for hannah.conf parsing
- `tsx` — no TypeScript to execute
- `@mariozechner/pi-ai` — no custom tools to register
- `@mariozechner/pi-coding-agent` — no custom session bootstrap

---

## v0.2.0 — Extension refactor

v0.2.0 replaced the custom monolithic server with pi's extension system. All capabilities that were previously hand-built moved to pi extensions.

**LOC reduction:** 11,589 → 1,058 (91% reduction)

### What moved where

| v0.1.0 module | Replaced by |
|---|---|
| `src/extensions/jobs/` | **pi-jobs** |
| `src/extensions/cron/` | **pi-cron** |
| `src/extensions/heartbeat/` | **pi-heartbeat** |
| `src/extensions/calendar/` | **pi-calendar** |
| `src/extensions/projects/` | **pi-projects** |
| `src/extensions/subagent/` | **pi-subagent** |
| `src/extensions/td-web/` | **pi-td-webui** |
| `src/extensions/vault-health/` | **pi-vault** |
| `src/tools/memory.ts` | **pi-memory** |
| `src/tools/td.ts` | **pi-td-webui** |
| `src/tools/workon.ts` | **pi-workon** |
| `src/tools/fetch-website.ts` | **web-fetch.ts** |
| `src/tools/obsidian.ts` | **pi-vault** |
| `src/tools/project-init.ts` | **pi-workon** |
| `src/db.ts` | Per-extension SQLite |
