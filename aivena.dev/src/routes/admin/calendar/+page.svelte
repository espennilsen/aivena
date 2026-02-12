<script lang="ts">
	import { calendar, type CalendarEvent } from '$lib/admin/api';

	let events = $state<CalendarEvent[]>([]);
	let error = $state('');

	function weekRange() {
		const now = new Date();
		const start = new Date(now);
		start.setDate(start.getDate() - start.getDay());
		const end = new Date(start);
		end.setDate(end.getDate() + 30);
		return {
			start: start.toISOString().slice(0, 10),
			end: end.toISOString().slice(0, 10)
		};
	}

	async function load() {
		try {
			const range = weekRange();
			events = await calendar.list(range.start, range.end);
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		load();
	});

	let grouped = $derived(() => {
		const groups: Record<string, CalendarEvent[]> = {};
		for (const event of events) {
			const date = event.start_time.slice(0, 10);
			if (!groups[date]) groups[date] = [];
			groups[date].push(event);
		}
		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
	});

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function isToday(dateStr: string): boolean {
		return dateStr === new Date().toISOString().slice(0, 10);
	}
</script>

<div class="max-w-3xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Calendar</h1>
		<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
	</div>
	<p class="mt-1 text-sm text-gray-500">Next 30 days</p>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<div class="mt-6 space-y-6">
		{#each grouped() as [date, dayEvents]}
			<div>
				<h2 class="text-sm font-medium {isToday(date) ? 'text-teal-300' : 'text-gray-400'}">
					{new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
						weekday: 'long',
						month: 'short',
						day: 'numeric'
					})}
					{#if isToday(date)}<span class="ml-2 text-xs text-teal-500">Today</span>{/if}
				</h2>
				<div class="mt-2 space-y-2">
					{#each dayEvents as event}
						<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">{event.title}</span>
								{#if !event.all_day}
									<span class="text-xs text-gray-500">{formatTime(event.start_time)}</span>
								{:else}
									<span class="text-xs text-gray-500">All day</span>
								{/if}
							</div>
							{#if event.description}
								<p class="mt-1 text-xs text-gray-500">{event.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
				No events in the next 30 days
			</div>
		{/each}
	</div>
</div>
