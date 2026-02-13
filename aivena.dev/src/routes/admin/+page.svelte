<script lang="ts">
	import { heartbeat, jobs, crm, td, type HeartbeatStatus, type JobStats } from '$lib/admin/api';

	let hbStatus = $state<HeartbeatStatus | null>(null);
	let jobStats = $state<JobStats | null>(null);
	let upcomingReminders = $state<unknown[]>([]);
	let taskData = $state<{ issues?: unknown[] } | null>(null);
	let errors = $state<string[]>([]);

	async function load() {
		errors = [];
		const results = await Promise.allSettled([
			heartbeat.status(),
			jobs.stats(),
			crm.upcoming(),
			td.issues()
		]);

		if (results[0].status === 'fulfilled') hbStatus = results[0].value;
		else errors.push(`Heartbeat: ${results[0].reason}`);

		if (results[1].status === 'fulfilled') jobStats = results[1].value;
		else errors.push(`Jobs: ${results[1].reason}`);

		if (results[2].status === 'fulfilled') upcomingReminders = results[2].value as unknown[];

		if (results[3].status === 'fulfilled') taskData = results[3].value as { issues?: unknown[] };
	}

	$effect(() => {
		load();
		const interval = setInterval(load, 30_000);
		return () => clearInterval(interval);
	});
</script>

<div class="max-w-5xl">
	<h1 class="text-2xl font-bold">Overview</h1>
	<p class="mt-1 text-sm text-gray-500">Last refreshed every 30s</p>

	{#if errors.length > 0}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
			{#each errors as err}
				<p class="text-sm text-red-400">{err}</p>
			{/each}
		</div>
	{/if}

	<!-- Stat cards -->
	<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
			<div class="text-xs text-gray-500">Heartbeat</div>
			<div class="mt-1 text-lg font-semibold">
				{#if hbStatus}
					{#if hbStatus.status.running}
						<span class="text-yellow-400">Running</span>
					{:else if hbStatus.status.active}
						<span class="text-green-400">Active</span>
					{:else}
						<span class="text-gray-400">Inactive</span>
					{/if}
				{:else}
					<span class="text-gray-600">—</span>
				{/if}
			</div>
			{#if hbStatus?.status?.lastRun}
				<div class="mt-1 text-xs text-gray-500">Last: {new Date(hbStatus.status.lastRun).toLocaleString()}</div>
			{/if}
		</div>

		<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
			<div class="text-xs text-gray-500">Total Jobs</div>
			<div class="mt-1 text-lg font-semibold">{jobStats?.jobs ?? '—'}</div>
			{#if jobStats?.errors}
				<div class="mt-1 text-xs text-red-400">{jobStats.errors} errors</div>
			{/if}
		</div>

		<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
			<div class="text-xs text-gray-500">Cost (total)</div>
			<div class="mt-1 text-lg font-semibold">
				{jobStats ? `$${(jobStats.cost ?? 0).toFixed(2)}` : '—'}
			</div>
			{#if jobStats?.tokens}
				<div class="mt-1 text-xs text-gray-500">{(jobStats.tokens / 1000).toFixed(0)}k tokens</div>
			{/if}
		</div>

		<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
			<div class="text-xs text-gray-500">Open Tasks</div>
			<div class="mt-1 text-lg font-semibold">
				{taskData?.issues ? (taskData.issues as unknown[]).length : '—'}
			</div>
		</div>
	</div>

	<!-- Heartbeat detail -->
	{#if hbStatus}
		{@const s = hbStatus.status}
		<div class="mt-6 rounded-xl border border-white/5 bg-[#12121e] p-5">
			<div class="flex items-center justify-between">
				<h2 class="font-semibold">Heartbeat</h2>
				<div class="flex gap-2">
					<button onclick={() => heartbeat.run().then(load)} class="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500">Run now</button>
					{#if s.active}
						<button onclick={() => heartbeat.stop().then(load)} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Stop</button>
					{:else}
						<button onclick={() => heartbeat.start().then(load)} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Start</button>
					{/if}
				</div>
			</div>
			<div class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
				<div>
					<span class="text-gray-500">Interval:</span>
					<span class="ml-1">{s.intervalMinutes}m</span>
				</div>
				<div>
					<span class="text-gray-500">OK rate:</span>
					<span class="ml-1">{s.runCount ? ((s.okCount / s.runCount) * 100).toFixed(0) : 0}%</span>
				</div>
				<div>
					<span class="text-gray-500">Alerts:</span>
					<span class="ml-1 {s.alertCount > 0 ? 'text-red-400' : ''}">{s.alertCount}</span>
				</div>
			</div>
			{#if s.lastResult}
				<div class="mt-4 rounded-lg bg-white/5 p-3 font-mono text-xs text-gray-400">
					<pre class="overflow-x-auto whitespace-pre-wrap">{s.lastResult}</pre>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Upcoming reminders -->
	{#if (upcomingReminders as unknown[]).length > 0}
		<div class="mt-6 rounded-xl border border-white/5 bg-[#12121e] p-5">
			<h2 class="font-semibold">Upcoming</h2>
			<div class="mt-3 space-y-2">
				{#each upcomingReminders as reminder}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-300">{(reminder as Record<string, unknown>).message ?? (reminder as Record<string, unknown>).name}</span>
						<span class="text-gray-500">{(reminder as Record<string, unknown>).date ?? (reminder as Record<string, unknown>).reminder_date}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
