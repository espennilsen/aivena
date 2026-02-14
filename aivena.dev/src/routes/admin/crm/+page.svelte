<script lang="ts">
	import { crm, type Contact, type ContactDetail, type Company, type Interaction, type Reminder, type Relationship, type Group } from '$lib/admin/api';

	// ── State ──────────────────────────────────────────────
	let tab = $state<'dashboard' | 'contacts' | 'companies' | 'groups' | 'interactions' | 'reminders' | 'upcoming'>('dashboard');
	let error = $state('');

	// Data
	let contacts = $state<Contact[]>([]);
	let companies = $state<Company[]>([]);
	let groups = $state<Group[]>([]);
	let interactions = $state<Interaction[]>([]);
	let reminders = $state<Reminder[]>([]);
	let upcoming = $state<unknown[]>([]);
	let contactDetail = $state<ContactDetail | null>(null);

	// Groups detail
	let selectedGroup = $state<Group | null>(null);
	let groupMembers = $state<Contact[]>([]);

	// Search
	let searchQuery = $state('');

	// Modals
	let showAddContact = $state(false);
	let showAddCompany = $state(false);
	let showAddInteraction = $state(false);
	let showAddReminder = $state(false);
	let showAddGroup = $state(false);
	let showAddRelationship = $state(false);
	let showImportCsv = $state(false);
	let showAddMember = $state(false);
	let deleteConfirm = $state<{ type: string; id: number } | null>(null);

	// Forms
	let contactForm = $state({ first_name: '', last_name: '', email: '', phone: '', company_name: '', birthday: '', anniversary: '', tags: '', notes: '' });
	let companyForm = $state({ name: '', industry: '', website: '' });
	let interactionForm = $state({ interaction_type: 'note', summary: '', notes: '' });
	let reminderForm = $state({ reminder_type: 'custom', reminder_date: '', message: '' });
	let groupForm = $state({ name: '', description: '' });
	let relationshipForm = $state({ related_contact_id: 0, relationship_type: 'friend' });
	let csvText = $state('');
	let importResult = $state<{ created: number; skipped: number; details?: unknown[] } | null>(null);
	let addMemberContactId = $state(0);

	// ── Constants ──────────────────────────────────────────
	const typeIcons: Record<string, string> = { call: '📞', meeting: '🤝', email: '📧', note: '📝', gift: '🎁', message: '💬' };
	const reminderIcons: Record<string, string> = { birthday: '🎂', anniversary: '💍', custom: '📌' };
	const typeColors: Record<string, string> = { call: 'border-blue-400', meeting: 'border-green-400', email: 'border-yellow-400', note: 'border-purple-400', gift: 'border-red-400', message: 'border-purple-300' };

	// ── Helpers ────────────────────────────────────────────
	function initials(c: Contact | { first_name: string; last_name?: string | null }): string {
		return ((c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')).toUpperCase();
	}

	function ago(iso: string): string {
		const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
		if (s < 60) return 'just now';
		if (s < 3600) return Math.floor(s / 60) + 'm ago';
		if (s < 86400) return Math.floor(s / 3600) + 'h ago';
		const d = Math.floor(s / 86400);
		if (d < 7) return d + 'd ago';
		return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	function daysUntil(dateStr: string): number {
		const d = new Date(dateStr);
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		d.setHours(0, 0, 0, 0);
		return Math.round((d.getTime() - now.getTime()) / 86400000);
	}

	// ── Data loading ──────────────────────────────────────
	async function loadAll() {
		try {
			const [c, co, g, i, r, u] = await Promise.allSettled([
				crm.contacts(),
				crm.companies(),
				crm.groups(),
				crm.interactions(),
				crm.reminders(),
				crm.upcoming(90)
			]);
			if (c.status === 'fulfilled') contacts = c.value;
			if (co.status === 'fulfilled') companies = co.value;
			if (g.status === 'fulfilled') groups = g.value;
			if (i.status === 'fulfilled') interactions = i.value;
			if (r.status === 'fulfilled') reminders = r.value;
			if (u.status === 'fulfilled') upcoming = u.value as unknown[];
			error = '';
		} catch (e) { error = String(e); }
	}

	async function searchContacts() {
		try {
			contacts = await crm.contacts(searchQuery || undefined);
		} catch (e) { error = String(e); }
	}

	async function selectContact(id: number) {
		try {
			contactDetail = await crm.contact(id);
		} catch (e) { error = String(e); }
	}

	async function selectGroup(group: Group) {
		selectedGroup = group;
		try {
			groupMembers = await crm.groupMembers(group.id);
		} catch (e) { error = String(e); groupMembers = []; }
	}

	// ── Contact CRUD ──────────────────────────────────────
	async function handleAddContact() {
		if (!contactForm.first_name) return;
		try {
			await crm.createContact(contactForm as any);
			showAddContact = false;
			contactForm = { first_name: '', last_name: '', email: '', phone: '', company_name: '', birthday: '', anniversary: '', tags: '', notes: '' };
			await loadAll();
		} catch (e) { error = String(e); }
	}

	async function handleDeleteContact(id: number) {
		try {
			await crm.deleteContact(id);
			deleteConfirm = null;
			if (contactDetail?.contact.id === id) contactDetail = null;
			await loadAll();
		} catch (e) { error = String(e); }
	}

	// ── Interaction CRUD ──────────────────────────────────
	async function handleAddInteraction() {
		if (!contactDetail || !interactionForm.summary) return;
		try {
			await crm.createInteraction({
				contact_id: contactDetail.contact.id,
				interaction_type: interactionForm.interaction_type,
				summary: interactionForm.summary,
				notes: interactionForm.notes || undefined
			});
			showAddInteraction = false;
			interactionForm = { interaction_type: 'note', summary: '', notes: '' };
			await selectContact(contactDetail.contact.id);
			interactions = await crm.interactions();
		} catch (e) { error = String(e); }
	}

	async function handleDeleteInteraction(id: number) {
		try {
			await crm.deleteInteraction(id);
			deleteConfirm = null;
			if (contactDetail) await selectContact(contactDetail.contact.id);
			interactions = await crm.interactions();
		} catch (e) { error = String(e); }
	}

	// ── Company CRUD ──────────────────────────────────────
	async function handleAddCompany() {
		if (!companyForm.name) return;
		try {
			await crm.createCompany(companyForm as any);
			showAddCompany = false;
			companyForm = { name: '', industry: '', website: '' };
			await loadAll();
		} catch (e) { error = String(e); }
	}

	// ── Group CRUD ────────────────────────────────────────
	async function handleAddGroup() {
		if (!groupForm.name) return;
		try {
			await crm.createGroup(groupForm);
			showAddGroup = false;
			groupForm = { name: '', description: '' };
			await loadAll();
		} catch (e) { error = String(e); }
	}

	async function handleAddMember() {
		if (!selectedGroup || !addMemberContactId) return;
		try {
			await crm.addGroupMember(selectedGroup.id, addMemberContactId);
			showAddMember = false;
			await selectGroup(selectedGroup);
			await loadAll();
		} catch (e) { error = String(e); }
	}

	async function handleRemoveMember(contactId: number) {
		if (!selectedGroup) return;
		try {
			await crm.removeGroupMember(selectedGroup.id, contactId);
			deleteConfirm = null;
			await selectGroup(selectedGroup);
			await loadAll();
		} catch (e) { error = String(e); }
	}

	// ── Reminder CRUD ─────────────────────────────────────
	async function handleAddReminder() {
		if (!contactDetail || !reminderForm.reminder_date) return;
		try {
			await crm.createReminder({
				contact_id: contactDetail.contact.id,
				reminder_type: reminderForm.reminder_type,
				reminder_date: reminderForm.reminder_date,
				message: reminderForm.message || undefined
			});
			showAddReminder = false;
			reminderForm = { reminder_type: 'custom', reminder_date: '', message: '' };
			await selectContact(contactDetail.contact.id);
			reminders = await crm.reminders();
		} catch (e) { error = String(e); }
	}

	async function handleDeleteReminder(id: number) {
		try {
			await crm.deleteReminder(id);
			deleteConfirm = null;
			if (contactDetail) await selectContact(contactDetail.contact.id);
			reminders = await crm.reminders();
		} catch (e) { error = String(e); }
	}

	// ── Relationship CRUD ─────────────────────────────────
	async function handleAddRelationship() {
		if (!contactDetail || !relationshipForm.related_contact_id) return;
		try {
			await crm.createRelationship({
				contact_id: contactDetail.contact.id,
				related_contact_id: relationshipForm.related_contact_id,
				relationship_type: relationshipForm.relationship_type
			});
			showAddRelationship = false;
			await selectContact(contactDetail.contact.id);
		} catch (e) { error = String(e); }
	}

	async function handleDeleteRelationship(id: number) {
		try {
			await crm.deleteRelationship(id);
			deleteConfirm = null;
			if (contactDetail) await selectContact(contactDetail.contact.id);
		} catch (e) { error = String(e); }
	}

	// ── Import/Export ─────────────────────────────────────
	async function handleExport() {
		try {
			const csv = await crm.exportCsv();
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'crm-contacts.csv';
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) { error = String(e); }
	}

	async function handleImport() {
		if (!csvText.trim()) return;
		try {
			importResult = await crm.importCsv(csvText) as any;
			csvText = '';
			showImportCsv = false;
			await loadAll();
		} catch (e) { error = String(e); }
	}

	// ── Filtered data ─────────────────────────────────────
	function getGroupedContacts(): [string, Contact[]][] {
		const grouped: Record<string, Contact[]> = {};
		for (const c of contacts) {
			const letter = (c.first_name?.[0] ?? '?').toUpperCase();
			if (!grouped[letter]) grouped[letter] = [];
			grouped[letter].push(c);
		}
		return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
	}

	function getLetters(): string[] {
		const letters = new Set<string>();
		contacts.forEach(c => {
			const first = (c.first_name?.[0] ?? '').toUpperCase();
			if (first) letters.add(first);
		});
		return [...letters].sort();
	}

	function getNeglectedContacts(): Contact[] {
		// Contacts with no recent interactions (simple heuristic)
		const contactsWithInteractions = new Set(interactions.map(i => i.contact_id));
		return contacts.filter(c => !contactsWithInteractions.has(c.id)).slice(0, 10);
	}

	// ── Lifecycle ─────────────────────────────────────────
	$effect(() => {
		loadAll();
	});
</script>

<div class="max-w-[1600px]">
	<!-- Navigation tabs -->
	<div class="flex items-center gap-0 border-b border-white/5 mb-6 -mt-2">
		<span class="text-lg font-bold text-teal-400 pr-4 mr-2 border-r border-white/5">CRM</span>
		{#each [['dashboard', 'Dashboard'], ['contacts', 'Contacts'], ['companies', 'Companies'], ['groups', 'Groups'], ['interactions', 'Interactions'], ['reminders', 'Reminders'], ['upcoming', 'Upcoming']] as [key, label]}
			<button
				onclick={() => { tab = key as typeof tab; contactDetail = null; selectedGroup = null; }}
				class="border-b-2 px-4 py-2.5 text-sm font-medium transition {tab === key ? 'border-teal-400 text-teal-300' : 'border-transparent text-gray-500 hover:text-gray-300'}"
			>{label}</button>
		{/each}
	</div>

	{#if error}
		<div class="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- DASHBOARD -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{#if tab === 'dashboard'}
		<!-- Stats -->
		<div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-6">
			<button onclick={() => tab = 'contacts'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">📇</div>
				<div class="mt-1 text-2xl font-bold">{contacts.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Contacts</div>
			</button>
			<button onclick={() => tab = 'companies'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">🏢</div>
				<div class="mt-1 text-2xl font-bold">{companies.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Companies</div>
			</button>
			<button onclick={() => tab = 'groups'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">📂</div>
				<div class="mt-1 text-2xl font-bold">{groups.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Groups</div>
			</button>
			<button onclick={() => tab = 'interactions'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">💬</div>
				<div class="mt-1 text-2xl font-bold">{interactions.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Interactions</div>
			</button>
			<button onclick={() => tab = 'reminders'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">📌</div>
				<div class="mt-1 text-2xl font-bold">{reminders.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Reminders</div>
			</button>
			<button onclick={() => tab = 'upcoming'} class="rounded-xl border border-white/5 bg-[#12121e] p-5 text-center transition hover:border-teal-500/20">
				<div class="text-2xl">🔔</div>
				<div class="mt-1 text-2xl font-bold">{upcoming.length}</div>
				<div class="text-xs uppercase tracking-wider text-gray-500 mt-1">Upcoming</div>
			</button>
		</div>

		<!-- Dashboard panels -->
		<div class="grid gap-5 lg:grid-cols-2">
			<!-- Upcoming -->
			<div class="rounded-xl border border-white/5 bg-[#12121e] overflow-hidden">
				<div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
					<h2 class="text-sm font-semibold">🔔 Upcoming</h2>
					<button onclick={() => tab = 'upcoming'} class="text-xs text-teal-400 hover:text-teal-300">View all →</button>
				</div>
				{#each (upcoming as Record<string, unknown>[]).slice(0, 5) as item}
					{@const days = daysUntil((item.reminder_date ?? item.date) as string)}
					<button onclick={() => { if (item.contact_id) { selectContact(item.contact_id as number); tab = 'contacts'; } }} class="w-full flex items-center gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] text-left">
						<span class="text-xl">{reminderIcons[(item.reminder_type as string)] ?? '📌'}</span>
						<div class="flex-1 min-w-0">
							<div class="text-sm font-semibold">{item.first_name} {item.last_name ?? ''}</div>
							<div class="text-xs text-gray-500">{item.message ?? item.reminder_type}</div>
						</div>
						<span class="rounded px-2 py-0.5 text-xs font-semibold {days === 0 ? 'bg-green-400/15 text-green-400' : days <= 7 ? 'bg-yellow-400/15 text-yellow-400' : 'bg-teal-400/10 text-teal-300'}">
							{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days + 'd'}
						</span>
					</button>
				{:else}
					<div class="p-8 text-center text-sm text-gray-500">No upcoming events</div>
				{/each}
			</div>

			<!-- Recent Activity -->
			<div class="rounded-xl border border-white/5 bg-[#12121e] overflow-hidden">
				<div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
					<h2 class="text-sm font-semibold">💬 Recent Activity</h2>
					<button onclick={() => tab = 'interactions'} class="text-xs text-teal-400 hover:text-teal-300">View all →</button>
				</div>
				{#each interactions.slice(0, 5) as int}
					<button onclick={() => { selectContact(int.contact_id); tab = 'contacts'; }} class="w-full flex items-start gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] text-left">
						<span class="text-base mt-0.5">{typeIcons[int.interaction_type] ?? '💬'}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-sm font-semibold">{int.first_name ?? ''} {int.last_name ?? ''}</span>
								<span class="text-xs text-gray-500 ml-auto whitespace-nowrap">{ago(int.happened_at)}</span>
							</div>
							<div class="text-xs text-gray-400 truncate">{int.summary}</div>
						</div>
					</button>
				{:else}
					<div class="p-8 text-center text-sm text-gray-500">No recent interactions</div>
				{/each}
			</div>

			<!-- Neglected Contacts -->
			{#if getNeglectedContacts().length > 0}
				{@const neglected = getNeglectedContacts()}
				<div class="rounded-xl border border-white/5 bg-[#12121e] overflow-hidden lg:col-span-2">
					<div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
						<h2 class="text-sm font-semibold">👤 Needs Attention</h2>
					</div>
					<div class="grid grid-cols-2 lg:grid-cols-4">
						{#each neglected.slice(0, 8) as c}
							<button onclick={() => { selectContact(c.id); tab = 'contacts'; }} class="flex items-center gap-3 px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] text-left">
								<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-teal-400">{initials(c)}</div>
								<div class="min-w-0">
									<div class="text-sm font-semibold">{c.first_name} {c.last_name ?? ''}</div>
									<div class="text-xs text-gray-500">No interactions</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- CONTACTS -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'contacts'}
		<div class="flex items-center gap-3 mb-4">
			<input bind:value={searchQuery} oninput={searchContacts} placeholder="Search contacts..." class="flex-1 max-w-sm rounded-lg border border-white/10 bg-[#12121e] px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-teal-500/50" />
			<button onclick={() => loadAll()} class="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white">Refresh</button>
			<button onclick={handleExport} class="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white">Export CSV</button>
			<button onclick={() => showImportCsv = true} class="rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-400 hover:text-white">Import CSV</button>
			<button onclick={() => showAddContact = true} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ Contact</button>
		</div>

		{@const letters = getLetters()}
		<div class="grid gap-5 {contactDetail ? 'lg:grid-cols-[400px_1fr]' : ''}">
			<!-- Contact list with letter bar -->
			<div class="flex gap-0">
				<!-- Letter bar -->
				{#if letters.length > 3}
					<div class="flex flex-col items-center gap-0.5 py-1 px-0.5 bg-[#12121e] border border-white/5 border-r-0 rounded-l-lg overflow-y-auto max-h-[calc(100vh-220px)]">
						{#each 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as letter}
							{@const hasContacts = letters.includes(letter)}
							<button
								disabled={!hasContacts}
								onclick={() => { const el = document.getElementById('letter-' + letter); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
								class="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded {hasContacts ? 'text-gray-400 hover:bg-teal-600 hover:text-white cursor-pointer' : 'text-gray-600/30 cursor-default'}"
							>{letter}</button>
						{/each}
					</div>
				{/if}

				<!-- Contact list -->
				<div class="flex-1 bg-[#12121e] border border-white/5 {letters.length > 3 ? 'rounded-r-lg' : 'rounded-lg'} overflow-y-auto max-h-[calc(100vh-220px)]">
					{#each getGroupedContacts() as [letter, letterContacts]}
						<div id="letter-{letter}" class="sticky top-0 px-4 py-1.5 text-xs font-bold text-teal-400 bg-[#0a0a0f] border-b border-white/5 tracking-wider z-10">{letter}</div>
						{#each letterContacts as contact}
							<button
								onclick={() => selectContact(contact.id)}
								class="w-full text-left px-4 py-3.5 border-b border-white/[0.03] transition hover:bg-white/[0.03] {contactDetail?.contact.id === contact.id ? 'bg-teal-500/10 border-l-[3px] border-l-teal-400' : ''}"
							>
								<div class="flex items-center gap-3">
									<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-teal-400">{initials(contact)}</div>
									<div class="min-w-0 flex-1">
										<div class="text-sm font-semibold">{contact.first_name} {contact.last_name ?? ''}</div>
										<div class="flex items-center gap-2 text-xs text-gray-500">
											{#if contact.email}<span class="truncate">{contact.email}</span>{/if}
											{#if contact.company_name}<span class="text-gray-600">· {contact.company_name}</span>{/if}
										</div>
									</div>
								</div>
								{#if contact.tags}
									<div class="flex flex-wrap gap-1 mt-1.5 ml-12">
										{#each contact.tags.split(',').slice(0, 3) as tag}
											<span class="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[10px] text-gray-400">{tag.trim()}</span>
										{/each}
									</div>
								{/if}
							</button>
						{/each}
					{:else}
						<div class="p-8 text-center text-sm text-gray-500">No contacts found</div>
					{/each}
				</div>
			</div>

			<!-- Contact detail -->
			{#if contactDetail}
				{@const c = contactDetail.contact}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
					<div class="flex items-start justify-between mb-5">
						<div class="flex items-center gap-4">
							<div class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/10 bg-white/5 text-2xl font-bold text-teal-400">{initials(c)}</div>
							<div>
								<h2 class="text-2xl font-bold">{c.first_name} {c.last_name ?? ''}</h2>
								{#if c.company_name}<div class="text-sm text-gray-400">{c.company_name}</div>{/if}
							</div>
						</div>
						<div class="flex gap-2">
							<button onclick={() => { showAddInteraction = true; interactionForm = { interaction_type: 'note', summary: '', notes: '' }; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300 hover:border-teal-500/30">+ Interaction</button>
							<button onclick={() => { showAddReminder = true; reminderForm = { reminder_type: 'custom', reminder_date: '', message: '' }; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300 hover:border-teal-500/30">+ Reminder</button>
							<button onclick={() => { showAddRelationship = true; relationshipForm = { related_contact_id: 0, relationship_type: 'friend' }; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300 hover:border-teal-500/30">+ Relation</button>
							{#if deleteConfirm?.type === 'contact' && deleteConfirm.id === c.id}
								<button onclick={() => handleDeleteContact(c.id)} class="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400">Confirm delete</button>
								<button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button>
							{:else}
								<button onclick={() => deleteConfirm = { type: 'contact', id: c.id }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:border-red-400/30">Delete</button>
							{/if}
							<button onclick={() => contactDetail = null} class="text-gray-500 hover:text-gray-300 ml-2">✕</button>
						</div>
					</div>

					<!-- Fields -->
					<div class="space-y-2 mb-5">
						{#if c.email}<div class="flex items-center gap-2 text-sm"><span class="text-gray-500 w-5 text-center">📧</span> {c.email}</div>{/if}
						{#if c.phone}<div class="flex items-center gap-2 text-sm"><span class="text-gray-500 w-5 text-center">📱</span> {c.phone}</div>{/if}
						{#if c.birthday}<div class="flex items-center gap-2 text-sm"><span class="text-gray-500 w-5 text-center">🎂</span> {c.birthday}</div>{/if}
						{#if c.anniversary}<div class="flex items-center gap-2 text-sm"><span class="text-gray-500 w-5 text-center">💍</span> {c.anniversary}</div>{/if}
						{#if c.notes}<div class="mt-3 rounded-lg bg-white/[0.03] p-3 text-xs text-gray-400">{c.notes}</div>{/if}
						{#if c.tags}
							<div class="flex flex-wrap gap-1.5 mt-2">
								{#each c.tags.split(',') as tag}<span class="rounded bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-gray-400">{tag.trim()}</span>{/each}
							</div>
						{/if}
					</div>

					<!-- Relationships -->
					{#if contactDetail.relationships?.length}
						<div class="mb-5">
							<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Relationships</h3>
							<div class="space-y-2">
								{#each contactDetail.relationships as rel}
									<div class="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 p-3">
										<button onclick={() => selectContact(rel.related_contact_id)} class="text-left">
											<span class="text-sm font-semibold text-teal-300 hover:underline">{rel.related_first_name} {rel.related_last_name ?? ''}</span>
											<span class="ml-2 text-xs text-gray-500 uppercase">{rel.relationship_type}</span>
										</button>
										{#if deleteConfirm?.type === 'relationship' && deleteConfirm.id === rel.id}
											<div class="flex gap-2"><button onclick={() => handleDeleteRelationship(rel.id)} class="text-xs text-red-400">Delete</button><button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button></div>
										{:else}
											<button onclick={() => deleteConfirm = { type: 'relationship', id: rel.id }} class="text-gray-500 hover:text-red-400 opacity-50 hover:opacity-100 text-xs">✕</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Groups -->
					{#if contactDetail.groups?.length}
						<div class="mb-5">
							<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Groups</h3>
							<div class="flex flex-wrap gap-1.5">{#each contactDetail.groups as g}<span class="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-300">{g.name}</span>{/each}</div>
						</div>
					{/if}

					<!-- Reminders -->
					{#if contactDetail.reminders?.length}
						<div class="mb-5">
							<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Reminders</h3>
							<div class="space-y-2">
								{#each contactDetail.reminders as rem}
									<div class="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 p-3 text-xs">
										<span>{reminderIcons[rem.reminder_type] ?? '📌'} {rem.message ?? rem.reminder_type} — {rem.reminder_date}</span>
										{#if deleteConfirm?.type === 'reminder' && deleteConfirm.id === rem.id}
											<div class="flex gap-2"><button onclick={() => handleDeleteReminder(rem.id)} class="text-red-400">Delete</button><button onclick={() => deleteConfirm = null} class="text-gray-500">Cancel</button></div>
										{:else}
											<button onclick={() => deleteConfirm = { type: 'reminder', id: rem.id }} class="text-gray-500 hover:text-red-400 opacity-50 hover:opacity-100">✕</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Interaction Timeline -->
					<div>
						<h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Interactions</h3>
						{#if contactDetail.interactions?.length}
							<div class="border-l-2 border-white/10 pl-0">
								{#each contactDetail.interactions as int}
									<div class="relative pl-8 pb-5 last:pb-0">
										<div class="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#12121e] border-[3px] {typeColors[int.interaction_type] ?? 'border-gray-500'}"></div>
										<div class="text-[11px] text-gray-500 mb-1">{ago(int.happened_at)}</div>
										<div class="rounded-lg bg-white/[0.03] border border-white/5 p-3 group">
											<div class="flex items-center gap-2">
												<span class="rounded bg-[#0a0a0f] px-2 py-0.5 text-[10px] font-semibold uppercase {int.interaction_type === 'call' ? 'text-blue-400' : int.interaction_type === 'meeting' ? 'text-green-400' : int.interaction_type === 'email' ? 'text-yellow-400' : 'text-purple-400'}">{int.interaction_type}</span>
												{#if deleteConfirm?.type === 'interaction' && deleteConfirm.id === int.id}
													<button onclick={() => handleDeleteInteraction(int.id)} class="ml-auto text-xs text-red-400">Confirm</button>
													<button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button>
												{:else}
													<button onclick={() => deleteConfirm = { type: 'interaction', id: int.id }} class="ml-auto text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
												{/if}
											</div>
											<div class="mt-1 text-sm font-medium">{int.summary}</div>
											{#if int.notes}<div class="mt-1 text-xs text-gray-400">{int.notes}</div>{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-xs text-gray-500">No interactions yet</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- COMPANIES -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'companies'}
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Companies</h2>
			<button onclick={() => showAddCompany = true} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ Company</button>
		</div>
		<div class="space-y-2">
			{#each companies as company}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
					<div class="flex items-center justify-between">
						<span class="font-medium">{company.name}</span>
						<div class="flex gap-3 text-xs text-gray-500">
							{#if company.industry}<span>{company.industry}</span>{/if}
							{#if company.website}<a href={company.website} target="_blank" class="text-teal-400 hover:text-teal-300">{company.website}</a>{/if}
						</div>
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">No companies</div>
			{/each}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- GROUPS -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'groups'}
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Groups</h2>
			<button onclick={() => showAddGroup = true} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ Group</button>
		</div>
		<div class="grid gap-5 {selectedGroup ? 'lg:grid-cols-[400px_1fr]' : ''}">
			<div class="space-y-2">
				{#each groups as group}
					<button onclick={() => selectGroup(group)} class="w-full text-left rounded-xl border bg-[#12121e] p-4 transition {selectedGroup?.id === group.id ? 'border-teal-500/30' : 'border-white/5 hover:border-white/10'}">
						<div class="flex items-center justify-between">
							<div>
								<div class="font-medium">{group.name}</div>
								{#if group.description}<div class="text-xs text-gray-500 mt-0.5">{group.description}</div>{/if}
							</div>
							{#if group.member_count != null}
								<span class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-500">{group.member_count} members</span>
							{/if}
						</div>
					</button>
				{:else}
					<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">No groups</div>
				{/each}
			</div>

			{#if selectedGroup}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h3 class="text-lg font-bold">{selectedGroup.name}</h3>
							{#if selectedGroup.description}<p class="text-sm text-gray-400">{selectedGroup.description}</p>{/if}
						</div>
						<div class="flex gap-2">
							<button onclick={() => { showAddMember = true; addMemberContactId = 0; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300">+ Member</button>
							<button onclick={() => selectedGroup = null} class="text-gray-500 hover:text-gray-300">✕</button>
						</div>
					</div>
					<div class="space-y-1.5">
						{#each groupMembers as member}
							<div class="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 p-3">
								<button onclick={() => { selectContact(member.id); tab = 'contacts'; }} class="text-sm font-semibold text-teal-300 hover:underline">{member.first_name} {member.last_name ?? ''}</button>
								{#if deleteConfirm?.type === 'member' && deleteConfirm.id === member.id}
									<div class="flex gap-2"><button onclick={() => handleRemoveMember(member.id)} class="text-xs text-red-400">Remove</button><button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button></div>
								{:else}
									<button onclick={() => deleteConfirm = { type: 'member', id: member.id }} class="text-gray-500 hover:text-red-400 opacity-50 hover:opacity-100 text-xs">✕</button>
								{/if}
							</div>
						{:else}
							<div class="text-sm text-gray-500">No members</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- INTERACTIONS -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'interactions'}
		<h2 class="text-lg font-semibold mb-4">All Interactions</h2>
		<div class="space-y-2">
			{#each interactions as int}
				<div class="flex items-start gap-3.5 rounded-xl border border-white/5 bg-[#12121e] p-4 transition hover:bg-white/[0.02]">
					<div class="w-9 h-9 rounded-full flex items-center justify-center text-base bg-white/[0.03] border-2 shrink-0 {typeColors[int.interaction_type] ?? 'border-gray-500'}">
						{typeIcons[int.interaction_type] ?? '💬'}
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 flex-wrap">
							<button onclick={() => { selectContact(int.contact_id); tab = 'contacts'; }} class="text-sm font-semibold text-teal-300 hover:underline">{int.first_name ?? ''} {int.last_name ?? ''}</button>
							<span class="rounded bg-[#0a0a0f] px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-400">{int.interaction_type}</span>
							<span class="text-xs text-gray-500 ml-auto whitespace-nowrap">{ago(int.happened_at)}</span>
						</div>
						<div class="text-sm font-medium mt-1">{int.summary}</div>
						{#if int.notes}<div class="text-xs text-gray-400 mt-1">{int.notes}</div>{/if}
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">No interactions</div>
			{/each}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- REMINDERS -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'reminders'}
		<h2 class="text-lg font-semibold mb-4">All Reminders</h2>
		<div class="space-y-2">
			{#each reminders as rem}
				{@const days = daysUntil(rem.reminder_date)}
				<div class="flex items-center gap-3.5 rounded-xl border bg-[#12121e] p-4 transition hover:bg-white/[0.02] {days < 0 ? 'border-l-[3px] border-l-red-400 border-white/5' : days <= 7 ? 'border-l-[3px] border-l-yellow-400 border-white/5' : 'border-white/5'}">
					<div class="w-9 h-9 rounded-full flex items-center justify-center text-base bg-white/[0.03] border-2 border-white/10 shrink-0">
						{reminderIcons[rem.reminder_type] ?? '📌'}
					</div>
					<div class="flex-1 min-w-0">
						<button onclick={() => { selectContact(rem.contact_id); tab = 'contacts'; }} class="text-sm font-semibold text-teal-300 hover:underline">{rem.first_name ?? ''} {rem.last_name ?? ''}</button>
						<div class="text-sm font-medium">{rem.reminder_date}</div>
						{#if rem.message}<div class="text-xs text-gray-400 mt-0.5">{rem.message}</div>{/if}
					</div>
					<span class="rounded px-2 py-0.5 text-xs font-semibold uppercase {days < 0 ? 'bg-red-400/15 text-red-400' : days <= 7 ? 'bg-yellow-400/15 text-yellow-400' : 'bg-green-400/15 text-green-400'}">
						{days < 0 ? 'Overdue' : days === 0 ? 'Today' : days <= 7 ? 'Soon' : days + 'd'}
					</span>
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">No reminders</div>
			{/each}
		</div>

	<!-- ═══════════════════════════════════════════════════════════ -->
	<!-- UPCOMING -->
	<!-- ═══════════════════════════════════════════════════════════ -->
	{:else if tab === 'upcoming'}
		<h2 class="text-lg font-semibold mb-4">Upcoming Events</h2>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each upcoming as item}
				{@const r = item as Record<string, unknown>}
				{@const days = daysUntil((r.reminder_date ?? r.date) as string)}
				<button onclick={() => { if (r.contact_id) { selectContact(r.contact_id as number); tab = 'contacts'; } }} class="flex items-center gap-3.5 rounded-xl border border-white/5 bg-[#12121e] p-4 transition hover:border-teal-500/20 text-left">
					<span class="text-3xl">{reminderIcons[(r.reminder_type as string)] ?? '📌'}</span>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-semibold">{r.first_name} {r.last_name ?? ''}</div>
						<div class="text-xs text-gray-400">{(r.reminder_date ?? r.date) as string}</div>
						{#if r.message}<div class="text-xs text-gray-500 mt-0.5">{r.message}</div>{/if}
					</div>
					<span class="rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap {days === 0 ? 'bg-green-400/15 text-green-400' : days <= 7 ? 'bg-yellow-400/15 text-yellow-400' : 'bg-teal-400/10 text-teal-300'}">
						{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days + 'd'}
					</span>
				</button>
			{:else}
				<div class="col-span-full rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">Nothing upcoming</div>
			{/each}
		</div>
	{/if}
</div>

<!-- ═══════════════════════════════════════════════════════════════ -->
<!-- MODALS -->
<!-- ═══════════════════════════════════════════════════════════════ -->

<!-- Add Contact Modal -->
{#if showAddContact}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddContact = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-lg rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5">
				<h2 class="text-lg font-bold">New Contact</h2>
				<button onclick={() => showAddContact = false} class="text-gray-400 hover:text-white text-xl">×</button>
			</div>
			<div class="p-5 space-y-3">
				<div class="grid grid-cols-2 gap-3">
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">First name</label><input bind:value={contactForm.first_name} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">Last name</label><input bind:value={contactForm.last_name} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">Email</label><input type="email" bind:value={contactForm.email} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">Phone</label><input bind:value={contactForm.phone} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">Company</label><input bind:value={contactForm.company_name} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
					<div><label class="block text-xs font-semibold text-gray-400 mb-1">Birthday</label><input type="date" bind:value={contactForm.birthday} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				</div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Tags (comma-separated)</label><input bind:value={contactForm.tags} placeholder="friend, work, vip" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Notes</label><textarea bind:value={contactForm.notes} rows="2" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea></div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddContact = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddContact} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Add contact</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Company Modal -->
{#if showAddCompany}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddCompany = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">New Company</h2><button onclick={() => showAddCompany = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5 space-y-3">
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Name</label><input bind:value={companyForm.name} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Industry</label><input bind:value={companyForm.industry} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Website</label><input bind:value={companyForm.website} placeholder="https://" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddCompany = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddCompany} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Add company</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Interaction Modal -->
{#if showAddInteraction && contactDetail}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddInteraction = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">Log interaction with {contactDetail.contact.first_name}</h2><button onclick={() => showAddInteraction = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5 space-y-3">
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Type</label>
					<select bind:value={interactionForm.interaction_type} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
						<option value="call">📞 Call</option><option value="meeting">🤝 Meeting</option><option value="email">📧 Email</option><option value="note">📝 Note</option><option value="gift">🎁 Gift</option><option value="message">💬 Message</option>
					</select>
				</div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Summary</label><input bind:value={interactionForm.summary} placeholder="What happened?" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Notes</label><textarea bind:value={interactionForm.notes} rows="3" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea></div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddInteraction = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddInteraction} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Log interaction</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Reminder Modal -->
{#if showAddReminder && contactDetail}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddReminder = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">Add reminder for {contactDetail.contact.first_name}</h2><button onclick={() => showAddReminder = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5 space-y-3">
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Type</label>
					<select bind:value={reminderForm.reminder_type} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
						<option value="birthday">🎂 Birthday</option><option value="anniversary">💍 Anniversary</option><option value="custom">📌 Custom</option>
					</select>
				</div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Date</label><input type="date" bind:value={reminderForm.reminder_date} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Message</label><input bind:value={reminderForm.message} placeholder="Optional message" class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddReminder = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddReminder} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Add reminder</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Group Modal -->
{#if showAddGroup}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddGroup = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">New Group</h2><button onclick={() => showAddGroup = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5 space-y-3">
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Name</label><input bind:value={groupForm.name} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Description</label><input bind:value={groupForm.description} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" /></div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddGroup = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddGroup} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Create group</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Relationship Modal -->
{#if showAddRelationship && contactDetail}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddRelationship = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">Add relationship</h2><button onclick={() => showAddRelationship = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5 space-y-3">
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Related contact</label>
					<select bind:value={relationshipForm.related_contact_id} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
						<option value={0}>Select...</option>
						{#each contacts.filter(c => c.id !== contactDetail?.contact.id) as c}<option value={c.id}>{c.first_name} {c.last_name ?? ''}</option>{/each}
					</select>
				</div>
				<div><label class="block text-xs font-semibold text-gray-400 mb-1">Type</label>
					<select bind:value={relationshipForm.relationship_type} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
						{#each ['friend', 'spouse', 'child', 'parent', 'sibling', 'colleague', 'manager', 'mentor'] as t}<option value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>{/each}
					</select>
				</div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddRelationship = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddRelationship} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Add relationship</button>
			</div>
		</div>
	</div>
{/if}

<!-- Add Group Member Modal -->
{#if showAddMember && selectedGroup}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showAddMember = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">Add member to {selectedGroup.name}</h2><button onclick={() => showAddMember = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5">
				<label class="block text-xs font-semibold text-gray-400 mb-1">Contact</label>
				<select bind:value={addMemberContactId} class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
					<option value={0}>Select...</option>
					{#each contacts.filter(c => !groupMembers.some(m => m.id === c.id)) as c}<option value={c.id}>{c.first_name} {c.last_name ?? ''}</option>{/each}
				</select>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showAddMember = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleAddMember} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Add member</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import CSV Modal -->
{#if showImportCsv}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => showImportCsv = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-lg rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">Import CSV</h2><button onclick={() => showImportCsv = false} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5">
				<label class="block text-xs font-semibold text-gray-400 mb-1">Paste CSV data</label>
				<textarea bind:value={csvText} rows="10" placeholder="first_name,last_name,email,phone,company,tags&#10;John,Doe,john@example.com,..." class="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50 font-mono"></textarea>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => showImportCsv = false} class="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
				<button onclick={handleImport} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Import</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import Result -->
{#if importResult}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onclick={() => importResult = null}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] overflow-hidden" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center justify-between px-5 py-4 border-b border-white/5"><h2 class="text-lg font-bold">📥 Import Results</h2><button onclick={() => importResult = null} class="text-gray-400 hover:text-white text-xl">×</button></div>
			<div class="p-5">
				<div class="grid grid-cols-2 gap-3 mb-4">
					<div class="rounded-xl border border-white/5 bg-[#0a0a0f] p-4 text-center">
						<div class="text-2xl font-bold text-green-400">{importResult.created}</div>
						<div class="text-xs uppercase text-gray-500 mt-1">Created</div>
					</div>
					<div class="rounded-xl border border-white/5 bg-[#0a0a0f] p-4 text-center">
						<div class="text-2xl font-bold text-yellow-400">{importResult.skipped}</div>
						<div class="text-xs uppercase text-gray-500 mt-1">Skipped</div>
					</div>
				</div>
			</div>
			<div class="flex justify-end gap-3 px-5 py-4 border-t border-white/5">
				<button onclick={() => importResult = null} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Done</button>
			</div>
		</div>
	</div>
{/if}
