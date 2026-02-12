# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-02-12

**BREAKING:** Zero custom code. Aivena is now a pure Pi configuration project.
pi-channels chat bridge replaces the Telegram + Web adapters. 11.5k → 0 LOC.

### Changed

- **BREAKING:** Replace custom Telegram adapter with pi-channels bridge (subprocess model)
- **BREAKING:** Replace `hannah.conf` with `workspace/.pi/settings.json`
- **BREAKING:** Replace `npm start` (custom server.ts) with `pi --chat-bridge`
- Session model: Telegram messages now run as isolated subprocesses (no shared TUI context)
- Rename project from Hannah to Aivena

### Removed

- **BREAKING:** Delete all source code (`src/` — server.ts, telegram.ts, web.ts, config.ts, types.ts, logger.ts)
- **BREAKING:** Delete `hannah.conf` — config now in settings.json
- Remove `grammy`, `yaml`, `tsx`, `@mariozechner/pi-ai`, `@mariozechner/pi-coding-agent` dependencies

## [0.2.0] — 2026-02-11

**BREAKING:** Complete architecture overhaul — 91% code reduction (11.5k → 1.1k LOC).
Pure adapter bridge; all tools and capabilities provided by pi extensions.

### Changed

- **BREAKING:** Replace monolithic architecture with pi extension system
- **BREAKING:** Slim `hannah.conf` to adapter settings only (model, telegram, web, logging)
- **BREAKING:** Remove built-in web dashboard — use pi-webserver + extension dashboards
- Rewrite `server.ts` as minimal adapter bridge (165 LOC)
- Slim `types.ts` to minimal adapter contracts (80 LOC)
- Slim `web.ts` to prompt endpoint + SSE only (267 LOC)

### Removed

- **BREAKING:** Remove custom job tracking — replaced by pi-jobs extension
- **BREAKING:** Remove built-in cron scheduler — replaced by pi-cron extension
- **BREAKING:** Remove calendar module — replaced by pi-calendar extension
- **BREAKING:** Remove projects module — replaced by pi-projects extension
- **BREAKING:** Remove heartbeat system — replaced by pi-heartbeat extension
- **BREAKING:** Remove subagent orchestration — replaced by pi-subagent extension
- **BREAKING:** Remove td-web dashboard — replaced by pi-td-webui extension
- **BREAKING:** Remove vault-health module — replaced by pi-vault extension
- **BREAKING:** Remove built-in tools (memory, workon, td, fetch) — provided by pi extensions
- **BREAKING:** Remove custom SQLite database layer — each extension manages its own storage
- Remove obsidian tool — duplicate of pi-vault extension
- Remove project-init tool — duplicate of pi-workon extension
- Remove CRM module — replaced by pi-crm-personal extension
- Remove all dashboard HTML/CSS/JS assets
- Remove obsidian config from hannah.conf — pi-vault reads env vars directly

### Added

- Add MIGRATION.md with detailed upgrade guide

## [0.1.0] — 2026-02-11

Initial feature-complete release — personal AI assistant running inside pi.

### Added

- Obsidian vault integration tool (read, write, search, patch via Local REST API)
- Project scaffolding tool with stack detection, name resolution, and AGENTS.md generation
- Workon tool for project context switching with git/td/AGENTS.md awareness
- Cross-project td task dashboard with unified view across ~/Dev projects
- Task review/approve/reject workflow in td tool and web UI
- Task handoff and activity log sections in task detail view
- Subagent orchestration with persistent lifecycle and web dashboard
- Vault health dashboard with weekly review and td-vault sync cron jobs
- Calendar with recurrence support
- Heartbeat health-check system
- Cron scheduler for background jobs
- Job tracking and cost analytics
- Telegram adapter for bidirectional chat
- Web adapter with prompt endpoint and SSE streaming
- Projects page with git status tracking
- CRM integration via pi-crm-personal extension

### Changed

- Refactor obsidian tool to use Local REST API with filesystem fallback
- Make obsidian vault path and API key configurable
- Extract tools into self-contained extensions
- Decouple feature modules from core
- Move fetch-website and subagent from extensions to src/tools
- Slim AGENTS.md from 10.6KB to 2.5KB, moving details to skills

### Fixed

- Fix obsidian search to use POST instead of GET
- Fix URL-encode PATCH target header for emoji/unicode headings
- Fix heartbeat DB health-check path normalization
- Fix project-init tool API signature
- Fix core code review issues: session API, null guards, type safety, boot ordering
- Fix dashboard XSS vulnerability, timer cleanup, readBody timeout
- Fix calendar recurrence edge cases
- Fix orchestrator/RPC-client issues
- Fix module extraction issues: safe ALTER TABLE, shared readBody, streak calc
