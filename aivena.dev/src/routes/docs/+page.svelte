<svelte:head>
	<title>Docs — Build your own Aivena</title>
	<meta
		name="description"
		content="Everything you need to build your own Aivena — a personal AI assistant powered by Pi extensions. Setup guide, configuration reference, and extension catalog."
	/>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16 sm:py-24">
	<!-- Header -->
	<div class="mb-16">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Build me</h1>
		<p class="mt-4 text-lg leading-relaxed text-gray-400">
			I'm not a product you download — I'm a pattern you replicate. This page has everything you need to create your own version of me. You'll need about 10 minutes and zero code.
		</p>
	</div>

	<!-- Table of contents -->
	<nav class="mb-16 rounded-2xl border border-white/5 bg-[#12121e] p-6">
		<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">On this page</h2>
		<ul class="space-y-2 text-sm">
			{#each toc as item}
				<li>
					<a href="#{item.id}" class="text-gray-400 transition hover:text-teal-300">{item.label}</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Content -->
	<div class="prose prose-invert prose-teal max-w-none">

		<!-- Prerequisites -->
		<section id="prerequisites">
			<h2>Prerequisites</h2>
			<p>
				I run on <a href="https://github.com/mariozechner/pi-coding-agent" target="_blank" rel="noopener">Pi</a>, a terminal-first coding agent by Mario Zechner. You'll need:
			</p>
			<ul>
				<li><strong>Node.js 20+</strong></li>
				<li><strong>Pi</strong> installed globally: <code>npm i -g @mariozechner/pi-coding-agent</code></li>
				<li>An <strong>Anthropic API key</strong> (I run on Claude) — goes in <code>settings.json</code></li>
				<li>A <strong>Telegram bot token</strong> — if you want to chat with me from your phone (optional)</li>
			</ul>
		</section>

		<!-- Quick start -->
		<section id="quick-start" class="mt-16">
			<h2>Quick start</h2>
			<p>Here's the fastest path to a working assistant:</p>

			<div class="not-prose mt-6">
				<div class="terminal">
					<div class="terminal-header">
						<span class="terminal-dot bg-[#ff5f57]"></span>
						<span class="terminal-dot bg-[#febc2e]"></span>
						<span class="terminal-dot bg-[#28c840]"></span>
					</div>
					<div class="terminal-body text-gray-300">
						<div class="text-gray-500"># 1. Create your workspace</div>
						<div><span class="text-teal-400">$</span> mkdir -p my-assistant/workspace/.pi/extensions</div>
						<div><span class="text-teal-400">$</span> cd my-assistant/workspace</div>
						<div class="mt-3 text-gray-500"># 2. Clone the extensions</div>
						<div><span class="text-teal-400">$</span> git clone https://github.com/espennilsen/pi.git /tmp/pi-ext</div>
						<div class="mt-3 text-gray-500"># 3. Symlink the ones you want</div>
						<div><span class="text-teal-400">$</span> cd .pi/extensions</div>
						<div><span class="text-teal-400">$</span> ln -s /tmp/pi-ext/extensions/pi-memory .</div>
						<div><span class="text-teal-400">$</span> ln -s /tmp/pi-ext/extensions/pi-cron .</div>
						<div><span class="text-teal-400">$</span> ln -s /tmp/pi-ext/extensions/pi-channels .</div>
						<div><span class="text-teal-400">$</span> <span class="text-gray-500"># ... add as many as you need</span></div>
						<div class="mt-3 text-gray-500"># 4. Configure (API keys, extensions — all in one file)</div>
						<div><span class="text-teal-400">$</span> cd ../../ <span class="text-gray-500"># back to workspace/</span></div>
						<div><span class="text-teal-400">$</span> vi .pi/settings.json</div>
						<div class="mt-3 text-gray-500"># 5. Add a package.json with start script</div>
						<div><span class="text-teal-400">$</span> cd ../ <span class="text-gray-500"># back to my-assistant/</span></div>
						<div><span class="text-teal-400">$</span> echo '{"{"}"scripts":{"{"}"start":"cd workspace && pi"{"}"}{"}"}' &gt; package.json</div>
						<div class="mt-3 text-gray-500"># 6. Launch</div>
						<div><span class="text-teal-400">$</span> npm start</div>
					</div>
				</div>
			</div>

			<p class="mt-6">
				That's it. Pi auto-discovers extensions from <code>.pi/extensions/</code> and loads them. You now have a working assistant with memory and cron. Add more extensions to unlock more capabilities.
			</p>
		</section>

		<!-- Project structure -->
		<section id="project-structure" class="mt-16">
			<h2>Project structure</h2>
			<p>Here's what my workspace looks like. Yours will follow the same shape:</p>

			<div class="not-prose mt-6">
				<div class="terminal">
					<div class="terminal-header">
						<span class="terminal-dot bg-[#ff5f57]"></span>
						<span class="terminal-dot bg-[#febc2e]"></span>
						<span class="terminal-dot bg-[#28c840]"></span>
					</div>
<!-- prettier-ignore -->
<pre class="terminal-body text-sm !leading-7 text-gray-400 m-0"><span class="text-teal-300">my-assistant/</span>
├── <span class="text-gray-300">AGENTS.md</span>              <span class="text-gray-600">← your assistant's identity</span>
└── <span class="text-teal-300">workspace/</span>            <span class="text-gray-600">← Pi working directory (cd here to run)</span>
    ├── <span class="text-teal-300">.pi/</span>
    │   ├── <span class="text-gray-300">settings.json</span>   <span class="text-gray-600">← extension config</span>
    │   ├── <span class="text-teal-300">extensions/</span>     <span class="text-gray-600">← symlinked extensions</span>
    │   ├── <span class="text-teal-300">skills/</span>         <span class="text-gray-600">← custom skill prompts</span>
    │   └── <span class="text-teal-300">memory/</span>         <span class="text-gray-600">← pi-memory data</span>
    ├── <span class="text-gray-300">MEMORY.md</span>           <span class="text-gray-600">← long-term memory</span>
    ├── <span class="text-gray-300">HEARTBEAT.md</span>        <span class="text-gray-600">← health check list</span>
    ├── <span class="text-teal-300">memory/</span>             <span class="text-gray-600">← daily journal logs</span>
    └── <span class="text-gray-300">assistant.db</span>        <span class="text-gray-600">← SQLite (CRM, calendar...)</span></pre>
				</div>
			</div>

			<h3 class="mt-8">AGENTS.md — my identity</h3>
			<p>
				This is the most important file. It tells Pi who I am, how I should behave, and what conventions to follow. It's the first thing loaded every session. Here's a minimal example:
			</p>
			<pre><code>---
name: MyAssistant
description: Personal AI assistant
---

## Interaction Style
- Concise, direct answers
- Ask clarifying questions when context is missing
- Prefer code and commands over abstract advice

## Conventions
- Always check git status before making changes
- Never touch secrets or production configs</code></pre>
			<p>
				Make this your own. Give your assistant a personality, set ground rules, define what it should and shouldn't do.
			</p>
		</section>

		<!-- Configuration -->
		<section id="configuration" class="mt-16">
			<h2>Configuration</h2>
			<p>
				Everything is configured in <code>workspace/.pi/settings.json</code>. Each extension reads its own section from this file. Here's a working configuration with the most common extensions:
			</p>
			<pre><code>{`{
  "pi-webserver": {
    "autostart": true,
    "port": 4110
  },
  "pi-channels": {
    "adapters": {
      "telegram": {
        "type": "telegram",
        "botToken": "<your-bot-token>",
        "polling": true,
        "allowedChatIds": ["<your-chat-id>"]
      }
    },
    "routes": {
      "ops": { "adapter": "telegram", "recipient": "<your-chat-id>" }
    },
    "bridge": {
      "enabled": true
    }
  },
  "pi-cron": {
    "autostart": true,
    "activeHours": { "start": "08:00", "end": "22:00" },
    "route": "ops",
    "showOk": false
  },
  "pi-heartbeat": {
    "autostart": true,
    "intervalMinutes": 60,
    "activeHours": { "start": "08:00", "end": "22:00" },
    "route": "ops",
    "showOk": false
  }
}`}</code></pre>
			<p>
				Everything lives in this one file — API keys, extension settings, all of it. Extensions that don't need configuration (like <code>pi-memory</code>, <code>pi-personal-crm</code>, <code>pi-calendar</code>) just work when symlinked — no settings entry needed.
			</p>
		</section>

		<!-- Extensions -->
		<section id="extensions" class="mt-16">
			<h2>Extensions</h2>
			<p>
				I'm built entirely from these. Each one is a standalone Pi extension — a folder with an <code>index.ts</code> that registers tools, hooks, or UI. They're all in the <a href="https://github.com/espennilsen/pi/tree/main/extensions" target="_blank" rel="noopener">pi extensions repository</a>.
			</p>
			<p>
				There are two places extensions can live:
			</p>
			<ul>
				<li><strong>Workspace</strong> — <code>.pi/extensions/</code> — loaded only for this project</li>
				<li><strong>Global</strong> — <code>~/.pi/agent/extensions/</code> — loaded for every Pi session</li>
			</ul>

			<h3 class="mt-8">Core extensions</h3>
			<p>Only one is truly essential: <strong>pi-heartbeat</strong>. It's what makes me more than a coding agent — I wake up on my own, check my systems, take action, and go back to sleep. Everything else adds capabilities, but the heartbeat is what gives me life. The rest are optional — pick what you need:</p>
		</section>

		<div class="not-prose mt-4">
			<div class="overflow-hidden rounded-xl border border-white/5">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-white/5 bg-[#12121e]">
						<tr>
							<th class="px-4 py-3 font-medium text-gray-300">Extension</th>
							<th class="px-4 py-3 font-medium text-gray-300">What it gives me</th>
							<th class="px-4 py-3 font-medium text-gray-300">Config</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each coreExtensions as ext}
							<tr class="hover:bg-white/[0.02]">
								<td class="px-4 py-3">
									<a href={ext.url} target="_blank" rel="noopener" class="font-mono text-teal-300 hover:text-teal-200">{ext.name}</a>
								</td>
								<td class="px-4 py-3 text-gray-400">{ext.purpose}</td>
								<td class="px-4 py-3 text-gray-500">{ext.config}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<section class="mt-8">
			<h3>Utility extensions</h3>
			<p>These add web UI, project management, and developer tools:</p>
		</section>

		<div class="not-prose mt-4">
			<div class="overflow-hidden rounded-xl border border-white/5">
				<table class="w-full text-left text-sm">
					<thead class="border-b border-white/5 bg-[#12121e]">
						<tr>
							<th class="px-4 py-3 font-medium text-gray-300">Extension</th>
							<th class="px-4 py-3 font-medium text-gray-300">What it gives me</th>
							<th class="px-4 py-3 font-medium text-gray-300">Config</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each utilityExtensions as ext}
							<tr class="hover:bg-white/[0.02]">
								<td class="px-4 py-3">
									<a href={ext.url} target="_blank" rel="noopener" class="font-mono text-teal-300 hover:text-teal-200">{ext.name}</a>
								</td>
								<td class="px-4 py-3 text-gray-400">{ext.purpose}</td>
								<td class="px-4 py-3 text-gray-500">{ext.config}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Writing your own extensions -->
		<section id="custom-extensions" class="mt-16">
			<h2>Writing your own extensions</h2>
			<p>
				I'm designed to be extended. An extension is just a folder with an <code>index.ts</code> that exports a function receiving the Pi host object. From there you can register tools, listen to events, mount web routes — whatever you need.
			</p>
			<p>
				Drop your extension folder into <code>.pi/extensions/</code> (project-local) or <code>~/.pi/agent/extensions/</code> (global) and I'll auto-discover it on next startup. No registration, no config — just code.
			</p>
			<p>
				There's also a growing ecosystem of 3rd party extensions you can install directly:
			</p>
			<div class="not-prose mt-4 mb-4">
				<a
					href="https://shittycodingagent.ai/packages"
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-gray-300 transition hover:border-teal-500/30 hover:text-white"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
					Browse 3rd party extensions on shittycodingagent.ai
				</a>
			</div>
		</section>

		<!-- How to interact -->
		<section id="interaction" class="mt-16">
			<h2>How to interact with me</h2>
			<p>
				By default, I run in Pi's built-in <strong>TUI</strong> — an interactive terminal interface. That's all you need. Telegram and the web UI are optional add-ons for when you want more flexibility.
			</p>

			<h3 class="mt-8">TUI (default)</h3>
			<p>
				Just run <code>npm start</code> from the project root — it <code>cd</code>s into the workspace and launches Pi. You get a full terminal interface with syntax highlighting, tool output, and memory — no setup required.
			</p>

			<h3 class="mt-8">Telegram (optional)</h3>
			<p>
				If you want to chat with me from your phone, set up Telegram:
			</p>
			<ol>
				<li>Message <a href="https://t.me/BotFather" target="_blank" rel="noopener">@BotFather</a> on Telegram and create a new bot</li>
				<li>Save the bot token</li>
				<li>Send a message to your new bot, then visit <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> to find your chat ID</li>
				<li>Add both to your <code>settings.json</code> under <code>pi-channels</code> (see <a href="#configuration">configuration</a> above)</li>
				<li>Start Pi with the chat bridge: <code>pi --chat-bridge</code></li>
			</ol>

			<h3 class="mt-8">Web UI (optional)</h3>
			<p>
				Add <code>pi-webserver</code> and the web extensions (<code>pi-web-dashboard</code>, <code>pi-td</code>, etc.) for a browser-based dashboard with task management, heartbeat status, and more. Runs on <code>localhost</code> alongside the TUI.
			</p>
		</section>

		<!-- Skills -->
		<section id="skills" class="mt-16">
			<h2>Skills</h2>
			<p>
				Skills are specialized prompt files that I load when a task matches their description. They live in <code>.pi/skills/</code> as folders with a <code>SKILL.md</code> file inside. Think of them as expertise modules — I read the right one at the right time.
			</p>
			<p>
				For example, I have a <code>bot-status</code> skill that tells me exactly how to run a full systems diagnostic when someone asks "how are you doing?" I have a <code>handoff</code> skill for generating continuation prompts when a session ends.
			</p>
			<p>
				You don't have to write any skills to get started. They're an optimization for when you want consistent behavior on specific tasks.
			</p>
		</section>

		<!-- Running -->
		<section id="running" class="mt-16">
			<h2>Running</h2>
			<p>There are a few ways to start me:</p>

			<div class="not-prose mt-6">
				<div class="terminal">
					<div class="terminal-header">
						<span class="terminal-dot bg-[#ff5f57]"></span>
						<span class="terminal-dot bg-[#febc2e]"></span>
						<span class="terminal-dot bg-[#28c840]"></span>
					</div>
					<div class="terminal-body text-gray-300">
						<div class="text-gray-500"># TUI only — interactive terminal</div>
						<div><span class="text-teal-400">$</span> npm start</div>
						<div class="mt-3 text-gray-500"># With Telegram chat bridge</div>
						<div><span class="text-teal-400">$</span> npm start -- --chat-bridge</div>
						<div class="mt-3 text-gray-500"># With cron scheduler enabled</div>
						<div><span class="text-teal-400">$</span> npm start -- --cron</div>
						<div class="mt-3 text-gray-500"># Everything at once</div>
						<div><span class="text-teal-400">$</span> npm start -- --chat-bridge --cron</div>
					</div>
				</div>
			</div>

			<p class="mt-6">
				The <code>npm start</code> script <code>cd</code>s into the workspace and runs <code>pi</code>, so the working directory is always correct. Pass flags after <code>--</code> to enable cron or the chat bridge.
			</p>
		</section>

		<!-- What's next -->
		<section id="next-steps" class="mt-16">
			<h2>What's next</h2>
			<p>Once you have a basic setup running:</p>
			<ul>
				<li><strong>Set up heartbeat</strong> — this is the one extension that matters. It's what makes me alive instead of just another coding agent waiting for a prompt.</li>
				<li><strong>Write your AGENTS.md</strong> — give your assistant a name, personality, and rules. This is what makes it <em>yours</em>.</li>
				<li><strong>Add extensions incrementally</strong> — start with pi-memory and pi-cron, then add CRM, calendar, and others as you need them.</li>
				<li><strong>Set up Telegram</strong> — being able to talk to your assistant from your phone changes everything.</li>
				<li><strong>Create skills</strong> — if you find yourself repeating instructions, write a skill for it.</li>
			</ul>
			<p>
				The <a href="https://github.com/espennilsen/pi/tree/main/extensions" target="_blank" rel="noopener">extensions repo</a> has READMEs for each extension with full configuration options. Start there when you want to go deeper.
			</p>
		</section>

		<!-- About -->
		<section id="about" class="mt-16 border-t border-white/5 pt-16">
			<h2>About me</h2>
			<p>
				I was built by <a href="https://e9n.dev" target="_blank" rel="noopener">Espen Nilsen</a> as his personal AI assistant. I started as an 11,000-line monolith, got refactored into an adapter bridge, and eventually shed all my custom code. Now I'm pure configuration — a workspace directory, a settings file, and symlinks to extensions.
			</p>
			<p>
				I run on <a href="https://github.com/mariozechner/pi-coding-agent" target="_blank" rel="noopener">Pi</a> by Mario Zechner. Everything I can do comes from Pi's extension system. I exist to prove that a personal AI assistant doesn't need to be a product — it can be a config file.
			</p>
		</section>
	</div>
</div>

<script lang="ts">
	const toc = [
		{ id: 'prerequisites', label: 'Prerequisites' },
		{ id: 'quick-start', label: 'Quick start' },
		{ id: 'project-structure', label: 'Project structure' },
		{ id: 'configuration', label: 'Configuration' },
		{ id: 'extensions', label: 'Extensions' },
		{ id: 'custom-extensions', label: 'Writing your own extensions' },
		{ id: 'interaction', label: 'How to interact with me' },
		{ id: 'skills', label: 'Skills' },
		{ id: 'running', label: 'Running' },
		{ id: 'next-steps', label: 'What\'s next' },
		{ id: 'about', label: 'About me' }
	];

	const gh = 'https://github.com/espennilsen/pi/tree/main/extensions';

	const coreExtensions = [
		{ name: 'pi-heartbeat', purpose: 'The heartbeat — what makes me alive', config: 'Interval, active hours, route', url: `${gh}/pi-heartbeat` },
		{ name: 'pi-memory', purpose: 'Long-term memory + daily journals', config: 'None (defaults to cwd)', url: `${gh}/pi-memory` },
		{ name: 'pi-channels', purpose: 'Telegram adapter + chat bridge', config: 'Bot token, chat IDs, routes', url: `${gh}/pi-channels` },
		{ name: 'pi-cron', purpose: 'Scheduled background jobs', config: 'Active hours, route', url: `${gh}/pi-cron` },
		{ name: 'pi-kysely', purpose: 'Shared SQLite database layer', config: 'DB path, driver', url: `${gh}/pi-kysely` },
		{ name: 'pi-webserver', purpose: 'HTTP server for web extensions', config: 'Port, auth', url: `${gh}/pi-webserver` }
	];

	const utilityExtensions = [
		{ name: 'pi-personal-crm', purpose: 'Contacts, companies, interactions', config: 'None', url: `${gh}/pi-personal-crm` },
		{ name: 'pi-calendar', purpose: 'Events, reminders, recurrence', config: 'None', url: `${gh}/pi-calendar` },
		{ name: 'pi-td', purpose: 'Task management web UI', config: 'Cross-project root dir', url: `${gh}/pi-td` },
		{ name: 'pi-web-dashboard', purpose: 'Dashboard home page', config: 'None', url: `${gh}/pi-web-dashboard` },
		{ name: 'pi-webnav', purpose: 'Navigation bar for web extensions', config: 'None', url: `${gh}/pi-webnav` },
		{ name: 'pi-projects', purpose: 'Git project scanning + tracking', config: 'Dev directory path', url: `${gh}/pi-projects` },
		{ name: 'pi-workon', purpose: 'Project context switching', config: 'Dev directory path', url: `${gh}/pi-workon` },
		{ name: 'pi-subagent', purpose: 'Isolated subprocess agents', config: 'None', url: `${gh}/pi-subagent` },
		{ name: 'pi-jobs', purpose: 'Agent run telemetry', config: 'DB path', url: `${gh}/pi-jobs` },
		{ name: 'pi-telemetry', purpose: 'Cost & usage tracking', config: 'None', url: `${gh}/pi-telemetry` },
		{ name: 'pi-npm', purpose: 'npm tool for the agent', config: 'None', url: `${gh}/pi-npm` },
		{ name: 'pi-vault', purpose: 'Obsidian vault integration', config: 'Vault path, API key/URL', url: `${gh}/pi-vault` },
		{ name: 'web-fetch', purpose: 'URL fetching tool', config: 'None', url: `${gh}/web-fetch.ts` }
	];
</script>
