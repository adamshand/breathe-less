<script lang="ts">
	let { log }: { log: number[] } = $props()
	import { session } from '$lib/session.svelte'
</script>

{#if log.length !== 5}
	<section style="--stage-count: {session.loggedShortNames.length}">
		{#each { length: session.loggedShortNames.length }, i}
			{@const complete = log[i] >= 0}

			<div
				class:complete
				class:last={i + 1 === session.loggedShortNames.length}
			>
				{session.loggedShortNames[i]}
			</div>
		{/each}
	</section>
{/if}

<style>
	section {
		display: grid;
		grid-template-columns: repeat(var(--stage-count), 1fr);

		/* TODO: tweak botom to look right on phone */
		margin: var(--size-1) 2px;
		border: 1px solid var(--brand);

		background-color: var(--surface-2);
		color: var(--brand);
		font-size: var(--font-size-1);
		font-weight: var(--font-weight-5);
		font-variant-caps: small-caps;
	}

	div {
		position: relative;

		display: grid;
		justify-content: center;

		padding-inline: 10px 0px;

		&::before {
			content: '';
			position: absolute;
			right: -12px;
			top: 50%;
			transform: translateY(-50%);
			border: 12px solid transparent;
			border-left-color: var(--brand);
			border-right: none;
			z-index: 1;
		}

		&::after {
			content: '';
			position: absolute;
			right: -10px;
			top: 50%;
			transform: translateY(-50%);
			border: 10px solid transparent;
			border-left-color: var(--surface-2);
			border-right: none;
			z-index: 2;
		}
	}

	.complete {
		background-color: var(--brand);
		color: var(--surface-1);

		&::before {
			border-left-color: var(--surface-2);
		}

		&::after {
			border-left-color: var(--brand);
		}
	}

	.last {
		&::before {
			content: none;
		}

		&::after {
			content: none;
		}
	}
</style>
