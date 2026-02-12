<script lang="ts">
	import { crm, type Contact, type Company } from '$lib/admin/api';

	let contacts = $state<Contact[]>([]);
	let companies = $state<Company[]>([]);
	let upcoming = $state<unknown[]>([]);
	let error = $state('');
	let search = $state('');
	let tab = $state<'contacts' | 'companies' | 'upcoming'>('contacts');

	async function load() {
		try {
			const [c, co, u] = await Promise.all([crm.contacts(), crm.companies(), crm.upcoming()]);
			contacts = c;
			companies = co;
			upcoming = u as unknown[];
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

	$effect(() => {
		load();
	});

	let filteredContacts = $derived(
		search
			? contacts.filter(
					(c) =>
						`${c.first_name} ${c.last_name ?? ''} ${c.email ?? ''}`
							.toLowerCase()
							.includes(search.toLowerCase())
				)
			: contacts
	);
</script>

<div class="max-w-4xl">
	<h1 class="text-2xl font-bold">CRM</h1>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Tabs -->
	<div class="mt-6 flex gap-2 border-b border-white/5 pb-px">
		{#each [['contacts', `Contacts (${contacts.length})`], ['companies', `Companies (${companies.length})`], ['upcoming', 'Upcoming']] as [key, label]}
			<button
				onclick={() => (tab = key as typeof tab)}
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

		<div class="mt-4 space-y-2">
			{#each filteredContacts as contact}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
					<div class="flex items-center justify-between">
						<div>
							<span class="font-medium">{contact.first_name} {contact.last_name ?? ''}</span>
							{#if contact.email}
								<span class="ml-2 text-xs text-gray-500">{contact.email}</span>
							{/if}
						</div>
						{#if contact.tags}
							<div class="flex gap-1.5">
								{#each contact.tags.split(',') as tag}
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{tag.trim()}</span>
								{/each}
							</div>
						{/if}
					</div>
					{#if contact.phone || contact.notes}
						<div class="mt-2 text-xs text-gray-500">
							{#if contact.phone}<span>{contact.phone}</span>{/if}
							{#if contact.notes}<span class="ml-2">{contact.notes}</span>{/if}
						</div>
					{/if}
				</div>
			{:else}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-8 text-center text-sm text-gray-500">
					No contacts found
				</div>
			{/each}
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
	{:else}
		<div class="mt-4 space-y-2">
			{#each upcoming as item}
				{@const r = item as Record<string, unknown>}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm">{r.message ?? r.name ?? r.reminder_message}</span>
						<span class="text-xs text-gray-500">{r.date ?? r.reminder_date}</span>
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
