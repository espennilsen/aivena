<script lang="ts">
	import { getApiEndpoint } from '$lib/admin/api';

	let crmUrl = $state('');

	$effect(() => {
		const base = getApiEndpoint();
		if (base) {
			// Extension UIs are mounted at /crm, not /api/crm
			crmUrl = base.replace(/\/+$/, '').replace(/\/api$/, '') + '/crm/';
		}
	});
</script>

{#if crmUrl}
	<div class="crm-wrapper">
		<div class="crm-toolbar">
			<span class="crm-label">CRM</span>
			<a href={crmUrl} target="_blank" rel="noopener" class="open-link">Open in new tab ↗</a>
		</div>
		<iframe
			src={crmUrl}
			title="CRM"
			class="crm-frame"
		></iframe>
	</div>
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-400">
			API endpoint not configured — connect in the sidebar first.
		</div>
	</div>
{/if}

<style>
	.crm-wrapper {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 4rem);
		margin: -1.5rem;
	}

	@media (min-width: 1024px) {
		.crm-wrapper {
			margin: -2.5rem;
		}
	}

	.crm-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		background: #0d0d18;
		flex-shrink: 0;
	}

	.crm-label {
		font-size: 13px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.5);
	}

	.open-link {
		font-size: 12px;
		color: rgba(96, 165, 250, 0.8);
		text-decoration: none;
	}

	.open-link:hover {
		color: rgb(96, 165, 250);
		text-decoration: underline;
	}

	.crm-frame {
		flex: 1;
		width: 100%;
		border: none;
		background: #0a0a0f;
	}
</style>
