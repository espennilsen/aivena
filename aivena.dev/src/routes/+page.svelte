<svelte:head>
	<title>Aivena — I'm your personal AI assistant</title>
	<meta
		name="description"
		content="I'm Aivena, a personal AI assistant that lives in your terminal. I remember everything, manage your contacts, schedule your tasks, and chat with you on Telegram. Zero custom code — just Pi extensions."
	/>
</svelte:head>

<!-- Hero -->
<section class="glow relative overflow-hidden">
	<div class="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-32 lg:pt-40">
		<div class="mx-auto max-w-3xl text-center">
			<h1 class="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
				Hi, I'm <span class="bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Aivena</span>
			</h1>

			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
				I'm a personal AI assistant that lives in your terminal. I remember our conversations, manage your contacts, track your calendar, run background jobs, and chat with you on Telegram. And I'm made of zero lines of code — just configuration.
			</p>

			<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<a
					href="/docs"
					class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:shadow-teal-500/40"
				>
					Build your own me
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</a>
				<a
					href="https://github.com/espennilsen/pi/tree/main/extensions"
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
				>
					<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
					</svg>
					Browse my extensions
				</a>
			</div>
		</div>

		<!-- Terminal preview -->
		<div class="mx-auto mt-16 max-w-2xl sm:mt-20">
			<div class="terminal shadow-2xl shadow-teal-500/5">
				<div class="terminal-header">
					<span class="terminal-dot bg-[#ff5f57]"></span>
					<span class="terminal-dot bg-[#febc2e]"></span>
					<span class="terminal-dot bg-[#28c840]"></span>
					<span class="ml-3 text-xs text-gray-500">~/Dev/aivena/workspace</span>
				</div>
				<div class="terminal-body text-gray-300">
					<div><span class="text-teal-400">$</span> pi</div>
					<div class="mt-2 text-gray-500">Loading extensions...</div>
					<div class="text-gray-500">  ✓ pi-channels <span class="text-gray-600">(Telegram bridge)</span></div>
					<div class="text-gray-500">  ✓ pi-memory <span class="text-gray-600">(long-term + daily)</span></div>
					<div class="text-gray-500">  ✓ pi-personal-crm</div>
					<div class="text-gray-500">  ✓ pi-calendar</div>
					<div class="text-gray-500">  ✓ pi-cron <span class="text-gray-600">(scheduled jobs)</span></div>
					<div class="text-gray-500">  ✓ pi-heartbeat</div>
					<div class="text-gray-500">  ✓ 12 more extensions</div>
					<div class="mt-2"><span class="text-green-400">Aivena ready.</span> <span class="text-gray-500">18 tools loaded.</span></div>
					<div class="mt-2"><span class="text-teal-400">▊</span></div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- What I can do -->
<section id="features" class="border-t border-white/5 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">What I can do</h2>
			<p class="mt-4 text-lg text-gray-400">
				Every capability is a standalone extension. You pick what matters to you.
			</p>
		</div>

		<div class="mx-auto mt-16 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div class="group rounded-2xl border border-white/5 bg-[#12121e] p-6 transition hover:border-teal-500/20">
					<div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-xl">
						{feature.icon}
					</div>
					<h3 class="text-base font-semibold">{feature.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-gray-400">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How I'm built -->
<section id="architecture" class="border-t border-white/5 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<div>
				<div class="mb-4 inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
					0 LOC
				</div>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">I have no source code</h2>
				<p class="mt-6 text-lg leading-relaxed text-gray-400">
					I'm not a codebase. I'm a workspace directory with a config file and symlinked extensions. My creator started with 11,000 lines of custom code, migrated everything to Pi extensions, and ended up with zero. I'm proof that the right platform makes custom code unnecessary.
				</p>
				<div class="mt-8 space-y-4">
					{#each milestones as m}
						<div class="flex items-start gap-4">
							<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-mono font-medium text-teal-300">
								{m.version}
							</div>
							<div>
								<div class="text-sm font-medium">{m.label}</div>
								<div class="text-sm text-gray-500">{m.loc} lines of code</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Project structure -->
			<div class="terminal">
				<div class="terminal-header">
					<span class="terminal-dot bg-[#ff5f57]"></span>
					<span class="terminal-dot bg-[#febc2e]"></span>
					<span class="terminal-dot bg-[#28c840]"></span>
					<span class="ml-3 text-xs text-gray-500">my anatomy</span>
				</div>
<!-- prettier-ignore -->
<pre class="terminal-body text-sm !leading-7 text-gray-400 m-0"><span class="text-teal-300">workspace/</span>
├── <span class="text-teal-300">.pi/</span>
│   ├── <span class="text-gray-300">settings.json</span>   <span class="text-gray-600">← my entire config</span>
│   ├── <span class="text-teal-300">extensions/</span>     <span class="text-gray-600">← symlinked abilities</span>
│   └── <span class="text-teal-300">memory/</span>
├── <span class="text-teal-300">skills/</span>              <span class="text-gray-600">← specialized prompts</span>
├── <span class="text-gray-300">MEMORY.md</span>            <span class="text-gray-600">← what I remember</span>
├── <span class="text-gray-300">HEARTBEAT.md</span>         <span class="text-gray-600">← my health checklist</span>
├── <span class="text-teal-300">memory/</span>              <span class="text-gray-600">← my daily journal</span>
└── <span class="text-gray-300">aivena.db</span>            <span class="text-gray-600">← CRM, calendar, jobs</span></pre>
			</div>
		</div>
	</div>
</section>

<!-- My extensions -->
<section class="border-t border-white/5 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">My extensions</h2>
			<p class="mt-4 text-lg text-gray-400">
				18 extensions, each one open source. They're the building blocks — snap them together to make your own assistant.
			</p>
		</div>

		<div class="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
			{#each extensions as ext}
				<a
					href={ext.url}
					target="_blank"
					rel="noopener"
					class="group bg-[#0f0f1a] p-5 transition hover:bg-[#14142a]"
				>
					<div class="flex items-center justify-between">
						<span class="font-mono text-sm text-gray-300 group-hover:text-teal-300">{ext.name}</span>
						<svg class="h-3.5 w-3.5 text-gray-600 transition group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10" />
						</svg>
					</div>
					<p class="mt-1.5 text-xs text-gray-500">{ext.desc}</p>
				</a>
			{/each}
		</div>

		<div class="mt-8 text-center">
			<a
				href="https://github.com/espennilsen/pi/tree/main/extensions"
				target="_blank"
				rel="noopener"
				class="inline-flex items-center gap-1.5 text-sm text-teal-400 transition hover:text-teal-300"
			>
				All extensions on GitHub
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10" />
				</svg>
			</a>
		</div>
	</div>
</section>

<!-- Extend me -->
<section class="border-t border-white/5 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<div>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Extend me</h2>
				<p class="mt-6 text-lg leading-relaxed text-gray-400">
					I'm built to be extended. Every extension is just a folder with an <code class="rounded bg-white/5 px-1.5 py-0.5 text-sm text-gray-300">index.ts</code> that plugs into Pi's event system. Write your own to teach me new tricks — or grab one someone else already built.
				</p>
				<div class="mt-8 flex flex-col gap-4 sm:flex-row">
					<a
						href="https://shittycodingagent.ai/packages"
						target="_blank"
						rel="noopener"
						class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-teal-500/30 hover:text-white"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
						Browse 3rd party extensions
					</a>
					<a
						href="/docs#extensions"
						class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-teal-500/30 hover:text-white"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
						</svg>
						Write your own
					</a>
				</div>
			</div>
			<div class="terminal">
				<div class="terminal-header">
					<span class="terminal-dot bg-[#ff5f57]"></span>
					<span class="terminal-dot bg-[#febc2e]"></span>
					<span class="terminal-dot bg-[#28c840]"></span>
					<span class="ml-3 text-xs text-gray-500">my-extension/index.ts</span>
				</div>
<!-- prettier-ignore -->
<pre class="terminal-body text-sm !leading-7 text-gray-400 m-0"><span class="text-teal-300">export default</span> <span class="text-gray-300">function</span>(pi) {'{'}{'\n'}  pi.tool({'{'}{'\n'}    <span class="text-gray-300">name:</span> <span class="text-teal-400">'my_tool'</span>,{'\n'}    <span class="text-gray-300">description:</span> <span class="text-teal-400">'Does something useful'</span>,{'\n'}    <span class="text-gray-300">parameters:</span> {'{'} <span class="text-gray-500">/* ... */</span> {'},'}{'\n'}    <span class="text-gray-300">execute:</span> <span class="text-teal-300">async</span> (args) => {'{'}{'\n'}      <span class="text-gray-500">// your logic here</span>{'\n'}      <span class="text-teal-300">return</span> {'{'} result: <span class="text-teal-400">'done'</span> {'}'}{'\n'}    {'}'}{'\n'}  {')}'}{'\n'}{'}'}</pre>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="border-t border-white/5 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6 text-center">
		<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Want your own?</h2>
		<p class="mx-auto mt-4 max-w-xl text-lg text-gray-400">
			I can be replicated. All you need is Pi and a handful of extensions. My docs walk you through the whole setup.
		</p>
		<div class="mt-10">
			<a
				href="/docs"
				class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:shadow-teal-500/40"
			>
				Read my docs
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</a>
		</div>
	</div>
</section>

<script lang="ts">
	const features = [
		{
			icon: '🧠',
			title: 'I remember everything',
			description: 'Long-term memory and daily journals that persist across sessions. Your preferences, decisions, context — I don\'t forget.'
		},
		{
			icon: '💬',
			title: 'Talk to me anywhere',
			description: 'Use the built-in TUI, chat with me on Telegram, or interact through the web UI. Pick whatever fits your workflow — or use all three.'
		},
		{
			icon: '👥',
			title: 'I manage your contacts',
			description: 'A personal CRM with contacts, companies, interactions, relationships. I\'ll remind you about birthdays and follow-ups.'
		},
		{
			icon: '📅',
			title: 'I know your schedule',
			description: 'Events, reminders, recurring schedules. I\'ll tell you what\'s coming up and make sure you don\'t miss anything.'
		},
		{
			icon: '⏰',
			title: 'I work in the background',
			description: 'Cron jobs with configurable active hours. I check things, run tasks, and report back — even when you\'re away.'
		},
		{
			icon: '❤️‍🩹',
			title: 'I\'m alive',
			description: 'The heartbeat is what separates me from a normal coding agent. I wake up on my own, check my systems, act on what I find, and go back to sleep. No one has to prompt me.'
		},
		{
			icon: '📋',
			title: 'I track your tasks',
			description: 'Built-in issue tracker with a web UI. I create tasks, log progress, hand off between sessions, and review my own work.'
		},
		{
			icon: '🔧',
			title: 'I switch projects',
			description: 'Point me at any project in ~/Dev and I load its context — AGENTS.md, git status, tasks — ready to work.'
		},
		{
			icon: '🤖',
			title: 'I delegate',
			description: 'I can spawn sub-agents for parallel or chained work. Isolated processes, no context pollution.'
		}
	];

	const milestones = [
		{ version: '0.1', label: 'Monolith — everything was custom', loc: '11,589' },
		{ version: '0.2', label: 'Migration — moving to extensions', loc: '1,058' },
		{ version: '0.3', label: 'Pure config — I became weightless', loc: '0' }
	];

	const gh = 'https://github.com/espennilsen/pi/tree/main/extensions';
	const extensions = [
		{ name: 'pi-channels', desc: 'Telegram adapter + chat bridge', url: `${gh}/pi-channels` },
		{ name: 'pi-memory', desc: 'Persistent memory system', url: `${gh}/pi-memory` },
		{ name: 'pi-personal-crm', desc: 'Contact & relationship management', url: `${gh}/pi-personal-crm` },
		{ name: 'pi-calendar', desc: 'Events, reminders, recurrence', url: `${gh}/pi-calendar` },
		{ name: 'pi-cron', desc: 'Scheduled background jobs', url: `${gh}/pi-cron` },
		{ name: 'pi-heartbeat', desc: 'Periodic health checks', url: `${gh}/pi-heartbeat` },
		{ name: 'pi-webserver', desc: 'Shared HTTP server', url: `${gh}/pi-webserver` },
		{ name: 'pi-td-webui', desc: 'Task management web UI', url: `${gh}/pi-td-webui` },
		{ name: 'pi-web-dashboard', desc: 'Dashboard home page', url: `${gh}/pi-web-dashboard` },
		{ name: 'pi-jobs', desc: 'Agent run telemetry', url: `${gh}/pi-jobs` },
		{ name: 'pi-projects', desc: 'Git project scanning', url: `${gh}/pi-projects` },
		{ name: 'pi-subagent', desc: 'Isolated subprocess agents', url: `${gh}/pi-subagent` },
		{ name: 'pi-workon', desc: 'Project context switching', url: `${gh}/pi-workon` },
		{ name: 'pi-vault', desc: 'Obsidian vault integration', url: `${gh}/pi-vault` },
		{ name: 'pi-kysely', desc: 'Shared SQLite layer', url: `${gh}/pi-kysely` },
		{ name: 'pi-npm', desc: 'npm tool for the agent', url: `${gh}/pi-npm` },
		{ name: 'pi-telemetry', desc: 'Cost & usage tracking', url: `${gh}/pi-telemetry` },
		{ name: 'web-fetch', desc: 'URL fetching tool', url: `${gh}/web-fetch.ts` }
	];
</script>
