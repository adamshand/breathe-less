<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import { getOpenmojiUrl } from '$lib'

	const staging = $derived(page.url.hostname.startsWith('dev.'))
</script>

<svelte:head>
	{#if dev}
		<!-- red circle -->
		<link href={getOpenmojiUrl('1F534')} rel="icon" />
	{:else if staging}
		<!-- yellow circle -->
		<link href={getOpenmojiUrl('1F7E1')} rel="icon" />
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
