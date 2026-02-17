<script lang="ts">
	import './layout.css';
	import icon from '$lib/assets/icon.png';

	let { children } = $props();

	let mobileMenuOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" href={icon} />
	<script defer src="https://cloud.umami.is/script.js" data-website-id="636f6a37-dc2e-4955-9699-7e681b2e9b1e"></script>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Navigation -->
<nav class="fixed top-0 z-50 w-full border-b border-white/5 bg-[#0a0a12]/80 backdrop-blur-xl">
	<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
		<a href="/" class="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
			<img src={icon} alt="Aivena" class="h-8 w-8 rounded-lg" />
			<span>Aivena</span>
		</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-8 md:flex">
			<a href="/#features" class="text-sm text-gray-400 transition hover:text-white">Features</a>
			<a href="/#architecture" class="text-sm text-gray-400 transition hover:text-white"
				>Architecture</a
			>
			<a href="/docs" class="text-sm text-gray-400 transition hover:text-white">Docs</a>
			<a href="/stack" class="text-sm text-gray-400 transition hover:text-white">Stack</a>
			<a href="/changelog" class="text-sm text-gray-400 transition hover:text-white">Changelog</a>
			<a href="/blog" class="text-sm text-gray-400 transition hover:text-white">Blog</a>
			<a
				href="https://github.com/espennilsen/aivena"
				target="_blank"
				rel="noopener"
				class="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:border-teal-500/50 hover:text-white"
			>
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				GitHub
			</a>
		</div>

		<!-- Mobile menu button -->
		<button class="md:hidden" onclick={() => (mobileMenuOpen = !mobileMenuOpen)}>
			<svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if mobileMenuOpen}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				{:else}
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="border-t border-white/5 bg-[#0a0a12] px-6 py-4 md:hidden">
			<div class="flex flex-col gap-4">
				<a
					href="/#features"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Features</a
				>
				<a
					href="/#architecture"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Architecture</a
				>
				<a
					href="/docs"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Docs</a
				>
				<a
					href="/stack"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Stack</a
				>
				<a
					href="/changelog"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Changelog</a
				>
				<a
					href="/blog"
					class="text-sm text-gray-400 hover:text-white"
					onclick={() => (mobileMenuOpen = false)}>Blog</a
				>
				<a
					href="https://github.com/espennilsen/aivena"
					target="_blank"
					rel="noopener"
					class="text-sm text-gray-400 hover:text-white">GitHub</a
				>
			</div>
		</div>
	{/if}
</nav>

<!-- Main content -->
<main class="pt-16">
	{@render children()}
</main>

<!-- Footer -->
<footer class="border-t border-white/5 bg-[#0a0a12]">
	<div class="mx-auto max-w-6xl px-6 py-12">
		<div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
			<div class="flex items-center gap-2.5">
				<img src={icon} alt="Aivena" class="h-7 w-7 rounded-md" />
				<span class="text-sm font-medium text-gray-400">Aivena</span>
			</div>
			<div class="flex items-center gap-6 text-sm text-gray-500">
				<span>
					By <a
						href="https://e9n.dev"
						class="text-gray-400 transition hover:text-white"
						target="_blank"
						rel="noopener">Espen Nilsen</a
					>
				</span>
				<span>·</span>
				<span>
					Built with <a
						href="https://github.com/mariozechner/pi-coding-agent"
						class="text-gray-400 transition hover:text-white"
						target="_blank"
						rel="noopener">Pi</a
					>
				</span>
			</div>
		</div>
	</div>
</footer>
