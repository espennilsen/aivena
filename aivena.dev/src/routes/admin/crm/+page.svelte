<script lang="ts">
	import { crm, type Contact, type ContactDetail, type Company, type Interaction, type Reminder, type Group } from '$lib/admin/api';

	// ── State ──────────────────────────────────────────────
	let tab = $state<'contacts' | 'companies' | 'groups' | 'upcoming'>('contacts');
	let contacts = $state<Contact[]>([]);
	let companies = $state<Company[]>([]);
	let groups = $state<Group[]>([]);
	let upcoming = $state<unknown[]>([]);
	let interactions = $state<Interaction[]>([]);
	let contactDetail = $state<ContactDetail | null>(null);
	let error = $state('');
	let search = $state('');

	// Modals
	let showAddContact = $state(false);
	let showAddInteraction = $state(false);
	let showAddCompany = $state(false);
	let deleteConfirm = $state<{ type: string; id: number } | null>(null);

	// Forms
	let contactForm = $state({ first_name: '', last_name: '', email: '', phone: '', company_name: '', birthday: '', tags: '', notes: '' });
	let interactionForm = $state({ interaction_type: 'note', summary: '', notes: '' });
	let companyForm = $state({ name: '', industry: '', website: '' });

	// ── Load ───────────────────────────────────────────────
	async function loadAll() {
		try {
			const [c, co, g, u, i] = await Promise.all([
				crm.contacts(),
				crm.companies(),
				crm.groups(),
				crm.upcoming(),
				crm.interactions()
			]);
			contacts = c;
			companies = co;
			groups = g;
			upcoming = u as unknown[];
			interactions = i;
			error = '';
		} catch (e) {
			error = String(e);
		}
	}

	async function searchContacts() {
		try {
			contacts = await crm.contacts(search || undefined);
		} catch (e) {
			error = String(e);
		}
	}

	async function selectContact(id: number) {
		try {
			contactDetail = await crm.contact(id);
		} catch (e) {
			error = String(e);
		}
	}

	$effect(() => {
		loadAll();
	});

	// ── Contact CRUD ───────────────────────────────────────
	async function handleAddContact() {
		if (!contactForm.first_name) return;
		try {
			await crm.createContact(contactForm as any);
			showAddContact = false;
			contactForm = { first_name: '', last_name: '', email: '', phone: '', company_name: '', birthday: '', tags: '', notes: '' };
			await loadAll();
		} catch (e) {
			error = String(e);
		}
	}

	async function handleDeleteContact(id: number) {
		try {
			await crm.deleteContact(id);
			deleteConfirm = null;
			if (contactDetail?.contact.id === id) contactDetail = null;
			await loadAll();
		} catch (e) {
			error = String(e);
		}
	}

	// ── Interaction ────────────────────────────────────────
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
		} catch (e) {
			error = String(e);
		}
	}

	async function handleDeleteInteraction(id: number) {
		try {
			await crm.deleteInteraction(id);
			deleteConfirm = null;
			if (contactDetail) await selectContact(contactDetail.contact.id);
			interactions = await crm.interactions();
		} catch (e) {
			error = String(e);
		}
	}

	// ── Company ────────────────────────────────────────────
	async function handleAddCompany() {
		if (!companyForm.name) return;
		try {
			await crm.createCompany(companyForm as any);
			showAddCompany = false;
			companyForm = { name: '', industry: '', website: '' };
			await loadAll();
		} catch (e) {
			error = String(e);
		}
	}

	// ── Helpers ────────────────────────────────────────────
	const typeIcons: Record<string, string> = { call: '📞', meeting: '🤝', email: '📧', note: '📝', gift: '🎁', message: '💬' };

	function initials(c: Contact): string {
		return ((c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')).toUpperCase();
	}

	function relativeTime(date: string): string {
		const diff = Date.now() - new Date(date).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}
</script>

<div class="max-w-5xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">CRM</h1>
		<div class="flex gap-2">
			<button onclick={() => loadAll()} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white">Refresh</button>
			{#if tab === 'contacts'}
				<button onclick={() => { showAddContact = true; }} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ Contact</button>
			{:else if tab === 'companies'}
				<button onclick={() => { showAddCompany = true; }} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">+ Company</button>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Stats -->
	<div class="mt-4 grid gap-3 sm:grid-cols-5">
		<button onclick={() => tab = 'contacts'} class="rounded-xl border border-white/5 bg-[#12121e] p-4 text-center transition hover:border-teal-500/20">
			<div class="text-xl">📇</div>
			<div class="mt-1 text-xl font-bold">{contacts.length}</div>
			<div class="text-xs text-gray-500">Contacts</div>
		</button>
		<button onclick={() => tab = 'companies'} class="rounded-xl border border-white/5 bg-[#12121e] p-4 text-center transition hover:border-teal-500/20">
			<div class="text-xl">🏢</div>
			<div class="mt-1 text-xl font-bold">{companies.length}</div>
			<div class="text-xs text-gray-500">Companies</div>
		</button>
		<button onclick={() => tab = 'groups'} class="rounded-xl border border-white/5 bg-[#12121e] p-4 text-center transition hover:border-teal-500/20">
			<div class="text-xl">📂</div>
			<div class="mt-1 text-xl font-bold">{groups.length}</div>
			<div class="text-xs text-gray-500">Groups</div>
		</button>
		<div class="rounded-xl border border-white/5 bg-[#12121e] p-4 text-center">
			<div class="text-xl">💬</div>
			<div class="mt-1 text-xl font-bold">{interactions.length}</div>
			<div class="text-xs text-gray-500">Interactions</div>
		</div>
		<button onclick={() => tab = 'upcoming'} class="rounded-xl border border-white/5 bg-[#12121e] p-4 text-center transition hover:border-teal-500/20">
			<div class="text-xl">🔔</div>
			<div class="mt-1 text-xl font-bold">{upcoming.length}</div>
			<div class="text-xs text-gray-500">Upcoming</div>
		</button>
	</div>

	<!-- Tabs -->
	<div class="mt-6 flex gap-2 border-b border-white/5 pb-px">
		{#each [['contacts', 'Contacts'], ['companies', 'Companies'], ['groups', 'Groups'], ['upcoming', 'Upcoming']] as [key, label]}
			<button
				onclick={() => { tab = key as typeof tab; contactDetail = null; }}
				class="border-b-2 px-4 py-2 text-sm transition {tab === key ? 'border-teal-400 text-teal-300' : 'border-transparent text-gray-500 hover:text-gray-300'}"
			>
				{label}
			</button>
		{/each}
	</div>

	{#if tab === 'contacts'}
		<!-- Search -->
		<div class="mt-4">
			<input
				bind:value={search}
				oninput={searchContacts}
				placeholder="Search contacts..."
				class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-teal-500/50"
			/>
		</div>

		<!-- Split view: list + detail -->
		<div class="mt-4 grid gap-4 {contactDetail ? 'lg:grid-cols-[1fr_1fr]' : ''}">
			<div class="space-y-1.5 {contactDetail ? 'max-h-[70vh] overflow-y-auto' : ''}">
				{#each contacts as contact}
					<button
						onclick={() => selectContact(contact.id)}
						class="w-full rounded-xl border bg-[#12121e] p-4 text-left transition {contactDetail?.contact.id === contact.id ? 'border-teal-500/30' : 'border-white/5 hover:border-white/10'}"
					>
						<div class="flex items-center gap-3">
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-teal-400">
								{initials(contact)}
							</div>
							<div class="min-w-0">
								<div class="text-sm font-medium">{contact.first_name} {contact.last_name ?? ''}</div>
								{#if contact.email}
									<div class="truncate text-xs text-gray-500">{contact.email}</div>
								{/if}
							</div>
							{#if contact.tags}
								<div class="ml-auto flex gap-1">
									{#each contact.tags.split(',').slice(0, 2) as tag}
										<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{tag.trim()}</span>
									{/each}
								</div>
							{/if}
						</div>
					</button>
				{:else}
					<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
						No contacts found
					</div>
				{/each}
			</div>

			<!-- Contact detail -->
			{#if contactDetail}
				{@const c = contactDetail.contact}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-5 max-h-[70vh] overflow-y-auto">
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-4">
							<div class="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg font-bold text-teal-400">
								{initials(c)}
							</div>
							<div>
								<h2 class="text-lg font-bold">{c.first_name} {c.last_name ?? ''}</h2>
								{#if c.company_name}
									<div class="text-sm text-gray-500">{c.company_name}</div>
								{/if}
							</div>
						</div>
						<button onclick={() => contactDetail = null} class="text-gray-500 hover:text-gray-300">✕</button>
					</div>

					<!-- Fields -->
					<div class="mt-4 space-y-2">
						{#if c.email}
							<div class="flex items-center gap-2 text-sm"><span class="text-gray-500">📧</span> {c.email}</div>
						{/if}
						{#if c.phone}
							<div class="flex items-center gap-2 text-sm"><span class="text-gray-500">📱</span> {c.phone}</div>
						{/if}
						{#if c.birthday}
							<div class="flex items-center gap-2 text-sm"><span class="text-gray-500">🎂</span> {c.birthday}</div>
						{/if}
						{#if c.notes}
							<div class="mt-2 rounded-lg bg-white/[0.03] p-3 text-xs text-gray-400">{c.notes}</div>
						{/if}
						{#if c.tags}
							<div class="flex flex-wrap gap-1.5">
								{#each c.tags.split(',') as tag}
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{tag.trim()}</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Actions -->
					<div class="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
						<button onclick={() => { showAddInteraction = true; interactionForm = { interaction_type: 'note', summary: '', notes: '' }; }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-teal-300">+ Log interaction</button>
						{#if deleteConfirm?.type === 'contact' && deleteConfirm.id === c.id}
							<button onclick={() => handleDeleteContact(c.id)} class="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400">Confirm delete</button>
							<button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button>
						{:else}
							<button onclick={() => deleteConfirm = { type: 'contact', id: c.id }} class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400">Delete</button>
						{/if}
					</div>

					<!-- Relationships -->
					{#if contactDetail.relationships?.length}
						<div class="mt-4 border-t border-white/5 pt-4">
							<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Relationships</h3>
							<div class="space-y-1.5">
								{#each contactDetail.relationships as rel}
									<button onclick={() => selectContact(rel.related_contact_id)} class="w-full rounded-lg bg-white/[0.03] p-2.5 text-left text-xs hover:bg-white/[0.05]">
										<span class="font-medium text-teal-400">{rel.related_first_name} {rel.related_last_name ?? ''}</span>
										<span class="ml-2 text-gray-500">{rel.relationship_type}</span>
									</button>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Groups -->
					{#if contactDetail.groups?.length}
						<div class="mt-4 border-t border-white/5 pt-4">
							<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Groups</h3>
							<div class="flex flex-wrap gap-1.5">
								{#each contactDetail.groups as group}
									<span class="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs text-teal-300">{group.name}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Reminders -->
					{#if contactDetail.reminders?.length}
						<div class="mt-4 border-t border-white/5 pt-4">
							<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Reminders</h3>
							<div class="space-y-1.5">
								{#each contactDetail.reminders as rem}
									<div class="flex items-center justify-between rounded-lg bg-white/[0.03] p-2.5 text-xs">
										<span>
											{rem.reminder_type === 'birthday' ? '🎂' : rem.reminder_type === 'anniversary' ? '💍' : '📌'}
											{rem.message ?? rem.reminder_type}
										</span>
										<span class="text-gray-500">{rem.reminder_date}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Interaction timeline -->
					<div class="mt-4 border-t border-white/5 pt-4">
						<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Interactions</h3>
						{#if contactDetail.interactions?.length}
							<div class="space-y-2">
								{#each contactDetail.interactions as int}
									<div class="group rounded-lg bg-white/[0.03] p-3">
										<div class="flex items-center gap-2">
											<span class="text-sm">{typeIcons[int.interaction_type] ?? '💬'}</span>
											<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{int.interaction_type}</span>
											<span class="ml-auto text-xs text-gray-600">{relativeTime(int.happened_at)}</span>
											{#if deleteConfirm?.type === 'interaction' && deleteConfirm.id === int.id}
												<button onclick={() => handleDeleteInteraction(int.id)} class="text-xs text-red-400">Confirm</button>
												<button onclick={() => deleteConfirm = null} class="text-xs text-gray-500">Cancel</button>
											{:else}
												<button onclick={() => deleteConfirm = { type: 'interaction', id: int.id }} class="text-xs text-gray-600 opacity-0 transition group-hover:opacity-100 hover:text-red-400">✕</button>
											{/if}
										</div>
										<p class="mt-1 text-xs font-medium text-gray-300">{int.summary}</p>
										{#if int.notes}
											<p class="mt-1 text-xs text-gray-500">{int.notes}</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-xs text-gray-500">No interactions yet</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>

	{:else if tab === 'companies'}
		<div class="mt-4 space-y-2">
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
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
					No companies
				</div>
			{/each}
		</div>

	{:else if tab === 'groups'}
		<div class="mt-4 space-y-2">
			{#each groups as group}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
					<div class="flex items-center justify-between">
						<div>
							<span class="font-medium">{group.name}</span>
							{#if group.description}
								<p class="mt-0.5 text-xs text-gray-500">{group.description}</p>
							{/if}
						</div>
						{#if group.member_count != null}
							<span class="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-gray-500">{group.member_count} members</span>
						{/if}
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
					No groups
				</div>
			{/each}
		</div>

	{:else if tab === 'upcoming'}
		<div class="mt-4 space-y-2">
			{#each upcoming as item}
				{@const r = item as Record<string, unknown>}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<span class="text-lg">{r.reminder_type === 'birthday' ? '🎂' : r.reminder_type === 'anniversary' ? '💍' : '📌'}</span>
							<div>
								<span class="text-sm font-medium">{r.first_name} {r.last_name ?? ''}</span>
								{#if r.message || r.reminder_message}
									<p class="text-xs text-gray-500">{r.message ?? r.reminder_message}</p>
								{/if}
							</div>
						</div>
						<span class="text-xs text-gray-500">{r.reminder_date ?? r.date}</span>
					</div>
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
					Nothing upcoming
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Contact Modal -->
{#if showAddContact}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onclick={() => showAddContact = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-lg rounded-xl border border-white/10 bg-[#12121e] p-6" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-4 font-semibold">New contact</h2>
			<div class="space-y-3">
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-first">First name</label>
						<input id="c-first" bind:value={contactForm.first_name} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-last">Last name</label>
						<input id="c-last" bind:value={contactForm.last_name} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-email">Email</label>
						<input id="c-email" type="email" bind:value={contactForm.email} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-phone">Phone</label>
						<input id="c-phone" bind:value={contactForm.phone} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-company">Company</label>
						<input id="c-company" bind:value={contactForm.company_name} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
					<div>
						<label class="mb-1 block text-xs text-gray-500" for="c-birthday">Birthday</label>
						<input id="c-birthday" type="date" bind:value={contactForm.birthday} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
					</div>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="c-tags">Tags (comma-separated)</label>
					<input id="c-tags" bind:value={contactForm.tags} placeholder="friend, work, vip" class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="c-notes">Notes</label>
					<textarea id="c-notes" bind:value={contactForm.notes} rows="2" class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea>
				</div>
				<div class="flex justify-between pt-2">
					<button onclick={() => showAddContact = false} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<button onclick={handleAddContact} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">Add contact</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Add Interaction Modal -->
{#if showAddInteraction && contactDetail}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onclick={() => showAddInteraction = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] p-6" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-4 font-semibold">Log interaction with {contactDetail.contact.first_name}</h2>
			<div class="space-y-3">
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="i-type">Type</label>
					<select id="i-type" bind:value={interactionForm.interaction_type} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50">
						<option value="call">📞 Call</option>
						<option value="meeting">🤝 Meeting</option>
						<option value="email">📧 Email</option>
						<option value="note">📝 Note</option>
						<option value="gift">🎁 Gift</option>
						<option value="message">💬 Message</option>
					</select>
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="i-summary">Summary</label>
					<input id="i-summary" bind:value={interactionForm.summary} placeholder="What happened?" class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="i-notes">Notes</label>
					<textarea id="i-notes" bind:value={interactionForm.notes} rows="3" class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"></textarea>
				</div>
				<div class="flex justify-between pt-2">
					<button onclick={() => showAddInteraction = false} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<button onclick={handleAddInteraction} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">Log interaction</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Add Company Modal -->
{#if showAddCompany}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onclick={() => showAddCompany = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="w-full max-w-md rounded-xl border border-white/10 bg-[#12121e] p-6" onclick={(e) => e.stopPropagation()}>
			<h2 class="mb-4 font-semibold">New company</h2>
			<div class="space-y-3">
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="co-name">Name</label>
					<input id="co-name" bind:value={companyForm.name} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="co-industry">Industry</label>
					<input id="co-industry" bind:value={companyForm.industry} class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div>
					<label class="mb-1 block text-xs text-gray-500" for="co-website">Website</label>
					<input id="co-website" bind:value={companyForm.website} placeholder="https://" class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50" />
				</div>
				<div class="flex justify-between pt-2">
					<button onclick={() => showAddCompany = false} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<button onclick={handleAddCompany} class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500">Add company</button>
				</div>
			</div>
		</div>
	</div>
{/if}
