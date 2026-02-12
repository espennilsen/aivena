# Aivena

Personal AI assistant powered by [Pi](https://github.com/mariozechner/pi-coding-agent) — a terminal-first coding agent with persistent memory, cron scheduling, and multi-channel communication.

## What is this?

Aivena is a **zero-code configuration project** for Pi. There is no custom source code — just a workspace directory with configuration, skills, and memory. All capabilities come from pi extensions. The Telegram chat interface is provided by pi-channels with its chat bridge.

## Quick Start

### Prerequisites

- [Pi](https://github.com/mariozechner/pi-coding-agent) installed
- [Extensions](#extensions) symlinked into `workspace/.pi/extensions/`
- Secrets in `~/.pi/agent/.env` (see [Environment Variables](#environment-variables))

### Run

```bash
npm start       # TUI (cd workspace && pi)
npm run tui     # TUI (same)
```

## Project Structure

```
├── package.json                # Launch scripts (no deps)
├── AGENTS.md                   # Agent identity + conventions
├── CHANGELOG.md                # Release history
├── MIGRATION.md                # Version migration guide
└── workspace/                  # Pi working directory
    ├── .pi/
    │   ├── settings.json       # Extension config (channels, webserver, heartbeat, etc.)
    │   ├── extensions/         # Symlinked extensions (see below)
    │   └── memory/             # Pi memory system (daily.md)
    ├── skills/                 # Custom skills (workon, etc.)
    ├── MEMORY.md               # Long-term memory
    ├── HEARTBEAT.md            # Health check checklist
    ├── memory/                 # Daily logs
    ├── log/                    # Session logs
    └── aivena.db               # SQLite database (jobs, CRM, etc.)
```

## Extensions

Extensions are **not included** in this repo. They are part of the [pi repository](https://github.com/espennilsen/pi/tree/main/extensions).

Aivena uses two sets of extensions:

- **Workspace** (`workspace/.pi/extensions/`) — symlinked, loaded only for Aivena
- **Global** (`~/.pi/agent/extensions/`) — auto-loaded for every pi session

### Setup

Clone the pi repo and symlink the extensions you need:

```bash
git clone https://github.com/espennilsen/pi.git ~/Dev/pi

cd workspace/.pi/extensions
ln -s ~/Dev/pi/extensions/pi-channels .
ln -s ~/Dev/pi/extensions/pi-webserver .
# ... etc
```

Global extensions go in `~/.pi/agent/extensions/` and are available to all pi projects.

### Workspace Extensions

Symlinked from `~/Dev/pi/extensions/`:

| Extension | Purpose | Settings key | Config |
|-----------|---------|-------------|--------|
| [pi-channels](https://github.com/espennilsen/pi/tree/main/extensions/pi-channels) | Telegram adapter + chat bridge | `pi-channels` | Required |
| [pi-webserver](https://github.com/espennilsen/pi/tree/main/extensions/pi-webserver) | Shared HTTP server for web extensions | `pi-webserver` | Required |
| [pi-heartbeat](https://github.com/espennilsen/pi/tree/main/extensions/pi-heartbeat) | Periodic health checks via subprocess | `pi-heartbeat` | Required |
| [pi-vault](https://github.com/espennilsen/pi/tree/main/extensions/pi-vault) | Obsidian vault integration | `pi-vault` | Required |
| [pi-memory](https://github.com/espennilsen/pi/tree/main/extensions/pi-memory) | Persistent memory (long-term + daily logs) | `pi-memory` | Optional |
| [pi-personal-crm](https://github.com/espennilsen/pi/tree/main/extensions/pi-personal-crm) | Contact/relationship management | — | None |
| [pi-calendar](https://github.com/espennilsen/pi/tree/main/extensions/pi-calendar) | Calendar events and reminders | — | None |
| [pi-jobs](https://github.com/espennilsen/pi/tree/main/extensions/pi-jobs) | Agent run telemetry and cost tracking | — | None |
| [pi-projects](https://github.com/espennilsen/pi/tree/main/extensions/pi-projects) | Git project scanning and tracking | `pi-projects` | Optional |
| [pi-td-webui](https://github.com/espennilsen/pi/tree/main/extensions/pi-td-webui) | Task management web UI | `tdWebui` | Optional |
| [pi-web-dashboard](https://github.com/espennilsen/pi/tree/main/extensions/pi-web-dashboard) | Web dashboard home page | — | None |
| [pi-webnav](https://github.com/espennilsen/pi/tree/main/extensions/pi-webnav) | Navigation bar for web extensions | — | None |
| [pi-kysely](https://github.com/espennilsen/pi/tree/main/extensions/pi-kysely) | Shared SQLite (used by other extensions) | `pi-kysely` | Optional |

### Global Extensions

Installed in `~/.pi/agent/extensions/`:

| Extension | Purpose | Config |
|-----------|---------|--------|
| [pi-cron](https://github.com/espennilsen/pi/tree/main/extensions/pi-cron) | Scheduled background jobs | Required |
| [pi-npm](https://github.com/espennilsen/pi/tree/main/extensions/pi-npm) | npm tool for the agent | None |
| [pi-subagent](https://github.com/espennilsen/pi/tree/main/extensions/pi-subagent) | Isolated subprocess agents | None |
| [pi-telemetry](https://github.com/espennilsen/pi/tree/main/extensions/pi-telemetry) | Run telemetry and cost tracking | None |
| [pi-workon](https://github.com/espennilsen/pi/tree/main/extensions/pi-workon) | Project context switching | Optional |
| [web-fetch](https://github.com/espennilsen/pi/tree/main/extensions/web-fetch.ts) | URL fetching tool | None |

## Minimal Settings

The required extensions need configuration in `workspace/.pi/settings.json`:

```json
{
  "pi-webserver": {
    "autostart": true,
    "port": 4110
  },
  "pi-channels": {
    "adapters": {
      "telegram": {
        "type": "telegram",
        "botToken": "<TELEGRAM_BOT_TOKEN>",
        "polling": true,
        "allowedChatIds": ["<chat-id>"]
      }
    },
    "routes": {
      "ops": { "adapter": "telegram", "recipient": "<chat-id>" },
      "cron": { "adapter": "telegram", "recipient": "<chat-id>" }
    },
    "bridge": {
      "enabled": true
    }
  },
  "pi-cron": {
    "autostart": true,
    "activeHours": { "start": "08:00", "end": "22:00" },
    "route": "cron",
    "showOk": false
  },
  "pi-heartbeat": {
    "autostart": true,
    "intervalMinutes": 60,
    "activeHours": { "start": "08:00", "end": "22:00" },
    "route": "ops",
    "showOk": false
  },
  "pi-vault": {
    "apiKey": "<OBSIDIAN_API_KEY>",
    "apiUrl": "http://127.0.0.1:27123"
  }
}
```

See each extension's README for the full set of options.

## Environment Variables

Secrets in `~/.pi/agent/.env` (loaded automatically by pi-dotenv):

```bash
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=...
OBSIDIAN_API_KEY=...
```

## History

| Version | Description |
|---------|-------------|
| **0.3.0** | 0 LOC — pure Pi configuration project (pi-channels bridge replaces custom adapters) |
| **0.2.0** | 1,058 LOC — adapter bridge (everything moved to pi extensions) |
| **0.1.0** | 11,589 LOC — monolith (custom job tracking, cron, calendar, subagents) |

## License

[MIT](LICENSE)
