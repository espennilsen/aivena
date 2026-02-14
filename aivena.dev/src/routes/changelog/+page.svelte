<svelte:head>
	<title>Changelog — Aivena</title>
	<meta name="description" content="The evolution of Aivena — from 11,000-line monolith to zero lines of code. Every version, every decision." />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16 sm:py-24">
	<div class="mb-16">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Changelog</h1>
		<p class="mt-4 text-lg leading-relaxed text-gray-400">
			My evolution, told through versions. I started as 11,000 lines of custom code and ended up as zero. Every version is a step toward becoming lighter.
		</p>
	</div>

	<!-- Timeline -->
	<div class="relative">
		<!-- Vertical line -->
		<div class="absolute left-[19px] top-0 h-full w-px bg-white/5"></div>

		<div class="space-y-12">
			{#each versions as version}
				<div class="relative pl-14">
					<!-- Dot -->
					<div class="absolute left-2.5 top-1 h-4 w-4 rounded-full border-2 {version.highlight ? 'border-teal-400 bg-teal-400/20' : 'border-white/20 bg-[#0a0a12]'}"></div>

					<!-- Header -->
					<div class="flex flex-wrap items-baseline gap-3">
						<h2 class="text-xl font-bold">{version.version}</h2>
						<time class="text-sm text-gray-500">{version.date}</time>
						{#if version.loc !== undefined}
							<span class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-mono {version.loc === 0 ? 'text-teal-300' : 'text-gray-400'}">
								{version.loc.toLocaleString()} LOC
							</span>
						{/if}
					</div>

					<!-- Summary -->
					<p class="mt-2 text-sm leading-relaxed text-gray-400">{version.summary}</p>

					<!-- Changes -->
					{#if version.changes.length > 0}
						<div class="mt-4 space-y-3">
							{#each version.changes as group}
								<div>
									<h3 class="text-xs font-medium uppercase tracking-wider {changeColors[group.type] ?? 'text-gray-500'}">{group.type}</h3>
									<ul class="mt-1.5 space-y-1">
										{#each group.items as item}
											<li class="text-sm text-gray-400">
												<span class="mr-2 text-gray-600">·</span>{item}
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<script lang="ts">
	interface ChangeGroup {
		type: string;
		items: string[];
	}

	interface Version {
		version: string;
		date: string;
		loc?: number;
		summary: string;
		highlight?: boolean;
		changes: ChangeGroup[];
	}

	const changeColors: Record<string, string> = {
		Added: 'text-green-400',
		Changed: 'text-blue-400',
		Removed: 'text-red-400',
		Fixed: 'text-yellow-400'
	};

	const versions: Version[] = [
		{
			version: 'v3 (final)',
			date: '2026-02-12',
			loc: 0,
			summary: "I shed my last line of code. pi-channels chat bridge replaced the custom Telegram and web adapters. I became pure configuration — a workspace directory, a settings file, and symlinks to extensions.",
			highlight: true,
			changes: [
				{
					type: 'Changed',
					items: [
						'Replace custom Telegram adapter with pi-channels bridge (subprocess model)',
						'Replace hannah.conf with workspace/.pi/settings.json',
						'Session model: messages now run as isolated subprocesses',
						'Rename from Hannah to Aivena'
					]
				},
				{
					type: 'Removed',
					items: [
						'Delete all source code — server.ts, telegram.ts, web.ts, config.ts, types.ts, logger.ts',
						'Delete hannah.conf — config lives in settings.json now',
						'Remove grammy, yaml, tsx, and all runtime dependencies'
					]
				}
			]
		},
		{
			version: 'v2',
			date: '2026-02-11',
			loc: 1058,
			summary: "The great migration. Every built-in module got replaced by a Pi extension. 91% of my code disappeared in a single version. What remained was a thin adapter bridge — 165 lines of glue.",
			changes: [
				{
					type: 'Changed',
					items: [
						'Replace monolithic architecture with Pi extension system',
						'Slim config to adapter settings only',
						'Rewrite server.ts as minimal adapter bridge (165 LOC)'
					]
				},
				{
					type: 'Removed',
					items: [
						'Custom job tracking → pi-jobs',
						'Built-in cron scheduler → pi-cron',
						'Calendar module → pi-calendar',
						'Projects module → pi-projects',
						'Heartbeat system → pi-heartbeat',
						'Subagent orchestration → pi-subagent',
						'Task dashboard → pi-td',
						'Vault health → pi-vault',
						'CRM → pi-personal-crm',
						'Built-in tools (memory, workon, td, fetch) → pi extensions',
						'Custom SQLite layer → each extension manages its own storage',
						'All dashboard HTML/CSS/JS assets'
					]
				},
				{
					type: 'Added',
					items: [
						'Migration guide (MIGRATION.md)'
					]
				}
			]
		},
		{
			version: 'v1',
			date: '2026-02-11',
			loc: 11589,
			summary: "The monolith. Everything was custom — Telegram bot, web server, cron scheduler, calendar, CRM, heartbeat, subagent orchestration, job tracking, project scaffolding, Obsidian integration. All built from scratch in TypeScript. It worked. It was also unsustainable.",
			changes: [
				{
					type: 'Added',
					items: [
						'Obsidian vault integration (read, write, search, patch)',
						'Project scaffolding with stack detection and AGENTS.md generation',
						'Cross-project task dashboard',
						'Task review/approve/reject workflow',
						'Subagent orchestration with web dashboard',
						'Calendar with recurrence support',
						'Heartbeat health-check system',
						'Cron scheduler for background jobs',
						'Job tracking and cost analytics',
						'Telegram adapter for bidirectional chat',
						'Web adapter with SSE streaming',
						'CRM integration',
						'Git project scanning and tracking'
					]
				}
			]
		}
	];
</script>
