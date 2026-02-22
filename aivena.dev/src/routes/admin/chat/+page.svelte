<script lang="ts">
	import { dashboard, connectSSE, type SSEEvent } from '$lib/admin/api';
	import { marked } from 'marked';
	import { tick } from 'svelte';

	// ── Types ──────────────────────────────────────────────

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		time: string;
		tools?: ToolCall[];
		streaming?: boolean;
	}

	interface ToolCall {
		name: string;
		id: string;
		status: 'running' | 'done' | 'error';
		preview?: string;
	}

	// ── State ──────────────────────────────────────────────

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let sending = $state(false);
	let agentRunning = $state(false);
	let connected = $state(false);
	let error = $state('');
	let messagesEl: HTMLDivElement;
	let inputEl: HTMLTextAreaElement;
	let sseController: AbortController | null = null;

	// ── SSE Connection ─────────────────────────────────────

	function connect() {
		if (sseController) { sseController.abort(); sseController = null; }

		sseController = connectSSE(
			(event: SSEEvent) => {
				connected = true;
				error = '';

				switch (event.type) {
					case 'connected':
						break;

					case 'agent_start':
						agentRunning = true;
						break;

					case 'agent_end':
						agentRunning = false;
						// Finalize streaming message
						const streaming = messages.find(m => m.streaming);
						if (streaming) {
							streaming.streaming = false;
							messages = [...messages];
						}
						break;

					case 'turn_end':
						if (event.text) {
							const existing = messages.find(m => m.streaming && m.role === 'assistant');
							if (existing) {
								existing.content = event.text;
								existing.streaming = false;
								messages = [...messages];
							} else {
								messages = [...messages, {
									id: crypto.randomUUID(),
									role: 'assistant',
									content: event.text,
									time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
									streaming: false
								}];
							}
						}
						scrollToBottom();
						break;

					case 'turn_start': {
						// Create a new streaming assistant message
						const lastMsg = messages[messages.length - 1];
						if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.streaming) {
							messages = [...messages, {
								id: crypto.randomUUID(),
								role: 'assistant',
								content: '',
								time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
								tools: [],
								streaming: true
							}];
						}
						scrollToBottom();
						break;
					}

					case 'tool_start': {
						const msg = messages.find(m => m.streaming);
						if (msg) {
							if (!msg.tools) msg.tools = [];
							msg.tools.push({ name: event.toolName, id: event.toolCallId, status: 'running' });
							messages = [...messages];
						}
						scrollToBottom();
						break;
					}

					case 'tool_end': {
						const msg2 = messages.find(m => m.streaming);
						if (msg2?.tools) {
							const tool = msg2.tools.find(t => t.name === event.toolName && t.status === 'running');
							if (tool) {
								tool.status = event.isError ? 'error' : 'done';
								tool.preview = event.preview;
								messages = [...messages];
							}
						}
						scrollToBottom();
						break;
					}
				}
			},
			() => {
				connected = false;
				// Auto-reconnect after 3s
				setTimeout(connect, 3000);
			}
		);
	}

	async function scrollToBottom() {
		await tick();
		if (messagesEl) {
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	}

	// ── Send prompt ────────────────────────────────────────

	async function send() {
		const text = input.trim();
		if (!text || sending) return;

		input = '';
		sending = true;
		error = '';

		// Add user message immediately
		messages = [...messages, {
			id: crypto.randomUUID(),
			role: 'user',
			content: text,
			time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
		}];
		scrollToBottom();

		try {
			await dashboard.prompt(text);
		} catch (e) {
			error = String(e);
		}
		sending = false;
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	// ── Markdown rendering ─────────────────────────────────

	function renderMarkdown(text: string): string {
		if (!text) return '';
		try {
			return marked.parse(text, { async: false, breaks: true }) as string;
		} catch {
			return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
	}

	// ── Lifecycle ──────────────────────────────────────────

	$effect(() => {
		connect();
		return () => { sseController?.abort(); };
	});
</script>

<!-- Full-height chat layout that fills the admin content area -->
<div class="flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">

	<!-- Header bar -->
	<div class="flex items-center justify-between pb-4">
		<div class="flex items-center gap-3">
			<h1 class="text-2xl font-bold">Chat</h1>
			<span class="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs {connected ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}">
				<span class="inline-block h-1.5 w-1.5 rounded-full {connected ? 'bg-teal-400' : 'bg-red-400'}"></span>
				{connected ? 'Connected' : 'Disconnected'}
			</span>
			{#if agentRunning}
				<span class="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-400">
					<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
					Thinking
				</span>
			{/if}
		</div>
		<button
			onclick={() => { messages = []; }}
			class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 transition hover:text-white"
		>
			Clear
		</button>
	</div>

	{#if error}
		<div class="mb-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-400">{error}</div>
	{/if}

	<!-- Messages area -->
	<div
		bind:this={messagesEl}
		class="flex-1 space-y-4 overflow-y-auto scroll-smooth rounded-xl border border-white/5 bg-[#0d0d18] p-4"
	>
		{#if messages.length === 0}
			<div class="flex h-full items-center justify-center">
				<div class="text-center">
					<div class="text-3xl">◈</div>
					<p class="mt-3 text-sm text-gray-500">Send a message to start chatting with Aivena</p>
				</div>
			</div>
		{/if}

		{#each messages as msg (msg.id)}
			{#if msg.role === 'user'}
				<!-- User message -->
				<div class="flex justify-end">
					<div class="max-w-[80%] rounded-2xl rounded-br-md bg-teal-600/20 px-4 py-3">
						<div class="whitespace-pre-wrap text-sm text-gray-200">{msg.content}</div>
						<div class="mt-1.5 text-right text-[10px] text-gray-500">{msg.time}</div>
					</div>
				</div>
			{:else}
				<!-- Assistant message -->
				<div class="flex justify-start">
					<div class="max-w-[90%]">
						<!-- Tool calls -->
						{#if msg.tools && msg.tools.length > 0}
							<div class="mb-2 flex flex-wrap gap-1.5">
								{#each msg.tools as tool}
									<span class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px]
										{tool.status === 'running'
											? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
											: tool.status === 'error'
												? 'border-red-500/20 bg-red-500/5 text-red-400'
												: 'border-white/5 bg-white/[0.03] text-gray-500'}">
										{#if tool.status === 'running'}
											<span class="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
										{:else if tool.status === 'error'}
											<span class="text-red-400">✗</span>
										{:else}
											<span class="text-teal-400">✓</span>
										{/if}
										{tool.name}
									</span>
								{/each}
							</div>
						{/if}

						<!-- Content -->
						{#if msg.content}
							<div class="rounded-2xl rounded-bl-md border border-white/5 bg-[#12121e] px-4 py-3">
								<div class="prose-chat text-sm leading-relaxed text-gray-300">
									{@html renderMarkdown(msg.content)}
								</div>
								<div class="mt-1.5 text-[10px] text-gray-500">{msg.time}</div>
							</div>
						{:else if msg.streaming}
							<div class="rounded-2xl rounded-bl-md border border-white/5 bg-[#12121e] px-4 py-3">
								<div class="flex items-center gap-2 text-sm text-gray-500">
									<span class="inline-flex gap-1">
										<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 0ms"></span>
										<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 150ms"></span>
										<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style="animation-delay: 300ms"></span>
									</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Input area -->
	<div class="mt-3 flex gap-2">
		<div class="relative flex-1">
			<textarea
				bind:this={inputEl}
				bind:value={input}
				onkeydown={handleKeydown}
				placeholder="Send a message…"
				rows="1"
				disabled={!connected}
				class="w-full resize-none rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 pr-12 text-sm text-gray-200 placeholder-gray-500 outline-none transition focus:border-teal-500/50 disabled:opacity-50"
			></textarea>
			<button
				onclick={send}
				disabled={sending || !input.trim() || !connected}
				class="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-500 disabled:opacity-30"
				title="Send (Enter)"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
					<path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l14.095-5.927a.75.75 0 0 0 0-1.37L3.105 2.288Z" />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	/* Markdown prose styles for assistant messages */
	:global(.prose-chat p) {
		margin-bottom: 0.5em;
	}
	:global(.prose-chat p:last-child) {
		margin-bottom: 0;
	}
	:global(.prose-chat code) {
		background: rgba(255, 255, 255, 0.06);
		border-radius: 4px;
		padding: 0.15em 0.35em;
		font-size: 0.85em;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
	}
	:global(.prose-chat pre) {
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 0.75em 1em;
		overflow-x: auto;
		margin: 0.5em 0;
	}
	:global(.prose-chat pre code) {
		background: none;
		padding: 0;
		font-size: 0.8em;
		color: #c9d1d9;
	}
	:global(.prose-chat ul, .prose-chat ol) {
		padding-left: 1.5em;
		margin: 0.4em 0;
	}
	:global(.prose-chat li) {
		margin: 0.15em 0;
	}
	:global(.prose-chat blockquote) {
		border-left: 3px solid rgba(255, 255, 255, 0.1);
		padding-left: 0.75em;
		margin: 0.5em 0;
		color: #9ca3af;
	}
	:global(.prose-chat a) {
		color: #5eead4;
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	:global(.prose-chat a:hover) {
		color: #99f6e4;
	}
	:global(.prose-chat h1, .prose-chat h2, .prose-chat h3) {
		font-weight: 600;
		margin: 0.75em 0 0.25em;
		color: #e5e7eb;
	}
	:global(.prose-chat h1) { font-size: 1.25em; }
	:global(.prose-chat h2) { font-size: 1.1em; }
	:global(.prose-chat h3) { font-size: 1em; }
	:global(.prose-chat hr) {
		border-color: rgba(255, 255, 255, 0.05);
		margin: 0.75em 0;
	}
	:global(.prose-chat table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.5em 0;
		font-size: 0.85em;
	}
	:global(.prose-chat th, .prose-chat td) {
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 0.35em 0.6em;
		text-align: left;
	}
	:global(.prose-chat th) {
		background: rgba(255, 255, 255, 0.03);
		font-weight: 500;
	}
	:global(.prose-chat strong) {
		color: #e5e7eb;
		font-weight: 600;
	}
</style>
