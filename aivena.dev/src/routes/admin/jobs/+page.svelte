<script lang="ts">
	import { jobs, type JobStats, type RecentJob, type ModelBreakdown, type ToolBreakdown } from '$lib/admin/api';

	let stats = $state<JobStats | null>(null);
	let recent = $state<RecentJob[]>([]);
	let models = $state<ModelBreakdown[]>([]);
	let tools = $state<ToolBreakdown[]>([]);
	let error = $state('');

	let filterChannel = $state('');
	let filterPeriod = $state(30);

	async function load() {
		try {
			const channel = filterChannel || undefined;
			const [s, r, m, t] = await Promise.all([
				jobs.stats(channel),
				jobs.recent(50, channel),
				jobs.models(filterPeriod),
				jobs.tools(filterPeriod)
			]);
			stats = s;
			recent = r;
			models = m;
			tools = t;
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		// Re-run when filters change
		filterChannel;
		filterPeriod;
		load();
	});

	function formatDuration(ms: number | null): string {
		if (!ms) return '—';
		if (ms < 1000) return ms + 'ms';
		return (ms / 1000).toFixed(1) + 's';
	}

	function formatTokens(n: number): string {
		if (!n) return '0';
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
		if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
		return String(n);
	}
</script>

<div class="max-w-5xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Jobs</h1>
		<div class="flex items-center gap-2">
			<select
				bind:value={filterChannel}
				class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-teal-500/50"
			>
				<option value="">All channels</option>
				<option value="tui">TUI</option>
				<option value="cron">Cron</option>
				<option value="heartbeat">Heartbeat</option>
				<option value="subagent">Subagent</option>
			</select>
			<select
				bind:value={filterPeriod}
				class="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 outline-none focus:border-teal-500/50"
			>
				<option value={7}>7 days</option>
				<option value={30}>30 days</option>
				<option value={90}>90 days</option>
			</select>
			<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
		</div>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	{#if stats}
		<div class="mt-6 grid gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold">{stats.jobs}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Total Runs</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold {stats.errors > 0 ? 'text-red-400' : ''}">{stats.errors}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Errors</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold">{formatTokens(stats.tokens)}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Tokens</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold">${(stats.cost ?? 0).toFixed(2)}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Cost</div>
			</div>
		</div>
	{/if}

	<!-- Models & Tools side by side -->
	<div class="mt-6 grid gap-4 lg:grid-cols-2">
		<!-- Model breakdown -->
		{#if models.length > 0}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<h2 class="mb-3 font-semibold">Models</h2>
				<table class="w-full text-left text-sm">
					<thead class="border-b border-white/5 text-xs text-gray-500">
						<tr>
							<th class="pb-2 font-medium">Model</th>
							<th class="pb-2 text-right font-medium">Jobs</th>
							<th class="pb-2 text-right font-medium">Tokens</th>
							<th class="pb-2 text-right font-medium">Cost</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each models as m}
							<tr>
								<td class="py-2 font-mono text-xs text-gray-300">{m.model ?? 'unknown'}</td>
								<td class="py-2 text-right text-gray-400">{m.job_count}</td>
								<td class="py-2 text-right text-gray-400">{formatTokens(m.tokens_total)}</td>
								<td class="py-2 text-right text-gray-400">${Number(m.cost_total ?? 0).toFixed(2)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Tools breakdown -->
		{#if tools.length > 0}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<h2 class="mb-3 font-semibold">Tools</h2>
				<table class="w-full text-left text-sm">
					<thead class="border-b border-white/5 text-xs text-gray-500">
						<tr>
							<th class="pb-2 font-medium">Tool</th>
							<th class="pb-2 text-right font-medium">Calls</th>
							<th class="pb-2 text-right font-medium">Errors</th>
							<th class="pb-2 text-right font-medium">Avg Time</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each tools as t}
							<tr>
								<td class="py-2 font-mono text-xs text-gray-300">{t.tool_name}</td>
								<td class="py-2 text-right text-gray-400">{t.call_count}</td>
								<td class="py-2 text-right {t.error_count > 0 ? 'text-red-400' : 'text-gray-400'}">{t.error_count}</td>
								<td class="py-2 text-right text-gray-400">{formatDuration(t.avg_duration_ms)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Recent jobs -->
	{#if recent.length > 0}
		<div class="mt-6 overflow-hidden rounded-xl border border-white/5 bg-[#12121e]">
			<div class="p-5 pb-3">
				<h2 class="font-semibold">Recent</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-y border-white/5 text-xs text-gray-500">
						<tr>
							<th class="px-5 py-2 font-medium">Status</th>
							<th class="px-5 py-2 font-medium">Channel</th>
							<th class="px-5 py-2 font-medium">Model</th>
							<th class="px-5 py-2 font-medium text-right">Tokens</th>
							<th class="px-5 py-2 font-medium text-right">Cost</th>
							<th class="px-5 py-2 font-medium text-right">Tools</th>
							<th class="px-5 py-2 font-medium text-right">Duration</th>
							<th class="px-5 py-2 font-medium">When</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each recent as job}
							<tr class="hover:bg-white/[0.02]">
								<td class="px-5 py-2.5">
									<span class="text-xs {job.status === 'error' ? 'text-red-400' : 'text-green-400'}">
										{job.status === 'error' ? '✗' : '✓'} {job.status}
									</span>
								</td>
								<td class="px-5 py-2.5">
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs">{job.channel}</span>
								</td>
								<td class="px-5 py-2.5 font-mono text-xs text-gray-400">{job.model ?? '—'}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">{formatTokens(job.total_tokens ?? 0)}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">${(job.cost_total ?? 0).toFixed(3)}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">{job.tool_call_count ?? 0}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">{formatDuration(job.duration_ms)}</td>
								<td class="px-5 py-2.5 text-xs text-gray-500">{new Date(job.created_at).toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
