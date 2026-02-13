<script lang="ts">
	import { heartbeat, type HeartbeatStatus, type HeartbeatHistoryEntry } from '$lib/admin/api';

	let status = $state<HeartbeatStatus | null>(null);
	let error = $state('');
	let loading = $state(false);
	let expandedIndex = $state<number | null>(null);

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

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	function formatDuration(ms: number): string {
		return (ms / 1000).toFixed(1) + 's';
	}

	function truncate(text: string, max: number): string {
		if (text.length <= max) return text;
		return text.slice(0, max) + '…';
	}
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Heartbeat</h1>
		<div class="flex gap-2">
			<button
				onclick={() => action(heartbeat.run)}
				disabled={loading}
				class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
			>
				▶ Run now
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

		<!-- Status bar -->
		<div class="mt-6 flex items-center gap-4 rounded-xl border border-white/5 bg-[#12121e] px-5 py-3.5">
			<span class="relative flex h-2.5 w-2.5">
				{#if s.running}
					<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
					<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-400"></span>
				{:else if s.active}
					<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span>
				{:else}
					<span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-gray-500"></span>
				{/if}
			</span>
			<span class="text-sm font-semibold">
				{#if s.running}
					<span class="text-blue-400">Running</span>
				{:else if s.active}
					<span class="text-green-400">Active</span>
				{:else}
					<span class="text-gray-400">Inactive</span>
				{/if}
			</span>
			<span class="text-xs text-gray-500">Every {s.intervalMinutes}m</span>
			{#if s.lastRun}
				<span class="text-xs text-gray-500">Last run: {new Date(s.lastRun).toLocaleString()}</span>
			{/if}
		</div>

		<!-- Stats -->
		<div class="mt-4 grid gap-3 sm:grid-cols-4">
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold text-blue-400">{s.runCount}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Total Runs</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold text-green-400">{s.okCount}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">OK</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold text-red-400">{s.alertCount}</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">Alerts</div>
			</div>
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center">
				<div class="text-2xl font-bold text-teal-400">
					{s.runCount ? ((s.okCount / s.runCount) * 100).toFixed(0) : 0}%
				</div>
				<div class="mt-1 text-xs uppercase tracking-wide text-gray-500">OK Rate</div>
			</div>
		</div>

		<!-- Last result -->
		{#if s.lastRun}
			<div class="mt-6">
				<h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Last Check</h2>
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 {status.history[0]?.ok === false ? 'border-l-2 border-l-red-400' : 'border-l-2 border-l-green-400'}">
					{#if s.lastResult}
						<pre class="max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-400">{s.lastResult}</pre>
					{:else}
						<p class="text-sm text-gray-500">No result data</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- History -->
		{#if status.history.length > 0}
			<div class="mt-6">
				<h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">History</h2>
				<div class="space-y-1.5">
					{#each status.history as entry, i}
						<button
							onclick={() => expandedIndex = expandedIndex === i ? null : i}
							class="w-full rounded-xl border border-white/5 bg-[#12121e] p-3.5 text-left transition hover:border-teal-500/30"
						>
							<div class="flex items-center gap-3">
								<span class="text-base">{entry.ok ? '✅' : '🚨'}</span>
								<span class="font-mono text-xs text-gray-500">{formatTime(entry.time)}</span>
								<span class="text-xs text-gray-500">{formatDate(entry.time)}</span>
								<span class="rounded-full px-2 py-0.5 text-xs font-semibold uppercase {entry.ok ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}">
									{entry.ok ? 'OK' : 'Alert'}
								</span>
								<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">
									{formatDuration(entry.durationMs)}
								</span>
								{#if expandedIndex !== i}
									<span class="ml-auto truncate text-xs text-gray-600">{truncate(entry.response, 80)}</span>
								{/if}
							</div>
							{#if expandedIndex === i}
								<pre class="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap border-t border-white/5 pt-3 text-xs leading-relaxed text-gray-400">{entry.response}</pre>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>
