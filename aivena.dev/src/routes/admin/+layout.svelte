<script lang="ts">
	import { getApiToken, setApiToken, clearApiToken } from '$lib/admin/api';
	import { page } from '$app/state';

	let { children } = $props();

	let authenticated = $state(false);
	let tokenInput = $state('');
	let sidebarOpen = $state(false);

	// Check for existing token on mount
	$effect(() => {
		authenticated = !!getApiToken();
	});

	function login() {
		if (tokenInput.trim()) {
			setApiToken(tokenInput.trim());
			authenticated = true;
			tokenInput = '';
		}
	}

	function logout() {
		clearApiToken();
		authenticated = false;
	}

	const nav = [
		{ href: '/admin', label: 'Overview', icon: '◉' },
		{ href: '/admin/heartbeat', label: 'Heartbeat', icon: '♥' },
		{ href: '/admin/jobs', label: 'Jobs', icon: '▶' },
		{ href: '/admin/tasks', label: 'Tasks', icon: '☐' },
		{ href: '/admin/blog', label: 'Blog', icon: '✎' },
		{ href: '/admin/crm', label: 'CRM', icon: '☷' },
		{ href: '/admin/calendar', label: 'Calendar', icon: '▦' },
		{ href: '/admin/prompt', label: 'Prompt', icon: '›_' }
	];

	function isActive(href: string): boolean {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Admin — Aivena</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !authenticated}
	<!-- Login -->
	<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
		<div class="w-full max-w-sm">
			<div class="rounded-2xl border border-white/5 bg-[#12121e] p-8">
				<div class="mb-6 flex items-center gap-2.5">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white"
					>
						A
					</div>
					<span class="text-lg font-semibold">Admin</span>
				</div>
				<p class="mb-6 text-sm text-gray-400">Enter your API token to continue.</p>
				<form onsubmit={(e) => { e.preventDefault(); login(); }}>
					<input
						type="password"
						bind:value={tokenInput}
						placeholder="Bearer token"
						class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-teal-500/50"
					/>
					<button
						type="submit"
						class="mt-4 w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500"
					>
						Connect
					</button>
				</form>
			</div>
		</div>
	</div>
{:else}
	<div class="flex min-h-[calc(100vh-4rem)]">
		<!-- Sidebar (desktop) -->
		<aside class="hidden w-56 shrink-0 border-r border-white/5 bg-[#0d0d18] lg:block">
			<div class="flex h-full flex-col px-3 py-6">
				<nav class="flex-1 space-y-1">
					{#each nav as item}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition {isActive(item.href)
								? 'bg-teal-500/10 text-teal-300'
								: 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}"
						>
							<span class="w-5 text-center font-mono text-xs">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</nav>
				<button
					onclick={logout}
					class="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:text-red-400"
				>
					<span class="w-5 text-center font-mono text-xs">⏻</span>
					Disconnect
				</button>
			</div>
		</aside>

		<!-- Mobile sidebar toggle -->
		<button
			class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg lg:hidden"
			onclick={() => (sidebarOpen = !sidebarOpen)}
		>
			☰
		</button>

		<!-- Mobile sidebar overlay -->
		{#if sidebarOpen}
			<div class="fixed inset-0 z-40 lg:hidden">
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="absolute inset-0 bg-black/60" onclick={() => (sidebarOpen = false)}></div>
				<aside class="absolute left-0 top-0 h-full w-56 border-r border-white/5 bg-[#0d0d18]">
					<div class="flex h-full flex-col px-3 py-6 pt-20">
						<nav class="flex-1 space-y-1">
							{#each nav as item}
								<a
									href={item.href}
									onclick={() => (sidebarOpen = false)}
									class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition {isActive(item.href)
										? 'bg-teal-500/10 text-teal-300'
										: 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}"
								>
									<span class="w-5 text-center font-mono text-xs">{item.icon}</span>
									{item.label}
								</a>
							{/each}
						</nav>
					</div>
				</aside>
			</div>
		{/if}

		<!-- Content -->
		<div class="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
			{@render children()}
		</div>
	</div>
{/if}
