<script lang="ts">
	import { td, type TdIssue, type TdIssueDetail } from '$lib/admin/api';

	let issues = $state<TdIssue[]>([]);
	let detail = $state<TdIssueDetail | null>(null);
	let error = $state('');
	let filter = $state('open');
	let showCreate = $state(false);
	let logModal = $state<string | null>(null);
	let logMessage = $state('');
	let logType = $state('progress');
	let deleteConfirm = $state<string | null>(null);

	// Create form
	let createForm = $state({ title: '', type: 'task', priority: 'P2', description: '', labels: '' });

	async function load() {
		try {
			const allIssues = await td.issues({ all: filter === 'all' || filter === 'done' || filter === 'closed' });
			issues = filter === 'all' ? allIssues : allIssues.filter((i: TdIssue) => {
				if (filter === 'in-progress') return i.status === 'in_progress' || i.status === 'in-progress';
				if (filter === 'review') return i.status === 'in_review' || i.status === 'review';
				return i.status === filter;
			});
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	async function loadDetail(id: string) {
		try {
			detail = await td.detail(id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleCreate() {
		if (!createForm.title) return;
		try {
			await td.create(createForm);
			showCreate = false;
			createForm = { title: '', type: 'task', priority: 'P2', description: '', labels: '' };
			await load();
		} catch (e) {
			error = String(e);
		}
	}

	async function handleStatusChange(id: string, status: string) {
		try {
			await td.update({ id, status });
			await load();
			if (detail?.id === id) await loadDetail(id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleReview(id: string) {
		try {
			await td.review({ id });
			await load();
			if (detail?.id === id) await loadDetail(id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleApprove(id: string) {
		try {
			await td.approve({ id });
			await load();
			if (detail?.id === id) await loadDetail(id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleReject(id: string) {
		try {
			await td.reject({ id });
			await load();
			if (detail?.id === id) await loadDetail(id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleLog() {
		if (!logModal || !logMessage) return;
		try {
			await td.log({ id: logModal, message: logMessage, type: logType });
			logMessage = '';
			logModal = null;
			if (detail) await loadDetail(detail.id);
		} catch (e) {
			error = String(e);
		}
	}

	async function handleDelete(id: string) {
		try {
			await td.delete(id);
			deleteConfirm = null;
			if (detail?.id === id) detail = null;
			await load();
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		filter;
		load();
	});

	const statusColors: Record<string, string> = {
		open: 'text-blue-400',
		in_progress: 'text-yellow-400',
		'in-progress': 'text-yellow-400',
		in_review: 'text-purple-400',
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

	const logTypeIcons: Record<string, string> = {
		progress: '📝', blocker: '🚧', decision: '🔀', hypothesis: '🔬', tried: '🧪', result: '📊'
	};
</script>

<div class="max-w-5xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Tasks</h1>
		<div class="flex gap-2">
			<button onclick={load} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
			<button
				onclick={() => { showCreate = !showCreate; detail = null; }}
				class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
			>
				+ New issue
			</button>
		</div>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Filters -->
	<div class="mt-6 flex gap-2">
		{#each ['all', 'open', 'in-progress', 'review', 'done', 'closed'] as s}
			<button
				onclick={() => { filter = s; detail = null; }}
				class="rounded-lg px-3 py-1.5 text-xs transition {filter === s ? 'bg-teal-500/10 text-teal-300' : 'text-gray-500 hover:text-gray-300'}"
			>
				{s}
			</button>
		{/each}
	</div>

	<!-- Create form -->
	{#if showCreate}
		<div class="mt-4 rounded-xl border border-teal-500/20 bg-[#12121e] p-5">
			<h2 class="mb-4 font-semibold">New issue</h2>
			<div class="space-y-3">
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="td-title">Title</label>
					<input
						id="td-title"
						bind:value={createForm.title}
						placeholder="Issue title"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					/>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="td-type">Type</label>
						<select
							id="td-type"
							bind:value={createForm.type}
							class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
						>
							<option value="task">Task</option>
							<option value="bug">Bug</option>
							<option value="feature">Feature</option>
							<option value="epic">Epic</option>
							<option value="chore">Chore</option>
						</select>
					</div>
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="td-priority">Priority</label>
						<select
							id="td-priority"
							bind:value={createForm.priority}
							class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
						>
							<option value="P0">P0 — Critical</option>
							<option value="P1">P1 — High</option>
							<option value="P2">P2 — Medium</option>
							<option value="P3">P3 — Low</option>
						</select>
					</div>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="td-desc">Description</label>
					<textarea
						id="td-desc"
						bind:value={createForm.description}
						rows="3"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					></textarea>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="td-labels">Labels (comma-separated)</label>
					<input
						id="td-labels"
						bind:value={createForm.labels}
						placeholder="admin, ui, bug"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					/>
				</div>
				<div class="flex justify-between pt-2">
					<button onclick={() => showCreate = false} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<button
						onclick={handleCreate}
						class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
					>
						Create issue
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Layout: list + detail -->
	<div class="mt-4 grid gap-4 {detail ? 'lg:grid-cols-[1fr_1fr]' : ''}">
		<!-- Issue list -->
		<div class="space-y-2">
			{#each issues as issue}
				<button
					onclick={() => loadDetail(issue.id)}
					class="w-full rounded-xl border bg-[#12121e] p-4 text-left transition {detail?.id === issue.id ? 'border-teal-500/30' : 'border-white/5 hover:border-white/10'}"
				>
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<div class="flex items-center gap-2">
								<span class="font-mono text-xs text-gray-500">{issue.id}</span>
								<span class="text-xs {priorityColors[issue.priority] ?? 'text-gray-500'}">{issue.priority}</span>
								<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{issue.type}</span>
							</div>
							<h3 class="mt-1 text-sm font-medium">{issue.title}</h3>
							{#if issue.log_count}
								<span class="mt-1 inline-block text-xs text-gray-500">📝 {issue.log_count} logs</span>
							{/if}
							{#if issue.has_handoff}
								<span class="mt-1 ml-2 inline-block text-xs text-teal-400">🤝 Handoff</span>
							{/if}
						</div>
						<span class="shrink-0 text-xs {statusColors[issue.status] ?? 'text-gray-500'}">{issue.status}</span>
					</div>
				</button>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
					No tasks found
				</div>
			{/each}
		</div>

		<!-- Detail panel -->
		{#if detail}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="flex items-start justify-between">
					<div>
						<div class="flex items-center gap-2">
							<span class="font-mono text-xs text-gray-500">{detail.id}</span>
							<span class="text-xs {priorityColors[detail.priority] ?? 'text-gray-500'}">{detail.priority}</span>
							<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{detail.type}</span>
						</div>
						<h2 class="mt-2 text-lg font-bold">{detail.title}</h2>
						<span class="mt-1 inline-block text-xs {statusColors[detail.status] ?? 'text-gray-500'}">{detail.status}</span>
					</div>
					<button onclick={() => detail = null} class="text-gray-500 hover:text-gray-300">✕</button>
				</div>

				{#if detail.description}
					<p class="mt-3 text-sm text-gray-400">{detail.description}</p>
				{/if}

				{#if detail.labels?.length}
					<div class="mt-3 flex flex-wrap gap-1.5">
						{#each detail.labels as label}
							<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{label}</span>
						{/each}
					</div>
				{/if}

				<!-- Actions -->
				<div class="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
					{#if detail.status === 'open'}
						<button onclick={() => handleStatusChange(detail!.id, 'in_progress')} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-yellow-400">▶ Start</button>
					{/if}
					{#if detail.status === 'in_progress' || detail.status === 'in-progress'}
						<button onclick={() => handleReview(detail!.id)} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-purple-400">📋 Review</button>
					{/if}
					{#if detail.status === 'in_review' || detail.status === 'review'}
						<button onclick={() => handleApprove(detail!.id)} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-green-400">✓ Approve</button>
						<button onclick={() => handleReject(detail!.id)} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400">✗ Reject</button>
					{/if}
					<button onclick={() => { logModal = detail!.id; logMessage = ''; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300">📝 Log</button>
					{#if deleteConfirm === detail.id}
						<button onclick={() => handleDelete(detail!.id)} class="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400">Confirm delete</button>
						<button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button>
					{:else}
						<button onclick={() => deleteConfirm = detail!.id} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400">🗑 Delete</button>
					{/if}
				</div>

				<!-- Handoff -->
				{#if detail.handoff && (detail.handoff.done?.length || detail.handoff.remaining?.length || detail.handoff.decisions?.length || detail.handoff.uncertain?.length)}
					<div class="mt-4 border-t border-white/5 pt-4">
						<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">🤝 Handoff</h3>
						{#if detail.handoff.done?.length}
							<div class="mb-2">
								<span class="text-xs font-medium text-green-400">Done:</span>
								<ul class="mt-1 space-y-0.5">
									{#each detail.handoff.done as item}
										<li class="text-xs text-gray-400">✓ {item}</li>
									{/each}
								</ul>
							</div>
						{/if}
						{#if detail.handoff.remaining?.length}
							<div class="mb-2">
								<span class="text-xs font-medium text-yellow-400">Remaining:</span>
								<ul class="mt-1 space-y-0.5">
									{#each detail.handoff.remaining as item}
										<li class="text-xs text-gray-400">○ {item}</li>
									{/each}
								</ul>
							</div>
						{/if}
						{#if detail.handoff.decisions?.length}
							<div class="mb-2">
								<span class="text-xs font-medium text-blue-400">Decisions:</span>
								<ul class="mt-1 space-y-0.5">
									{#each detail.handoff.decisions as item}
										<li class="text-xs text-gray-400">→ {item}</li>
									{/each}
								</ul>
							</div>
						{/if}
						{#if detail.handoff.uncertain?.length}
							<div class="mb-2">
								<span class="text-xs font-medium text-red-400">Uncertain:</span>
								<ul class="mt-1 space-y-0.5">
									{#each detail.handoff.uncertain as item}
										<li class="text-xs text-gray-400">? {item}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Logs -->
				{#if detail.logs?.length}
					<div class="mt-4 border-t border-white/5 pt-4">
						<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Activity Log</h3>
						<div class="space-y-2">
							{#each detail.logs as log}
								<div class="rounded-lg bg-white/[0.03] p-3">
									<div class="flex items-center gap-2">
										<span class="text-sm">{logTypeIcons[log.type] ?? '📝'}</span>
										<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{log.type}</span>
										<span class="ml-auto text-xs text-gray-600">{new Date(log.timestamp).toLocaleString()}</span>
									</div>
									<p class="mt-1 text-xs text-gray-400">{log.message}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Log modal -->
{#if logModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onclick={() => logModal = null}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] p-6" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-4 font-semibold">Add log entry</h2>
			<div class="space-y-3">
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="log-type">Type</label>
					<select
						id="log-type"
						bind:value={logType}
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					>
						<option value="progress">Progress</option>
						<option value="blocker">Blocker</option>
						<option value="decision">Decision</option>
						<option value="hypothesis">Hypothesis</option>
						<option value="tried">Tried</option>
						<option value="result">Result</option>
					</select>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="log-msg">Message</label>
					<textarea
						id="log-msg"
						bind:value={logMessage}
						rows="3"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					></textarea>
				</div>
				<div class="flex justify-between">
					<button onclick={() => logModal = null} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<button onclick={handleLog} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">Add log</button>
				</div>
			</div>
		</div>
	</div>
{/if}
