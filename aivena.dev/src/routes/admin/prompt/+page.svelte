<script lang="ts">
	import { dashboard } from '$lib/admin/api';

	let prompt = $state('');
	let sending = $state(false);
	let history = $state<Array<{ prompt: string; response: string; time: string }>>([]);
	let error = $state('');

	async function send() {
		if (!prompt.trim() || sending) return;
		sending = true;
		error = '';
		const text = prompt.trim();
		prompt = '';

		try {
			const result = (await dashboard.prompt(text)) as Record<string, unknown>;
			history = [
				{
					prompt: text,
					response: (result.response as string) ?? JSON.stringify(result),
					time: new Date().toLocaleTimeString()
				},
				...history
			];
		} catch (e) {
			error = String(e);
			prompt = text;
		}
		sending = false;
	}
</script>

<div class="max-w-3xl">
	<h1 class="text-2xl font-bold">Prompt</h1>
	<p class="mt-1 text-sm text-gray-500">Send a prompt directly to the agent</p>

	{#if error}
		<div class="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">{error}</div>
	{/if}

	<form onsubmit={(e) => { e.preventDefault(); send(); }} class="mt-6">
		<textarea
			bind:value={prompt}
			placeholder="Tell me to do something..."
			rows="4"
			class="w-full rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-teal-500/50"
		></textarea>
		<div class="mt-3 flex justify-end">
			<button
				type="submit"
				disabled={sending || !prompt.trim()}
				class="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-500 disabled:opacity-50"
			>
				{sending ? 'Sending...' : 'Send'}
			</button>
		</div>
	</form>

	<!-- History -->
	{#if history.length > 0}
		<div class="mt-8 space-y-4">
			{#each history as entry}
				<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
					<div class="flex items-center justify-between">
						<span class="text-xs text-teal-400">Prompt</span>
						<span class="text-xs text-gray-500">{entry.time}</span>
					</div>
					<p class="mt-1 text-sm">{entry.prompt}</p>
					<div class="mt-3 border-t border-white/5 pt-3">
						<span class="text-xs text-gray-500">Response</span>
						<div class="mt-1 rounded-lg bg-white/5 p-3 font-mono text-xs leading-relaxed text-gray-400">
							<pre class="overflow-x-auto whitespace-pre-wrap">{entry.response}</pre>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
