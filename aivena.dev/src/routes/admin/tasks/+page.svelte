<script lang="ts">
	import { td, type TdIssue, type TdIssueDetail, type TdTree, type TdTreeNode, type TdTreeEdge } from '$lib/admin/api';

	// ── State ──────────────────────────────────────────────
	let issues = $state<TdIssue[]>([]);
	let error = $state('');
	let currentView = $state<'board' | 'table' | 'tree'>('board');

	// Filters
	let filterType = $state('');
	let filterPriority = $state('');
	let filterImplementer = $state('');
	let showClosed = $state(false);
	let searchQuery = $state('');

	// Cross-project
	let crossProjectEnabled = $state(false);
	let globalMode = $state(false);
	let globalProjects = $state<string[]>([]);
	let filterProject = $state('');

	// Detail
	let detail = $state<TdIssueDetail | null>(null);
	let showDetail = $state(false);
	let detailReadOnly = $state(false);

	// Create modal
	let showCreate = $state(false);
	let createForm = $state({ title: '', type: 'task', priority: 'P2', description: '', labels: '', parent: '' });

	// Activity log
	let showAddLog = $state(false);
	let logMessage = $state('');
	let logType = $state('progress');

	// Review form
	let reviewMessage = $state('');

	// Delete confirm
	let deleteConfirm = $state(false);

	// Table sorting & pagination
	let sortColumn = $state('updated_at');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let currentPage = $state(1);
	let pageSize = $state(25);

	// Tree
	let treeData = $state<TdTree | null>(null);
	let treeCollapsed = $state<Record<string, boolean>>({});

	// ── Constants ──────────────────────────────────────────
	const BOARD_COLUMNS = ['open', 'in_progress', 'in_review', 'blocked', 'closed'] as const;
	const COLUMN_LABELS: Record<string, string> = { open: 'Open', in_progress: 'In Progress', in_review: 'In Review', blocked: 'Blocked', closed: 'Closed' };
	const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
	const STATUS_ORDER: Record<string, number> = { open: 0, in_progress: 1, in_review: 2, blocked: 3, closed: 4 };

	const statusColors: Record<string, string> = {
		open: 'bg-blue-400/15 text-blue-400',
		in_progress: 'bg-yellow-400/15 text-yellow-400',
		in_review: 'bg-purple-400/15 text-purple-400',
		blocked: 'bg-red-400/15 text-red-400',
		closed: 'bg-green-400/15 text-green-400'
	};
	const priorityColors: Record<string, string> = {
		P0: 'text-red-400', P1: 'text-yellow-400', P2: 'text-blue-400', P3: 'text-gray-400', P4: 'text-gray-500'
	};
	const typeColors: Record<string, string> = {
		bug: 'bg-red-400/10 text-red-400', feature: 'bg-blue-400/10 text-blue-400',
		epic: 'bg-purple-400/10 text-purple-400', task: 'bg-gray-400/10 text-gray-400',
		chore: 'bg-gray-400/10 text-gray-400'
	};
	const logTypeColors: Record<string, string> = {
		progress: 'bg-green-900/50 text-green-400', blocker: 'bg-red-900/50 text-red-400',
		decision: 'bg-blue-900/50 text-blue-400', hypothesis: 'bg-orange-900/50 text-orange-400',
		tried: 'bg-purple-900/50 text-purple-400', result: 'bg-teal-900/50 text-teal-400',
		security: 'bg-pink-900/50 text-pink-400'
	};

	// ── Helpers ────────────────────────────────────────────
	function ago(iso: string | undefined): string {
		if (!iso) return '—';
		const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
		if (s < 60) return s + 's ago';
		if (s < 3600) return Math.floor(s / 60) + 'm ago';
		if (s < 86400) return Math.floor(s / 3600) + 'h ago';
		return Math.floor(s / 86400) + 'd ago';
	}

	// ── Data loading ──────────────────────────────────────
	async function fetchConfig() {
		try {
			const config = await td.config();
			crossProjectEnabled = !!config.crossProjectEnabled;
		} catch { crossProjectEnabled = false; }
	}

	async function load() {
		try {
			const params: Record<string, unknown> = {};
			if (filterType) params.type = filterType;
			if (filterPriority) params.priority = filterPriority;
			if (showClosed) params.all = true;
			if (filterImplementer) params.implementer = filterImplementer;

			if (globalMode && crossProjectEnabled) {
				const data = await td.global({ ...params, project: filterProject || undefined } as any);
				issues = data.issues ?? [];
				globalProjects = data.projects ?? [];
			} else {
				issues = await td.issues(params as any);
				globalProjects = [];
			}
			error = '';
		} catch (e) {
			error = String(e);
			issues = [];
		}
	}

	async function loadTree() {
		try {
			treeData = await td.tree();
		} catch { treeData = { nodes: [], edges: [] }; }
	}

	async function loadDetail(id: string, readOnly = false) {
		try {
			detail = await td.detail(id);
			detailReadOnly = readOnly;
			showDetail = true;
			showAddLog = false;
			deleteConfirm = false;
			reviewMessage = '';
			// Load tree data for dependencies
			if (!treeData) await loadTree();
		} catch (e) {
			error = String(e);
		}
	}

	async function reload() {
		await load();
		if (currentView === 'tree') await loadTree();
	}

	// ── Filtered & sorted data ────────────────────────────
	function getFilteredIssues(): TdIssue[] {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return issues;
		return issues.filter(i =>
			i.title.toLowerCase().includes(q) ||
			i.id.toLowerCase().includes(q) ||
			(i.implementer_session ?? '').toLowerCase().includes(q) ||
			(i.project ?? '').toLowerCase().includes(q) ||
			(i.labels ?? []).some(l => l.toLowerCase().includes(q))
		);
	}

	function getSortedIssues(items: TdIssue[]): TdIssue[] {
		return [...items].sort((a, b) => {
			let va: number | string, vb: number | string;
			if (sortColumn === 'priority') {
				va = PRIORITY_ORDER[a.priority] ?? 9;
				vb = PRIORITY_ORDER[b.priority] ?? 9;
			} else if (sortColumn === 'status') {
				va = STATUS_ORDER[a.status] ?? 9;
				vb = STATUS_ORDER[b.status] ?? 9;
			} else if (sortColumn === 'updated_at') {
				va = a.updated_at ?? '';
				vb = b.updated_at ?? '';
			} else {
				va = ((a as any)[sortColumn] ?? '').toString().toLowerCase();
				vb = ((b as any)[sortColumn] ?? '').toString().toLowerCase();
			}
			const cmp = va < vb ? -1 : va > vb ? 1 : 0;
			return sortDirection === 'asc' ? cmp : -cmp;
		});
	}

	function getImplementers(): string[] {
		const set = new Set<string>();
		issues.forEach(i => { if (i.implementer_session) set.add(i.implementer_session); });
		return [...set].sort();
	}

	// ── Actions ───────────────────────────────────────────
	async function handleCreate() {
		if (!createForm.title.trim()) return;
		try {
			const data: Record<string, string> = { title: createForm.title };
			if (createForm.type) data.type = createForm.type;
			if (createForm.priority) data.priority = createForm.priority;
			if (createForm.description) data.description = createForm.description;
			if (createForm.labels) data.labels = createForm.labels;
			if (createForm.parent) data.parent = createForm.parent;
			await td.create(data);
			showCreate = false;
			createForm = { title: '', type: 'task', priority: 'P2', description: '', labels: '', parent: '' };
			await reload();
		} catch (e) { error = String(e); }
	}

	async function updateStatus(id: string, status: string) {
		try {
			await td.update({ id, status });
			showDetail = false;
			await reload();
		} catch (e) { error = String(e); }
	}

	async function submitReview(id: string) {
		try {
			await td.review({ id, message: reviewMessage || undefined });
			showDetail = false;
			await reload();
		} catch (e) { error = String(e); }
	}

	async function approveIssue(id: string) {
		try {
			await td.approve({ id });
			showDetail = false;
			await reload();
		} catch (e) { error = String(e); }
	}

	async function rejectIssue(id: string) {
		const reason = prompt('Rejection reason:');
		if (!reason) return;
		try {
			await td.reject({ id, reason });
			showDetail = false;
			await reload();
		} catch (e) { error = String(e); }
	}

	async function submitLog(id: string) {
		if (!logMessage.trim()) return;
		try {
			await td.log({ id, message: logMessage, type: logType });
			logMessage = '';
			showAddLog = false;
			detail = await td.detail(id);
		} catch (e) { error = String(e); }
	}

	async function deleteIssue(id: string) {
		try {
			await td.delete(id);
			showDetail = false;
			deleteConfirm = false;
			await reload();
		} catch (e) { error = String(e); }
	}

	function handleSort(col: string) {
		if (sortColumn === col) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = col;
			sortDirection = col === 'updated_at' ? 'desc' : 'asc';
		}
		currentPage = 1;
	}

	// ── Tree helpers ──────────────────────────────────────
	function getTreeDeps(issueId: string): { upstream: { node: TdTreeNode; type: string }[]; downstream: { node: TdTreeNode; type: string }[] } {
		if (!treeData) return { upstream: [], downstream: [] };
		const nodeMap = new Map(treeData.nodes.map(n => [n.id, n]));
		const upstream: { node: TdTreeNode; type: string }[] = [];
		const downstream: { node: TdTreeNode; type: string }[] = [];
		for (const e of treeData.edges) {
			if (e.target === issueId && nodeMap.has(e.source)) upstream.push({ node: nodeMap.get(e.source)!, type: e.type });
			if (e.source === issueId && nodeMap.has(e.target)) downstream.push({ node: nodeMap.get(e.target)!, type: e.type });
		}
		return { upstream, downstream };
	}

	type TreeRenderNode = { id: string; node: TdTreeNode; edgeType: string | null; children: TreeRenderNode[]; isRef: boolean };

	function buildTreeRoots(): TreeRenderNode[] {
		if (!treeData || !treeData.nodes.length) return [];
		const nodeMap = new Map(treeData.nodes.map(n => [n.id, n]));
		const q = searchQuery.toLowerCase().trim();
		const typeF = filterType;
		const prioF = filterPriority;

		// Filter visible nodes
		const visibleIds = new Set<string>();
		for (const n of treeData.nodes) {
			if (!showClosed && n.status === 'closed') continue;
			if (typeF && n.type !== typeF) continue;
			if (prioF && n.priority !== prioF) continue;
			if (q && !n.title.toLowerCase().includes(q) && !n.id.toLowerCase().includes(q) && !(n.labels ?? []).some(l => l.toLowerCase().includes(q))) continue;
			visibleIds.add(n.id);
		}
		// Include ancestors
		let added = true;
		while (added) {
			added = false;
			for (const e of treeData.edges) {
				if (visibleIds.has(e.target) && !visibleIds.has(e.source) && nodeMap.has(e.source)) {
					if (showClosed || nodeMap.get(e.source)!.status !== 'closed') {
						visibleIds.add(e.source);
						added = true;
					}
				}
			}
		}
		// Build children map
		const childrenOf = new Map<string, { id: string; type: string }[]>();
		const hasParent = new Set<string>();
		for (const e of treeData.edges) {
			if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) continue;
			if (!childrenOf.has(e.source)) childrenOf.set(e.source, []);
			childrenOf.get(e.source)!.push({ id: e.target, type: e.type });
			hasParent.add(e.target);
		}
		// Find roots
		const rootIds = [...visibleIds].filter(id => !hasParent.has(id)).sort((a, b) => {
			const na = nodeMap.get(a)!, nb = nodeMap.get(b)!;
			const pa = PRIORITY_ORDER[na.priority] ?? 9, pb = PRIORITY_ORDER[nb.priority] ?? 9;
			return pa !== pb ? pa - pb : na.title.localeCompare(nb.title);
		});
		// Build tree
		const rendered = new Set<string>();
		function buildNode(id: string, edgeType: string | null): TreeRenderNode | null {
			const node = nodeMap.get(id);
			if (!node) return null;
			if (rendered.has(id)) return { id, node, edgeType, children: [], isRef: true };
			rendered.add(id);
			const kids = (childrenOf.get(id) ?? []).map(c => buildNode(c.id, c.type)).filter(Boolean) as TreeRenderNode[];
			return { id, node, edgeType, children: kids, isRef: false };
		}
		return rootIds.map(id => buildNode(id, null)).filter(Boolean) as TreeRenderNode[];
	}

	// ── Lifecycle ─────────────────────────────────────────
	$effect(() => {
		fetchConfig();
		load();
	});

	// Reload on filter changes
	$effect(() => {
		// Access reactive vars to trigger
		filterType; filterPriority; showClosed; filterImplementer; globalMode; filterProject;
		load();
	});
</script>

<div class="max-w-[1400px]">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">📋 Tasks</h1>
		<button onclick={() => { showCreate = true; showDetail = false; }} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ New Issue</button>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Toolbar -->
	<div class="mt-4 flex flex-wrap items-center gap-2">
		<!-- View toggle -->
		<div class="flex rounded-lg bg-[#12121e] p-0.5">
			{#each ['board', 'table', 'tree'] as v}
				<button
					onclick={() => { currentView = v as any; if (v === 'tree' && !treeData) loadTree(); }}
					class="rounded-md px-3 py-1.5 text-xs font-medium transition {currentView === v ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-gray-200'}"
				>{v.charAt(0).toUpperCase() + v.slice(1)}</button>
			{/each}
		</div>

		<select bind:value={filterType} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-200">
			<option value="">All types</option>
			{#each ['task', 'bug', 'feature', 'epic', 'chore'] as t}<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>{/each}
		</select>

		<select bind:value={filterPriority} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-200">
			<option value="">All priorities</option>
			{#each ['P0', 'P1', 'P2', 'P3', 'P4'] as p}<option value={p}>{p}</option>{/each}
		</select>

		{#if getImplementers().length > 0}
			<select bind:value={filterImplementer} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-200">
				<option value="">All implementers</option>
				{#each getImplementers() as impl}<option value={impl}>{impl}</option>{/each}
			</select>
		{/if}

		<label class="flex items-center gap-1.5 text-xs text-gray-400">
			<input type="checkbox" bind:checked={showClosed} class="rounded border-white/10"> Closed
		</label>

		{#if crossProjectEnabled}
			<label class="flex items-center gap-1.5 text-xs text-gray-400">
				<input type="checkbox" bind:checked={globalMode}> All Projects
			</label>
			{#if globalMode && globalProjects.length > 0}
				<select bind:value={filterProject} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-200">
					<option value="">All projects</option>
					{#each globalProjects as p}<option value={p}>{p}</option>{/each}
				</select>
			{/if}
		{/if}

		<input type="text" bind:value={searchQuery} placeholder="Search..." class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-teal-500/50 w-48" />

		<button onclick={reload} class="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
	</div>

	<!-- Board View -->
	{#if currentView === 'board'}
		{@const filtered = getFilteredIssues()}
		{@const columns = showClosed ? BOARD_COLUMNS : BOARD_COLUMNS.filter(c => c !== 'closed')}
		<div class="mt-4 grid gap-3" style="grid-template-columns: repeat({columns.length}, minmax(200px, 1fr));">
			{#each columns as status}
				{@const colItems = filtered.filter(i => i.status === status)}
				<div class="rounded-xl bg-[#12121e] p-3 min-h-[120px]">
					<div class="flex items-center justify-between mb-2">
						<span class="text-xs font-bold uppercase tracking-wider text-gray-500">{COLUMN_LABELS[status]}</span>
						<span class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-400">{colItems.length}</span>
					</div>
					{#each colItems as issue}
						<button onclick={() => loadDetail(issue.id, globalMode && !!issue.project)} class="w-full text-left mb-2 rounded-lg border border-white/5 bg-[#0a0a0f] p-3 transition hover:border-teal-500/30">
							<div class="text-sm font-medium mb-1.5 leading-tight">{issue.title}</div>
							<div class="flex flex-wrap gap-1.5 items-center">
								<span class="font-mono text-[10px] text-gray-500">{issue.id}</span>
								<span class="text-[11px] font-bold {priorityColors[issue.priority] ?? 'text-gray-500'}">{issue.priority}</span>
								<span class="rounded px-1.5 py-0.5 text-[10px] {typeColors[issue.type] ?? 'bg-gray-400/10 text-gray-400'}">{issue.type}</span>
								{#each issue.labels ?? [] as label}
									<span class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">{label}</span>
								{/each}
								{#if issue.implementer_session}
									<span class="rounded bg-teal-400/10 px-1.5 py-0.5 text-[10px] text-teal-300 font-mono">👤 {issue.implementer_session}</span>
								{/if}
								{#if globalMode && issue.project}
									<span class="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">📂 {issue.project}</span>
								{/if}
								{#if issue.log_count}
									<span class="rounded bg-green-400/10 px-1.5 py-0.5 text-[10px] text-green-400">📝 {issue.log_count}</span>
								{/if}
								{#if issue.has_handoff}
									<span class="rounded bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-400">🤝</span>
								{/if}
							</div>
							{#if issue.last_log}
								<div class="mt-1.5 text-[11px] text-gray-500 truncate">{issue.last_log.message.substring(0, 80)}{issue.last_log.message.length > 80 ? '…' : ''}</div>
							{/if}
						</button>
					{:else}
						<div class="text-center py-5 text-xs text-gray-500">—</div>
					{/each}
				</div>
			{/each}
		</div>
		{#if filtered.length === 0}
			<div class="mt-8 text-center text-sm text-gray-500">No issues found. Create one with the + button above.</div>
		{/if}

	<!-- Table View -->
	{:else if currentView === 'table'}
		{@const filtered = getFilteredIssues()}
		{@const sorted = getSortedIssues(filtered)}
		{@const totalPages = Math.ceil(sorted.length / pageSize)}
		{@const pageItems = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
		<div class="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-[#12121e]">
			<table class="w-full border-collapse">
				<thead>
					<tr>
						{#if globalMode}<th class="cursor-pointer px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5 hover:text-gray-300" onclick={() => handleSort('project')}>Project {sortColumn === 'project' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}</th>{/if}
						{#each [['id', 'ID'], ['priority', 'Priority'], ['type', 'Type'], ['title', 'Title'], ['status', 'Status']] as [col, label]}
							<th class="cursor-pointer px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5 hover:text-gray-300 whitespace-nowrap" onclick={() => handleSort(col)}>
								{label} {#if sortColumn === col}<span class="text-teal-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
							</th>
						{/each}
						<th class="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5">Labels</th>
						<th class="cursor-pointer px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5 hover:text-gray-300 whitespace-nowrap" onclick={() => handleSort('implementer_session')}>
							Implementer {#if sortColumn === 'implementer_session'}<span class="text-teal-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
						</th>
						<th class="px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5">Activity</th>
						<th class="cursor-pointer px-3 py-2 text-left text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/5 hover:text-gray-300 whitespace-nowrap" onclick={() => handleSort('updated_at')}>
							Updated {#if sortColumn === 'updated_at'}<span class="text-teal-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>{/if}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each pageItems as issue}
						<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]">
							{#if globalMode}<td class="px-3 py-2"><span class="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">{issue.project ?? ''}</span></td>{/if}
							<td class="px-3 py-2"><button onclick={() => loadDetail(issue.id)} class="font-mono text-[11px] text-teal-300 hover:underline">{issue.id}</button></td>
							<td class="px-3 py-2"><span class="text-[11px] font-bold {priorityColors[issue.priority] ?? ''}">{issue.priority}</span></td>
							<td class="px-3 py-2"><span class="rounded px-1.5 py-0.5 text-[10px] {typeColors[issue.type] ?? 'bg-gray-400/10 text-gray-400'}">{issue.type}</span></td>
							<td class="px-3 py-2 text-sm font-medium">{issue.title}</td>
							<td class="px-3 py-2"><span class="rounded px-2 py-0.5 text-[11px] font-semibold {statusColors[issue.status] ?? ''}">{COLUMN_LABELS[issue.status] ?? issue.status}</span></td>
							<td class="px-3 py-2">{#each issue.labels ?? [] as l}<span class="mr-1 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">{l}</span>{/each}</td>
							<td class="px-3 py-2">{#if issue.implementer_session}<span class="rounded bg-teal-400/10 px-1.5 py-0.5 text-[10px] text-teal-300 font-mono">{issue.implementer_session}</span>{:else}<span class="text-gray-500">—</span>{/if}</td>
							<td class="px-3 py-2">
								{#if issue.log_count}<span class="rounded bg-green-400/10 px-1.5 py-0.5 text-[10px] text-green-400">📝 {issue.log_count}</span>{/if}
								{#if issue.has_handoff}<span class="rounded bg-blue-400/10 px-1.5 py-0.5 text-[10px] text-blue-400">🤝</span>{/if}
								{#if !issue.log_count && !issue.has_handoff}<span class="text-gray-500">—</span>{/if}
							</td>
							<td class="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{ago(issue.updated_at)}</td>
						</tr>
					{:else}
						<tr><td colspan="99" class="px-3 py-8 text-center text-sm text-gray-500">No issues found</td></tr>
					{/each}
				</tbody>
			</table>
			{#if sorted.length > pageSize}
				<div class="flex items-center justify-between border-t border-white/5 px-4 py-3">
					<span class="text-xs text-gray-500">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} of {sorted.length}</span>
					<div class="flex gap-1">
						<button disabled={currentPage <= 1} onclick={() => currentPage = 1} class="rounded px-2 py-1 text-xs border border-white/10 bg-[#12121e] text-gray-400 disabled:opacity-30">«</button>
						<button disabled={currentPage <= 1} onclick={() => currentPage--} class="rounded px-2 py-1 text-xs border border-white/10 bg-[#12121e] text-gray-400 disabled:opacity-30">‹</button>
						{#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i).filter(p => p <= totalPages) as p}
							<button onclick={() => currentPage = p} class="rounded px-2.5 py-1 text-xs border {p === currentPage ? 'bg-teal-600 border-teal-600 text-white' : 'border-white/10 bg-[#12121e] text-gray-400'}">{p}</button>
						{/each}
						<button disabled={currentPage >= totalPages} onclick={() => currentPage++} class="rounded px-2 py-1 text-xs border border-white/10 bg-[#12121e] text-gray-400 disabled:opacity-30">›</button>
						<button disabled={currentPage >= totalPages} onclick={() => currentPage = totalPages} class="rounded px-2 py-1 text-xs border border-white/10 bg-[#12121e] text-gray-400 disabled:opacity-30">»</button>
					</div>
					<select bind:value={pageSize} onchange={() => currentPage = 1} class="rounded border border-white/10 bg-[#12121e] px-2 py-1 text-xs text-gray-400">
						{#each [10, 25, 50, 100] as s}<option value={s}>{s} / page</option>{/each}
					</select>
				</div>
			{/if}
		</div>

	<!-- Tree View -->
	{:else if currentView === 'tree'}
		{@const roots = buildTreeRoots()}
		<div class="mt-4">
			{#if roots.length > 0}
				{@const totalVisible = treeData ? treeData.nodes.filter(n => showClosed || n.status !== 'closed').length : 0}
				{@const depEdges = treeData ? treeData.edges.filter(e => e.type === 'depends_on').length : 0}
				<div class="flex gap-4 text-xs text-gray-500 border-b border-white/5 pb-2 mb-3">
					<span>🌳 {roots.length} root{roots.length !== 1 ? 's' : ''}</span>
					<span>📋 {totalVisible} issues</span>
					<span>🔗 {depEdges} dependenc{depEdges !== 1 ? 'ies' : 'y'}</span>
				</div>
				{#snippet treeNode(node: TreeRenderNode, depth: number)}
					{#if node.isRef}
						<button onclick={() => loadDetail(node.id)} class="ml-{depth > 0 ? 7 : 0} flex items-center gap-2 py-1 px-2 text-xs text-gray-500 italic hover:bg-white/5 rounded">
							<span class="text-teal-400">↗</span>
							<span class="font-mono text-[10px] text-gray-500">{node.id}</span>
							{node.node.title.length > 50 ? node.node.title.substring(0, 50) + '…' : node.node.title}
						</button>
					{:else}
						<div>
							<button onclick={() => loadDetail(node.id)} class="w-full flex items-center gap-1.5 py-1.5 px-2 text-left rounded hover:bg-white/5 transition">
								{#if node.children.length > 0}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<span class="w-4 text-center text-[10px] text-gray-500 cursor-pointer shrink-0" onclick={(e) => { e.stopPropagation(); treeCollapsed[node.id] = !treeCollapsed[node.id]; }}>{treeCollapsed[node.id] ? '▶' : '▼'}</span>
								{:else}
									<span class="w-4 shrink-0"></span>
								{/if}
								<span class="font-mono text-[10px] text-gray-500 shrink-0">{node.id}</span>
								<span class="text-[11px] font-bold {priorityColors[node.node.priority] ?? ''} shrink-0">{node.node.priority}</span>
								<span class="rounded px-1.5 py-0.5 text-[10px] {statusColors[node.node.status] ?? ''} shrink-0">{COLUMN_LABELS[node.node.status] ?? node.node.status}</span>
								{#if node.edgeType}
									<span class="rounded px-1.5 py-0.5 text-[9px] {node.edgeType === 'depends_on' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-purple-400/10 text-purple-400'} shrink-0">{node.edgeType === 'depends_on' ? 'dep' : 'child'}</span>
								{/if}
								<span class="text-sm font-medium truncate">{node.node.title}</span>
								{#each node.node.labels ?? [] as l}
									<span class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-400 shrink-0">{l}</span>
								{/each}
								{#if node.node.implementer_session}
									<span class="rounded bg-teal-400/10 px-1.5 py-0.5 text-[10px] text-teal-300 font-mono shrink-0">👤 {node.node.implementer_session}</span>
								{/if}
							</button>
							{#if node.children.length > 0 && !treeCollapsed[node.id]}
								<div class="ml-4 border-l border-white/10 pl-2">
									{#each node.children as child}
										{@render treeNode(child, depth + 1)}
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/snippet}
				{#each roots as root}
					{@render treeNode(root, 0)}
				{/each}
			{:else}
				<div class="mt-8 text-center text-sm text-gray-500">
					{#if !treeData}Loading tree...{:else}No issues with relationships found{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Detail Modal -->
{#if showDetail && detail}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[60px]" onclick={() => showDetail = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<h3 class="text-lg font-bold">{detail.title}</h3>
			{#if detail.project}<div class="-mt-1 mb-2"><span class="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] text-yellow-400 font-semibold">📂 {detail.project}</span></div>{/if}
			<div class="flex flex-wrap gap-2 items-center mt-1 mb-4">
				<span class="font-mono text-[10px] text-gray-500">{detail.id}</span>
				<span class="rounded px-2 py-0.5 text-[11px] font-semibold {statusColors[detail.status] ?? ''}">{COLUMN_LABELS[detail.status] ?? detail.status}</span>
				<span class="text-[11px] font-bold {priorityColors[detail.priority] ?? ''}">{detail.priority}</span>
				<span class="rounded px-1.5 py-0.5 text-[10px] {typeColors[detail.type] ?? 'bg-gray-400/10 text-gray-400'}">{detail.type}</span>
				{#if detail.implementer_session}
					<span class="rounded bg-teal-400/10 px-1.5 py-0.5 text-[10px] text-teal-300 font-mono">👤 {detail.implementer_session}</span>
				{/if}
				{#if detail.points}
					<span class="text-[11px] text-gray-500">{detail.points} pts</span>
				{/if}
			</div>

			<!-- Description -->
			{#if detail.description}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Description</h4>
					<pre class="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed bg-[#12121e] rounded-lg p-3 overflow-x-auto">{detail.description}</pre>
				</div>
			{/if}

			<!-- Acceptance Criteria -->
			{#if detail.acceptance}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Acceptance Criteria</h4>
					<pre class="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed bg-[#12121e] rounded-lg p-3 overflow-x-auto">{detail.acceptance}</pre>
				</div>
			{/if}

			<!-- Dependencies -->
			{#if getTreeDeps(detail.id).upstream.length > 0 || getTreeDeps(detail.id).downstream.length > 0}
				{@const deps = getTreeDeps(detail.id)}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">🔗 Dependencies</h4>
					<div class="flex gap-4 flex-wrap">
						{#if deps.upstream.length > 0}
							<div class="flex-1 min-w-[200px]">
								<h5 class="text-[11px] uppercase text-gray-500 mb-1">⬆ Depends on ({deps.upstream.length})</h5>
								{#each deps.upstream as d}
									<button onclick={() => loadDetail(d.node.id)} class="w-full flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 text-xs text-left">
										<span class="font-mono text-[10px] text-gray-500">{d.node.id}</span>
										<span class="text-[11px] font-bold {priorityColors[d.node.priority] ?? ''}">{d.node.priority}</span>
										<span class="rounded px-1.5 py-0.5 text-[10px] {statusColors[d.node.status] ?? ''}">{COLUMN_LABELS[d.node.status] ?? d.node.status}</span>
										<span class="truncate">{d.node.title}</span>
									</button>
								{/each}
							</div>
						{/if}
						{#if deps.downstream.length > 0}
							<div class="flex-1 min-w-[200px]">
								<h5 class="text-[11px] uppercase text-gray-500 mb-1">⬇ Depended on by ({deps.downstream.length})</h5>
								{#each deps.downstream as d}
									<button onclick={() => loadDetail(d.node.id)} class="w-full flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 text-xs text-left">
										<span class="font-mono text-[10px] text-gray-500">{d.node.id}</span>
										<span class="text-[11px] font-bold {priorityColors[d.node.priority] ?? ''}">{d.node.priority}</span>
										<span class="rounded px-1.5 py-0.5 text-[10px] {statusColors[d.node.status] ?? ''}">{COLUMN_LABELS[d.node.status] ?? d.node.status}</span>
										<span class="truncate">{d.node.title}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Handoff -->
			{#if detail.handoff && (detail.handoff.done?.length || detail.handoff.remaining?.length || detail.handoff.decisions?.length || detail.handoff.uncertain?.length)}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">🤝 Handoff</h4>
					{#if detail.handoff.session}
						<span class="text-[11px] text-gray-500">Session: {detail.handoff.session}{detail.handoff.timestamp ? ' · ' + ago(detail.handoff.timestamp) : ''}</span>
					{/if}
					{#if detail.handoff.done?.length}
						<div class="mt-2">
							<strong class="text-[11px] font-bold uppercase tracking-wider text-green-400">✓ Done</strong>
							<ul class="mt-1 ml-4 list-disc space-y-0.5">{#each detail.handoff.done as d}<li class="text-xs text-gray-300">{d}</li>{/each}</ul>
						</div>
					{/if}
					{#if detail.handoff.remaining?.length}
						<div class="mt-2">
							<strong class="text-[11px] font-bold uppercase tracking-wider text-yellow-400">⏳ Remaining</strong>
							<ul class="mt-1 ml-4 list-disc space-y-0.5">{#each detail.handoff.remaining as d}<li class="text-xs text-gray-300">{d}</li>{/each}</ul>
						</div>
					{/if}
					{#if detail.handoff.decisions?.length}
						<div class="mt-2">
							<strong class="text-[11px] font-bold uppercase tracking-wider text-blue-400">📋 Decisions</strong>
							<ul class="mt-1 ml-4 list-disc space-y-0.5">{#each detail.handoff.decisions as d}<li class="text-xs text-gray-300">{d}</li>{/each}</ul>
						</div>
					{/if}
					{#if detail.handoff.uncertain?.length}
						<div class="mt-2">
							<strong class="text-[11px] font-bold uppercase tracking-wider text-orange-400">❓ Uncertain</strong>
							<ul class="mt-1 ml-4 list-disc space-y-0.5">{#each detail.handoff.uncertain as d}<li class="text-xs text-gray-300">{d}</li>{/each}</ul>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Activity Log -->
			{#if detail.logs?.length}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">📝 Activity Log ({detail.logs.length})</h4>
					<div class="max-h-[300px] overflow-y-auto space-y-1">
						{#each detail.logs as log}
							<div class="flex gap-2 items-baseline py-1.5 border-b border-white/[0.04] last:border-0">
								<span class="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 {logTypeColors[log.type] ?? 'bg-gray-800 text-gray-400'}">{log.type}</span>
								<span class="text-xs text-gray-300 flex-1">{log.message}</span>
								<span class="text-[10px] text-gray-500 shrink-0 whitespace-nowrap">{ago(log.timestamp)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Add Activity -->
			{#if !detailReadOnly}
				<div class="mb-4">
					{#if showAddLog}
						<textarea bind:value={logMessage} placeholder="What happened?" rows="3" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50 mb-2"></textarea>
						<div class="flex gap-2 items-center">
							<select bind:value={logType} class="rounded-lg border border-white/10 bg-[#12121e] px-2 py-1.5 text-xs text-gray-200">
								{#each ['progress', 'decision', 'blocker', 'hypothesis', 'tried', 'result'] as t}<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>{/each}
							</select>
							<button onclick={() => submitLog(detail!.id)} class="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-500">Add</button>
							<button onclick={() => showAddLog = false} class="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
						</div>
					{:else}
						<button onclick={() => showAddLog = true} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:border-teal-500/50 hover:text-teal-300">+ Add Activity</button>
					{/if}
				</div>
			{/if}

			<!-- Git State -->
			{#if detail.git}
				{@const g = detail.git}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Git State</h4>
					<div class="text-xs text-gray-400 space-x-2">
						{#if g.start_branch}<span>Branch: <code class="bg-[#12121e] px-1 rounded text-[11px]">{g.start_branch}</code></span>{/if}
						{#if g.current_branch && g.current_branch !== g.start_branch}<span>Current: <code class="bg-[#12121e] px-1 rounded text-[11px]">{g.current_branch}</code></span>{/if}
						{#if g.start_commit}<span>Start: <code class="bg-[#12121e] px-1 rounded text-[11px]">{g.start_commit.substring(0, 7)}</code></span>{/if}
						{#if g.current_commit}<span>Head: <code class="bg-[#12121e] px-1 rounded text-[11px]">{g.current_commit.substring(0, 7)}</code></span>{/if}
						{#if g.commits_since_start}<span>+{g.commits_since_start} commits</span>{/if}
						{#if g.files_changed}<span>{g.files_changed} files</span>{/if}
						{#if g.additions || g.deletions}<span><span class="text-green-400">+{g.additions ?? 0}</span> <span class="text-red-400">-{g.deletions ?? 0}</span></span>{/if}
					</div>
				</div>
			{/if}

			<!-- Sessions -->
			{#if detail.sessions?.length}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Sessions</h4>
					<div class="flex flex-wrap gap-1.5">
						{#each detail.sessions as s}
							<span class="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400 font-mono">{s.session_id}{s.role ? ` (${s.role})` : ''}</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Labels -->
			<div class="mb-4">
				<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Labels</h4>
				{#if detail.labels?.length}
					<div class="flex flex-wrap gap-1.5">{#each detail.labels as l}<span class="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{l}</span>{/each}</div>
				{:else}
					<span class="text-xs text-gray-500">none</span>
				{/if}
			</div>

			<!-- Details -->
			<div class="mb-4">
				<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Details</h4>
				<div class="text-xs text-gray-400">
					Created: {ago(detail.created_at)}<br>
					Updated: {ago(detail.updated_at)}
					{#if detail.parent_id ?? detail.parent}<br>Parent: <button onclick={() => loadDetail((detail!.parent_id ?? detail!.parent)!)} class="font-mono text-teal-300 hover:underline">{detail.parent_id ?? detail.parent}</button>{/if}
					{#if detail.implementer_session}<br>Implementer: {detail.implementer_session}{/if}
				</div>
			</div>

			<!-- Status Actions -->
			{#if !detailReadOnly}
				<div class="mb-4">
					<h4 class="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">Actions</h4>
					<div class="flex flex-wrap gap-2">
						{#if detail.status === 'open'}
							<button onclick={() => updateStatus(detail!.id, 'in_progress')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">▶ Start</button>
							<button onclick={() => updateStatus(detail!.id, 'blocked')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Blocked</button>
						{:else if detail.status === 'in_progress'}
							<div class="w-full space-y-2">
								<textarea bind:value={reviewMessage} placeholder="Handoff message (optional)..." rows="3" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea>
								<button onclick={() => submitReview(detail!.id)} class="rounded-lg border border-purple-400 bg-purple-400/15 px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-400 hover:text-white">Submit for Review</button>
							</div>
							<button onclick={() => updateStatus(detail!.id, 'blocked')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Blocked</button>
							<button onclick={() => updateStatus(detail!.id, 'open')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Back to Open</button>
						{:else if detail.status === 'in_review'}
							<button onclick={() => approveIssue(detail!.id)} class="rounded-lg border border-green-400 bg-green-400/15 px-3 py-1.5 text-xs text-green-400 hover:bg-green-400 hover:text-white">✓ Approve</button>
							<button onclick={() => rejectIssue(detail!.id)} class="rounded-lg border border-red-400 bg-red-400/15 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400 hover:text-white">✗ Reject</button>
						{:else if detail.status === 'blocked'}
							<button onclick={() => updateStatus(detail!.id, 'open')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Unblock</button>
							<button onclick={() => updateStatus(detail!.id, 'in_progress')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Resume</button>
						{:else if detail.status === 'closed'}
							<button onclick={() => updateStatus(detail!.id, 'open')} class="rounded-lg border border-white/10 bg-[#12121e] px-3 py-1.5 text-xs text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600">Reopen</button>
						{/if}
					</div>
				</div>
			{:else}
				<div class="text-xs text-gray-500 mb-4">Read-only (cross-project view)</div>
			{/if}

			<!-- Footer: Delete + Close -->
			<div class="flex items-center justify-between border-t border-white/5 pt-4">
				{#if !detailReadOnly}
					{#if deleteConfirm}
						<div class="flex items-center gap-2 text-xs text-red-400">
							<span>Delete this issue?</span>
							<button onclick={() => deleteIssue(detail!.id)} class="rounded-lg bg-red-500 px-2 py-1 text-xs text-white">Yes</button>
							<button onclick={() => deleteConfirm = false} class="text-gray-500">No</button>
						</div>
					{:else}
						<button onclick={() => deleteConfirm = true} class="text-sm text-gray-500 hover:text-red-400" title="Delete">🗑️</button>
					{/if}
				{:else}
					<div></div>
				{/if}
				<button onclick={() => showDetail = false} class="rounded-lg border border-white/10 px-4 py-1.5 text-xs text-gray-400 hover:text-white">Close</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Modal -->
{#if showCreate}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onclick={() => showCreate = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-[500px] max-w-[90vw] rounded-xl border border-white/10 bg-[#0a0a0f] p-6 shadow-2xl" onclick={(e) => e.stopPropagation()}>
			<h3 class="text-lg font-semibold mb-4">New Issue</h3>
			<div class="space-y-3">
				<div>
					<label class="block text-xs font-semibold text-gray-400 mb-1">Title</label>
					<input bind:value={createForm.title} placeholder="Issue title" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="block text-xs font-semibold text-gray-400 mb-1">Description</label>
					<textarea bind:value={createForm.description} placeholder="Optional description..." rows="3" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="block text-xs font-semibold text-gray-400 mb-1">Type</label>
						<select bind:value={createForm.type} class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
							{#each ['task', 'bug', 'feature', 'epic', 'chore'] as t}<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>{/each}
						</select>
					</div>
					<div>
						<label class="block text-xs font-semibold text-gray-400 mb-1">Priority</label>
						<select bind:value={createForm.priority} class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
							<option value="P2">P2 — Medium</option>
							<option value="P0">P0 — Critical</option>
							<option value="P1">P1 — High</option>
							<option value="P3">P3 — Low</option>
							<option value="P4">P4 — Minimal</option>
						</select>
					</div>
				</div>
				<div>
					<label class="block text-xs font-semibold text-gray-400 mb-1">Labels</label>
					<input bind:value={createForm.labels} placeholder="Comma-separated labels" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="block text-xs font-semibold text-gray-400 mb-1">Parent</label>
					<input bind:value={createForm.parent} placeholder="Parent issue ID (optional)" class="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div class="flex justify-end gap-2 pt-2">
					<button onclick={() => showCreate = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
					<button onclick={handleCreate} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Create</button>
				</div>
			</div>
		</div>
	</div>
{/if}
