<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import { getOpenmojiUrl } from '$lib'

	const staging = $derived(page.url.hostname.startsWith('dev.'))
</script>

<svelte:head>
	{#if dev}
		<!-- red hexagon -->
		<link href={getOpenmojiUrl('2B21-FE0F-200D-1F7E5')} rel="icon" />
	{:else if staging}
		<!-- yellow hexagon -->
		<link href={getOpenmojiUrl('2B21-FE0F-200D-1F7E8')} rel="icon" />
	{:else}
		<link href="/static/icon.svg" rel="icon" />

		<script
			data-website-id="d1135a06-f8ea-448b-973a-73ad41da74ce"
			defer
			src="https://umami.haume.nz/script.js"
		>
		</script>
	{/if}
</svelte:head>
