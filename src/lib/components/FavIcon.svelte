<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import { getOpenmojiUrl } from '$lib'

	const staging = $derived(page.url.hostname.startsWith('dev.'))
	const umamiId = $derived(page.data.site?.tracking ?? null)
</script>

<svelte:head>
	{#if dev}
		<!-- red circle -->
		<link href={getOpenmojiUrl('1F534')} rel="icon" />
	{:else if staging}
		<!-- yellow circle -->
		<link href={getOpenmojiUrl('1F7E1')} rel="icon" />
	{:else}
		<!-- globe with meridians -->
		<link href={getOpenmojiUrl('1f310')} rel="icon" />

		{#if umamiId}
			<script
				data-website-id={umamiId}
				defer
				src="https://umami.haume.nz/script.js"
			>
			</script>
		{/if}
	{/if}
</svelte:head>
