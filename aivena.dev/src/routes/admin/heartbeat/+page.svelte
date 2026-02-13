<script lang="ts">
	import { heartbeat, type HeartbeatStatus } from '$lib/admin/api';

	let status = $state<HeartbeatStatus | null>(null);
	let error = $state('');
	let loading = $state(false);

	async function load() {
		try {
			status = await heartbeat.status();
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	async function action(fn: () => Promise<unknown>) {
		loading = true;
		try {
			await fn();
			await load();
		} catch (e) {
			error = String(e);
		}
		loading = false;
	}

	$effect(() => {
		load();
		const interval = setInterval(load, 15_000);
		return () => clearInterval(interval);
	});
</script>

<div class="max-w-3xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Heartbeat</h1>
		<div class="flex gap-2">
			<button
				onclick={() => action(heartbeat.run)}
				disabled={loading}
				class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
			>
				Run now
			</button>
			{#if status?.status?.active}
				<button
					onclick={() => action(heartbeat.stop)}
					disabled={loading}
					class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:text-white disabled:opacity-50"
				>
					Stop
				</button>
			{:else}
				<button
					onclick={() => action(heartbeat.start)}
					disabled={loading}
					class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 transition hover:text-white disabled:opacity-50"
				>
					Start
				</button>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	{#if status}
		{@const s = status.status}
		<div class="mt-6 grid gap-4 sm:grid-cols-3">
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Status</div>
				<div class="mt-1 text-lg font-semibold">
					{#if s.running}
						<span class="text-yellow-400">Running</span>
					{:else if s.active}
						<span class="text-green-400">Active</span>
					{:else}
						<span class="text-gray-400">Inactive</span>
					{/if}
				</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">Interval</div>
				<div class="mt-1 text-lg font-semibold">{s.intervalMinutes}m</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="text-xs text-gray-500">OK Rate</div>
				<div class="mt-1 text-lg font-semibold">
					{s.runCount ? ((s.okCount / s.runCount) * 100).toFixed(0) : 0}%
				</div>
				<div class="mt-1 text-xs text-gray-500">
					{s.okCount} ok · {s.alertCount} alerts · {s.runCount} total
				</div>
			</div>
		</div>

		{#if s.lastRun}
			<div class="mt-6 rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="flex items-center justify-between">
					<h2 class="font-semibold">Last check</h2>
					<span class="text-xs text-gray-500">{new Date(s.lastRun).toLocaleString()}</span>
				</div>
				{#if s.lastResult}
					<div class="mt-3 rounded-lg bg-white/5 p-4 font-mono text-xs leading-relaxed text-gray-400">
						<pre class="overflow-x-auto whitespace-pre-wrap">{s.lastResult}</pre>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
