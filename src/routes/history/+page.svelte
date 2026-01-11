<script lang="ts">
	import {
		type BreathingSession,
		breathingStorage,
	} from '$lib/breathingStorage'
	import Chart from '$lib/components/Chart.svelte'
	import History from '$lib/components/History.svelte'
	import { onMount } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'

	let allSessions: BreathingSession[] = $state([])
	let loading = $state(true)
	let error = $state('')
	let showNotes = $state(false)

	const hasAnyNotes = $derived(allSessions.some((s) => s.note && s.note.trim()))

	const sessionsByDate = $derived.by(() => {
		const grouped = new SvelteMap<string, BreathingSession[]>()

		allSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, [])
			}
			grouped.get(dateKey)!.push(session)
		})

		grouped.forEach((sessions) => {
			sessions.sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
			)
		})

		const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
			return new Date(b[0]).getTime() - new Date(a[0]).getTime()
		})

		return new Map(sortedEntries)
	})

	onMount(async () => {
		try {
			const sessions = await breathingStorage.getAllSessions()
			allSessions = sessions
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
	{:else if error}
		<div class="error">Error: {error}</div>
	{:else if allSessions.length === 0}
		<div class="empty">
			<p>No sessions recorded yet.</p>
			<a href="/">Start your first session.</a>
		</div>
	{:else}
		<Chart sessions={allSessions} />

		{#if hasAnyNotes}
			<div class="notes-toggle-container">
				<button
					class="notes-toggle"
					class:active={showNotes}
					onclick={() => (showNotes = !showNotes)}
				>
					{showNotes ? 'Hide notes' : 'Show notes'}
				</button>
			</div>
		{/if}

		<div class="day">
			{#each Array.from(sessionsByDate.entries()) as [dateString, sessions] (dateString)}
				<History {sessions} date={dateString} {showNotes} />
			{/each}
		</div>
	{/if}
</article>

<style>
	article {
		width: 100%;
		padding: var(--size-4);
		margin: 0 auto;
	}

	hgroup {
		h1 {
			font-size: var(--font-size-6);
			font-weight: var(--font-weight-6);
			margin: 0;
		}
	}

	.notes-toggle-container {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--size-3);
	}

	.notes-toggle {
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-0);
		background: transparent;
		border: 1px solid var(--surface-4);
		border-radius: var(--radius-2);
		color: var(--text-2);
		cursor: pointer;

		&:hover {
			background: var(--surface-3);
		}

		&.active {
			background: var(--brand);
			border-color: var(--brand);
			color: var(--surface-1);
		}
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
