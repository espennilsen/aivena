<script lang="ts">
	import { jobs, type JobStats, type RecentJob } from '$lib/admin/api';

	let stats = $state<JobStats | null>(null);
	let recent = $state<RecentJob[]>([]);
	let models = $state<unknown[]>([]);
	let error = $state('');

	async function load() {
		try {
			const [s, r, m] = await Promise.all([jobs.stats(), jobs.recent(50), jobs.models()]);
			stats = s;
			recent = r;
			models = m as unknown[];
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		load();
	});
</script>

<div class="max-w-5xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Jobs</h1>
		<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	{#if stats}
		<div class="mt-6 grid gap-4 sm:grid-cols-4">
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Total runs</div>
				<div class="mt-1 text-lg font-semibold">{stats.jobs}</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Errors</div>
				<div class="mt-1 text-lg font-semibold {stats.errors > 0 ? 'text-red-400' : ''}">{stats.errors}</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Tokens</div>
				<div class="mt-1 text-lg font-semibold">{stats.tokens ? (stats.tokens / 1000).toFixed(0) + 'k' : '0'}</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Cost</div>
				<div class="mt-1 text-lg font-semibold">${(stats.cost ?? 0).toFixed(2)}</div>
			</div>
		</div>
	{/if}

	<!-- Model breakdown -->
	{#if models.length > 0}
		<div class="mt-6 rounded-xl border border-white/5 bg-[#12121e] p-5">
			<h2 class="font-semibold">Models</h2>
			<div class="mt-3 space-y-2">
				{#each models as model}
					{@const m = model as Record<string, unknown>}
					<div class="flex items-center justify-between text-sm">
						<span class="font-mono text-gray-300">{m.model ?? 'unknown'}</span>
						<span class="text-gray-500">{m.job_count} runs · ${Number(m.cost_total ?? 0).toFixed(2)}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Recent jobs -->
	{#if recent.length > 0}
		<div class="mt-6 rounded-xl border border-white/5 bg-[#12121e] overflow-hidden">
			<div class="p-5 pb-3">
				<h2 class="font-semibold">Recent</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="border-y border-white/5 text-xs text-gray-500">
						<tr>
							<th class="px-5 py-2 font-medium">Channel</th>
							<th class="px-5 py-2 font-medium">Model</th>
							<th class="px-5 py-2 font-medium">Status</th>
							<th class="px-5 py-2 font-medium text-right">Tokens</th>
							<th class="px-5 py-2 font-medium text-right">Cost</th>
							<th class="px-5 py-2 font-medium text-right">Duration</th>
							<th class="px-5 py-2 font-medium">When</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-white/5">
						{#each recent as job}
							<tr class="hover:bg-white/[0.02]">
								<td class="px-5 py-2.5">
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs">{job.channel}</span>
								</td>
								<td class="px-5 py-2.5 font-mono text-xs text-gray-400">{job.model ?? '—'}</td>
								<td class="px-5 py-2.5">
									<span class="text-xs {job.status === 'error' ? 'text-red-400' : 'text-green-400'}">{job.status}</span>
								</td>
								<td class="px-5 py-2.5 text-right text-gray-400">{(job.total_tokens ?? 0).toLocaleString()}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">${(job.cost_total ?? 0).toFixed(3)}</td>
								<td class="px-5 py-2.5 text-right text-gray-400">{job.duration_ms ? (job.duration_ms / 1000).toFixed(1) + 's' : '—'}</td>
								<td class="px-5 py-2.5 text-xs text-gray-500">{new Date(job.created_at).toLocaleString()}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
