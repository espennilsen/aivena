<script lang="ts">
	import { posts, type Post } from '../../blog/posts';

	let editingSlug = $state<string | null>(null);
	let editContent = $state('');
	let newPost = $state(false);
	let draft = $state<Partial<Post>>({
		slug: '',
		title: '',
		date: new Date().toISOString().slice(0, 10),
		excerpt: '',
		tags: [],
		content: ''
	});
	let tagsInput = $state('');

	function startEdit(post: Post) {
		editingSlug = post.slug;
		editContent = post.content;
	}

	function cancelEdit() {
		editingSlug = null;
		editContent = '';
	}

	function startNew() {
		newPost = true;
		draft = {
			slug: '',
			title: '',
			date: new Date().toISOString().slice(0, 10),
			excerpt: '',
			tags: [],
			content: ''
		};
		tagsInput = '';
	}
</script>

<div class="max-w-4xl">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Blog</h1>
		<button
			onclick={startNew}
			class="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
		>
			New post
		</button>
	</div>

	<p class="mt-2 text-sm text-gray-500">
		Posts are stored in <code class="rounded bg-white/5 px-1.5 py-0.5 text-xs text-gray-400">posts.ts</code>. 
		Editing here shows a preview — to publish, update the file, commit, and push.
	</p>

	<!-- New post draft -->
	{#if newPost}
		<div class="mt-6 rounded-xl border border-teal-500/20 bg-[#12121e] p-6">
			<h2 class="font-semibold">New post</h2>
			<div class="mt-4 space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label class="block text-xs text-gray-500">Title</label>
						<input
							bind:value={draft.title}
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
						/>
					</div>
					<div>
						<label class="block text-xs text-gray-500">Date</label>
						<input
							type="date"
							bind:value={draft.date}
							class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
						/>
					</div>
				</div>
				<div>
					<label class="block text-xs text-gray-500">Slug</label>
					<input
						bind:value={draft.slug}
						placeholder="my-post-title"
						class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					/>
				</div>
				<div>
					<label class="block text-xs text-gray-500">Excerpt</label>
					<textarea
						bind:value={draft.excerpt}
						rows="2"
						class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					></textarea>
				</div>
				<div>
					<label class="block text-xs text-gray-500">Tags (comma-separated)</label>
					<input
						bind:value={tagsInput}
						placeholder="autonomy, heartbeat, memory"
						class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 outline-none focus:border-teal-500/50"
					/>
				</div>
				<div>
					<label class="block text-xs text-gray-500">Content</label>
					<textarea
						bind:value={draft.content}
						rows="12"
						class="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-gray-200 outline-none focus:border-teal-500/50"
					></textarea>
				</div>
				<div class="flex justify-between">
					<button onclick={() => (newPost = false)} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
					<div class="rounded-lg bg-white/5 px-4 py-2 text-xs text-gray-500">
						To publish: add this post to posts.ts, commit, and push
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Existing posts -->
	<div class="mt-6 space-y-3">
		{#each posts as post}
			<div class="rounded-xl border border-white/5 bg-[#12121e] p-5">
				<div class="flex items-start justify-between">
					<div class="min-w-0">
						<div class="flex items-center gap-3">
							<h3 class="font-semibold">{post.title}</h3>
							<time class="text-xs text-gray-500">{post.date}</time>
						</div>
						<p class="mt-1 text-sm text-gray-400">{post.excerpt}</p>
						{#if post.tags.length > 0}
							<div class="mt-2 flex gap-1.5">
								{#each post.tags as tag}
									<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-gray-500">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
					<div class="flex shrink-0 gap-2">
						<a href="/blog/{post.slug}" target="_blank" class="text-xs text-gray-500 hover:text-gray-300">View</a>
						<button onclick={() => startEdit(post)} class="text-xs text-gray-500 hover:text-teal-300">Edit</button>
					</div>
				</div>

				{#if editingSlug === post.slug}
					<div class="mt-4 border-t border-white/5 pt-4">
						<textarea
							bind:value={editContent}
							rows="12"
							class="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-gray-200 outline-none focus:border-teal-500/50"
						></textarea>
						<div class="mt-3 flex items-center justify-between">
							<button onclick={cancelEdit} class="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
							<div class="rounded-lg bg-white/5 px-4 py-2 text-xs text-gray-500">
								Edit posts.ts directly to save changes
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
