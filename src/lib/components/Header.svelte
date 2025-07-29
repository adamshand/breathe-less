<script lang="ts">
	import { page } from '$app/state'
	import { Menu, X } from '@lucide/svelte'
	import { fade } from 'svelte/transition'

	// import { session } from '../lib/session.svelte'

	let dialogOpen: boolean | null = $state(null)
	let dialogEl: HTMLDialogElement | null = $state(null)

	const menu = [
		{ href: '/', name: 'Practice' },
		{ href: '/instructions', name: 'Instructions' },
		{ href: '/history', name: 'History' },
		{ href: '/settings', name: 'Settings' },
		{ href: '/about', name: 'About' },
	]

	function handleClickOutside(event: MouseEvent) {
		if (dialogOpen && !dialogEl?.contains(event.target as Node)) {
			dialogOpen = false
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dialogOpen = false
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<header>
	<h1><a href="/">breathe less</a></h1>

	<nav>
		<button
			class:spinClose={dialogOpen === true}
			class:spinOpen={dialogOpen === false}
			onclick={(event) => {
				event.stopPropagation() // stops event bubbling up to handleClickOutside()
				dialogOpen = !dialogOpen
			}}
		>
			{#if dialogOpen}
				<X color="black" />
			{:else}
				<Menu color="black" />
			{/if}
		</button>

		{#if dialogOpen}
			<dialog
				bind:this={dialogEl}
				open={dialogOpen}
				transition:fade={{ duration: 200 }}
			>
				<ul data-sveltekit-preload-data="false">
					{#each menu as { href, name } (name)}
						{@const isActive = page.url.pathname === href}

						{#if isActive}
							<li class:isActive>{name}</li>
						{:else}
							<li>
								<a onclick={() => (dialogOpen = false)} {href}>{name}</a>
							</li>
						{/if}
					{/each}
				</ul>
			</dialog>
		{/if}
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding: var(--size-2) var(--size-5);
		background-color: var(--brand);

		h1 {
			margin: 0;

			a {
				color: var(--surface-1);
				font-size: var(--font-size-7);
				font-weight: var(--font-weight-9);
				text-decoration: none;
			}
		}
	}

	nav {
		button {
			all: unset;
			display: grid; /* weird, but fixes vertical centering of icon */
			font-size: var(--font-size-5);

			&:hover {
				cursor: pointer;
			}
		}

		.spinOpen {
			animation: spinOpen 0.5s ease-out;
		}
		.spinClose {
			animation: spinClose 0.5s ease-out;
		}
	}

	dialog {
		margin-block: var(--size-8) auto;
		margin-inline: auto;
		padding: var(--size-3);

		width: min(calc(480px - var(--size-4)), calc(100% - var(--size-4)));
		border: none;
		background-color: var(--brand);
		font-size: var(--font-size-4);
		font-weight: var(--font-weight-5);
		text-align: center;
		z-index: 100;

		ul {
			list-style: none;
			padding-inline: 0;

			li {
				margin-block: var(--size-2);
				color: var(--surface-1);

				&.isActive {
					padding: var(--size-2);
					border: 2px solid var(--surface-1);
					color: var(--surface-1);
				}
			}
		}

		a {
			display: inline-block;
			width: 100%;
			padding: var(--size-2);
			color: var(--surface-1);
			font-weight: var(--font-weight-5);

			text-decoration: none;

			&:hover {
				background-color: var(--surface-1);
				color: var(--brandAlt);
			}
		}
	}
	@keyframes spinClose {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(180deg);
		}
	}
	@keyframes spinOpen {
		from {
			transform: rotate(180deg);
		}
		to {
			transform: rotate(0deg);
		}
	}
</style>
