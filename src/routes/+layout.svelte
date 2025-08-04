<script lang="ts">
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import 'open-props/buttons.min.css'
	import 'open-props/masks.edges.min.css'
	import 'open-props/masks/corner-cuts'
	import 'open-props/masks/edges'
	import 'open-props/open-props.min.css'
	import 'open-props/src/props.masks.edges.css'
	import '$lib/style.css'
	import FavIcon from '$lib/components/FavIcon.svelte'
	import Header from '$lib/components/Header.svelte'

	let { children } = $props()

	const staging = $derived(page.url.hostname.startsWith('dev.'))

	const sitename = 'breathe.adam.nz'
	const title = 'breathe less'
	const description =
		'Timer for tracking progress on Buteyko maximum pause exercise.'
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<!-- PWA Manifest -->
	<link rel="manifest" href="/manifest.json" />

	<!-- PWA Meta Tags -->
	<meta name="theme-color" content="#f97316" />
	<meta name="background-color" content="#1a1a1a" />

	<!-- Apple PWA Meta Tags -->
	<meta name="mobile-web-app-capable" content="yes" />
	<meta
		name="apple-mobile-web-app-status-bar-style"
		content="black-translucent"
	/>
	<meta name="apple-mobile-web-app-title" content="Breathe" />
	<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

	<!-- Microsoft PWA Meta Tags -->
	<meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
	<meta name="msapplication-TileColor" content="#1a1a1a" />

	<!-- Additional PWA Icons -->
	<link
		rel="icon"
		type="image/png"
		sizes="96x96"
		href="/icons/icon-96x96.png"
	/>
	<link
		rel="icon"
		type="image/png"
		sizes="72x72"
		href="/icons/icon-72x72.png"
	/>

	<!-- SEO and Social -->
	<link rel="canonical" href={`https://${sitename}/`} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`https://${sitename}/`} />
	<meta
		property="og:image"
		content={`https://${sitename}/icons/icon-512x512.png`}
	/>
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:site_name" content={title} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	<!-- Prevent zooming on mobile -->
	<meta
		name="viewport"
		content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
	/>
</svelte:head>

<FavIcon />

<div class:dev class:staging>
	<Header />
	{@render children()}
</div>

<style>
	:global(:root) {
		color-scheme: dark;
		--brand: var(--yellow-8);
		--brandAlt: var(--yellow-6);
		--text-1: var(--gray-0);
		--text-2: var(--gray-2);
		--surface-1: var(--gray-10);
		--surface-2: var(--gray-9);
		--surface-3: var(--gray-8);
		--surface-4: var(--gray-7);
		--surface-shadow: var(--surface-shadow-dark);
		--shadow-strength: var(--shadow-strength-dark);
	}
	:global(body) {
		background-color: var(--surface-2);
		font-family: var(--font-humanist);
	}
	:global(a) {
		font-weight: var(--font-weight-4);

		&:hover {
			color: var(--brandAlt);
			text-decoration: none;
		}
	}
	div {
		display: grid;
		grid-template-rows: auto 1fr auto;

		margin: 0 auto;
		padding: 0;

		width: 100%;
		max-width: 480px;
		height: 100dvh;
		height: 100svh;
		color: var(--text-1);
	}

	.dev {
		border-top: 3px solid crimson;
	}
	.staging {
		border-top: 3px solid darkgoldenrod;
	}
</style>
