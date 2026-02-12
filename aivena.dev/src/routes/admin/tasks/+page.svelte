<script lang="ts">
	import { td } from '$lib/admin/api';

	interface Issue {
		id: string;
		title: string;
		status: string;
		priority: string;
		created_at: string;
		tags?: string[];
	}

	let issues = $state<Issue[]>([]);
	let error = $state('');
	let filter = $state('all');

	async function load() {
		try {
			const data = (await td.issues()) as { issues?: Issue[] };
			issues = data.issues ?? [];
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		load();
	});

	let filtered = $derived(
		filter === 'all' ? issues : issues.filter((i) => i.status === filter)
	);

	const statusColors: Record<string, string> = {
		open: 'text-blue-400',
		'in-progress': 'text-yellow-400',
		review: 'text-purple-400',
		done: 'text-green-400',
		closed: 'text-gray-500'
	};

	const priorityColors: Record<string, string> = {
		P0: 'text-red-400',
		P1: 'text-orange-400',
		P2: 'text-yellow-400',
		P3: 'text-gray-400'
	};
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Tasks</h1>
		<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Filters -->
	<div class="mt-6 flex gap-2">
		{#each ['all', 'open', 'in-progress', 'review', 'done'] as s}
			<button
				onclick={() => (filter = s)}
				class="rounded-lg px-3 py-1.5 text-xs transition {filter === s ? 'bg-teal-500/10 text-teal-300' : 'text-gray-500 hover:text-gray-300'}"
			>
				{s}
			</button>
		{/each}
	</div>

	<!-- Issues -->
	<div class="mt-4 space-y-2">
		{#each filtered as issue}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<div class="flex items-center gap-2">
							<span class="font-mono text-xs text-gray-500">{issue.id}</span>
							<span class="text-xs {priorityColors[issue.priority] ?? 'text-gray-500'}">{issue.priority}</span>
						</div>
						<h3 class="mt-1 text-sm font-medium">{issue.title}</h3>
						{#if issue.tags && issue.tags.length > 0}
							<div class="mt-2 flex gap-1.5">
								{#each issue.tags as tag}
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
					<span class="shrink-0 text-xs {statusColors[issue.status] ?? 'text-gray-500'}">{issue.status}</span>
				</div>
			</div>
		{:else}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
				No tasks found
			</div>
		{/each}
	</div>
</div>
