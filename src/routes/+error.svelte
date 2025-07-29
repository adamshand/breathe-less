<script lang="ts">
	import { page } from '$app/state'
</script>

<h1>{page.status}</h1>

<p>
	{@html page.error?.message.replace(
		'signed in',
		'<a href="/u/sign/in">signed in</a>',
	)}
</p>

<style>
	p {
		margin-inline: auto;
		text-align: center;
	}
</style>
