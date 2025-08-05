<script lang="ts">
	import {
		type BreathingSession,
		breathingStorage,
	} from '$lib/breathingStorage'
	import Chart from '$lib/components/Chart.svelte'
	import History from '$lib/components/History.svelte'
	import { onMount } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'

	let sessionsByDate: Map<string, BreathingSession[]> = $state(new Map())
	let allSessions: BreathingSession[] = $state([])
	let loading = $state(true)
	let error = $state('')

	onMount(async () => {
		try {
			const sessions = await breathingStorage.getAllSessions()
			allSessions = sessions

			// Group sessions by date
			const grouped = new SvelteMap<string, BreathingSession[]>()

			sessions.forEach((session) => {
				const dateKey = new Date(session.date).toDateString()
				if (!grouped.has(dateKey)) {
					grouped.set(dateKey, [])
				}
				grouped.get(dateKey)!.push(session)
			})

			// Sort each day's sessions by date (newest first)
			grouped.forEach((sessions) => {
				sessions.sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				)
			})

			// Sort dates in descending order (newest first)
			const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
				return new Date(b[0]).getTime() - new Date(a[0]).getTime()
			})

			sessionsByDate = new Map(sortedEntries)
			loading = false
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load sessions'
			loading = false
		}
	})
</script>

<svelte:head>
	<title>Practice History | Breathe Less</title>
	<meta name="description" content="View your practice history." />
</svelte:head>

<article>
	<hgroup>
		<h1>Practice History</h1>
	</hgroup>

	{#if loading}
		<div class="loading">Loading history ...</div>
		<!--  -->
	{:else if error}
		<div class="error">Error: {error}</div>
		<!--  -->
	{:else if sessionsByDate.size === 0}
		<div class="empty">
			<p>No sessions recorded yet.</p>
			<a href="/">Start your first session.</a>
		</div>
		<!--  -->
	{:else}
		<Chart sessions={allSessions} />

		<div class="day">
			{#each Array.from(sessionsByDate.entries()) as [dateString, sessions] (dateString)}
				<History {sessions} date={dateString} />
			{/each}
		</div>
	{/if}
</article>

<style>
	article {
		padding: var(--size-4);
		margin: 0 auto;
	}

	hgroup {
		h1 {
			font-size: var(--font-size-6);
			font-weight: var(--font-weight-6);
			margin: 0;
		}

		/* p {
			font-size: var(--font-size-3);
		} */
	}

	.loading,
	.error {
		font-size: var(--font-size-3);
		text-align: center;
	}

	.error {
		color: var(--red-6);
	}

	.empty {
		text-align: center;
		padding: var(--size-8);
		color: var(--text-2);

		p {
			margin-bottom: var(--size-4);
			font-size: var(--font-size-4);
		}

		a {
			color: var(--brand);
			text-decoration: none;
			font-weight: var(--font-weight-5);
			padding: var(--size-3) var(--size-4);
			border: 1px solid var(--brand);
			border-radius: var(--radius-2);
			transition: all 0.2s ease;
		}

		a:hover {
			background-color: var(--brand);
			color: var(--surface-1);
		}
	}
</style>
