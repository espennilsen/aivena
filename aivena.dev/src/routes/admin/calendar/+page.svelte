<script lang="ts">
	import { calendar, type CalendarEvent } from '$lib/admin/api';

	let events = $state<CalendarEvent[]>([]);
	let error = $state('');
	let showCreate = $state(false);
	let editingEvent = $state<CalendarEvent | null>(null);
	let deleteConfirm = $state<number | null>(null);

	// Form state
	let form = $state({
		title: '',
		description: '',
		start_time: '',
		end_time: '',
		all_day: false,
		color: '#7c6ff0'
	});

	function resetForm() {
		form = { title: '', description: '', start_time: '', end_time: '', all_day: false, color: '#7c6ff0' };
	}

	function dateRange() {
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
			const range = dateRange();
			events = await calendar.list(range.start, range.end);
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	async function handleCreate() {
		if (!form.title || (!form.all_day && (!form.start_time || !form.end_time))) {
			error = 'Title and times are required';
			return;
		}
		try {
			const data: Partial<CalendarEvent> = {
				title: form.title,
				description: form.description || null,
				all_day: form.all_day,
				color: form.color || null
			};
			if (form.all_day) {
				data.start_time = form.start_time + 'T00:00:00';
				data.end_time = form.start_time + 'T23:59:59';
			} else {
				data.start_time = form.start_time;
				data.end_time = form.end_time;
			}
			await calendar.create(data);
			showCreate = false;
			resetForm();
			await load();
		} catch (e) {
			error = String(e);
		}
	}

	async function handleUpdate() {
		if (!editingEvent) return;
		try {
			const data: Partial<CalendarEvent> & { id: number } = {
				id: editingEvent.id,
				title: form.title,
				description: form.description || null,
				all_day: form.all_day,
				color: form.color || null
			};
			if (form.all_day) {
				data.start_time = form.start_time.slice(0, 10) + 'T00:00:00';
				data.end_time = form.start_time.slice(0, 10) + 'T23:59:59';
			} else {
				data.start_time = form.start_time;
				data.end_time = form.end_time;
			}
			await calendar.update(data);
			editingEvent = null;
			resetForm();
			await load();
		} catch (e) {
			error = String(e);
		}
	}

	function startEdit(event: CalendarEvent) {
		editingEvent = event;
		showCreate = false;
		form = {
			title: event.title,
			description: event.description ?? '',
			start_time: event.all_day ? event.start_time.slice(0, 10) : event.start_time.slice(0, 16),
			end_time: event.end_time ? (event.all_day ? event.end_time.slice(0, 10) : event.end_time.slice(0, 16)) : '',
			all_day: event.all_day,
			color: event.color ?? '#7c6ff0'
		};
	}

	function cancelEdit() {
		editingEvent = null;
		resetForm();
	}

	async function handleDelete(id: number) {
		try {
			await calendar.delete(id);
			deleteConfirm = null;
			if (editingEvent?.id === id) cancelEdit();
			await load();
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

	function nowLocal(): string {
		const d = new Date();
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 16);
	}

	function nowPlusHour(): string {
		const d = new Date(Date.now() + 3600000);
		d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
		return d.toISOString().slice(0, 16);
	}
</script>

<div class="max-w-3xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Calendar</h1>
		<div class="flex gap-2">
			<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
			<button
				onclick={() => { showCreate = !showCreate; editingEvent = null; if (showCreate) { resetForm(); form.start_time = nowLocal(); form.end_time = nowPlusHour(); } }}
				class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
			>
				+ New event
			</button>
		</div>
	</div>
	<p class="mt-1 text-sm text-gray-500">Next 30 days</p>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Create / Edit form -->
	{#if showCreate || editingEvent}
		<div class="mt-4 rounded-xl border border-teal-500/20 bg-[#12121e] p-5">
			<h2 class="mb-4 font-semibold">{editingEvent ? 'Edit event' : 'New event'}</h2>
			<div class="space-y-3">
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="ev-title">Title</label>
					<input
						id="ev-title"
						bind:value={form.title}
						placeholder="Event title"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					/>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="ev-desc">Description</label>
					<textarea
						id="ev-desc"
						bind:value={form.description}
						rows="2"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					></textarea>
				</div>
				<div class="flex items-center gap-3">
					<label class="flex items-center gap-2 text-sm text-gray-400">
						<input type="checkbox" bind:checked={form.all_day} class="rounded" />
						All day
					</label>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					{#if form.all_day}
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="ev-date">Date</label>
							<input
								id="ev-date"
								type="date"
								bind:value={form.start_time}
								class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
							/>
						</div>
					{:else}
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="ev-start">Start</label>
							<input
								id="ev-start"
								type="datetime-local"
								bind:value={form.start_time}
								class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
							/>
						</div>
						<div>
							<label class="mb-1 block text-xs text-gray-500" for="ev-end">End</label>
							<input
								id="ev-end"
								type="datetime-local"
								bind:value={form.end_time}
								class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
							/>
						</div>
					{/if}
				</div>
				<div class="flex items-center justify-between pt-2">
					<button
						onclick={() => { if (editingEvent) cancelEdit(); else showCreate = false; }}
						class="text-sm text-gray-500 hover:text-gray-300"
					>
						Cancel
					</button>
					<button
						onclick={() => { if (editingEvent) handleUpdate(); else handleCreate(); }}
						class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
					>
						{editingEvent ? 'Save changes' : 'Create event'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Event list -->
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
						<div class="group rounded-xl border border-white/5 bg-[#12121e] p-4 transition hover:border-teal-500/20">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									{#if event.color}
										<span class="h-2.5 w-2.5 rounded-full" style="background: {event.color}"></span>
									{/if}
									<span class="text-sm font-medium">{event.title}</span>
								</div>
								<div class="flex items-center gap-3">
									{#if !event.all_day}
										<span class="text-xs text-gray-500">{formatTime(event.start_time)}</span>
									{:else}
										<span class="text-xs text-gray-500">All day</span>
									{/if}
									<div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
										<button
											onclick={() => startEdit(event)}
											class="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-white/5 hover:text-teal-300"
										>
											Edit
										</button>
										{#if deleteConfirm === event.id}
											<button
												onclick={() => handleDelete(event.id)}
												class="rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-400/10"
											>
												Confirm
											</button>
											<button
												onclick={() => deleteConfirm = null}
												class="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-white/5"
											>
												Cancel
											</button>
										{:else}
											<button
												onclick={() => deleteConfirm = event.id}
												class="rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-red-400/10 hover:text-red-400"
											>
												Delete
											</button>
										{/if}
									</div>
								</div>
							</div>
							{#if event.description}
								<p class="mt-1 text-xs text-gray-500">{event.description}</p>
							{/if}
							{#if event.recurrence}
								<span class="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">🔄 {event.recurrence}</span>
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
