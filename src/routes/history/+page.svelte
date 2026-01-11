<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- consistent with existing codebase patterns */
	import { page } from '$app/state'
	import {
		type BreathingSession,
		breathingStorage,
		type ExerciseType,
	} from '$lib/breathingStorage'
	import Chart from '$lib/components/Chart.svelte'
	import History from '$lib/components/History.svelte'
	import { onMount } from 'svelte'
	import { SvelteMap } from 'svelte/reactivity'

	let allSessions: BreathingSession[] = $state([])
	let loading = $state(true)
	let error = $state('')

	const exerciseFilter = $derived(
		(page.url.searchParams.get('exercise') as ExerciseType | null) || 'all',
	)

	const filteredSessions = $derived(
		exerciseFilter === 'all'
			? allSessions
			: allSessions.filter((s) => s.exerciseType === exerciseFilter),
	)

	const sessionsByDate = $derived.by(() => {
		const grouped = new SvelteMap<string, BreathingSession[]>()

		filteredSessions.forEach((session) => {
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

	const exerciseTypes = [
		{ label: 'All Exercises', value: 'all' },
		{ label: 'Classical Buteyko', value: 'classical' },
		{ label: 'Diminished Breathing', value: 'diminished' },
		{ label: 'Morning CP', value: 'mcp' },
	]
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
		<div class="filter-bar">
			<label for="exercise-filter">Filter by exercise:</label>
			<select
				id="exercise-filter"
				value={exerciseFilter}
				onchange={(e) => {
					const value = e.currentTarget.value
					const url = new URL(window.location.href)
					if (value === 'all') {
						url.searchParams.delete('exercise')
					} else {
						url.searchParams.set('exercise', value)
					}
					window.history.replaceState({}, '', url)
				}}
			>
				{#each exerciseTypes as { label, value } (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		{#if sessionsByDate.size === 0}
			<div class="empty">
				<p>No sessions found for this exercise type.</p>
			</div>
		{:else}
			<Chart sessions={filteredSessions} />

			<div class="day">
				{#each Array.from(sessionsByDate.entries()) as [dateString, sessions] (dateString)}
					<History {sessions} date={dateString} />
				{/each}
			</div>
		{/if}
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
	}

	.filter-bar {
		display: flex;
		align-items: center;
		gap: var(--size-3);
		margin-bottom: var(--size-4);
		padding: var(--size-3);
		background: var(--surface-2);
		border-radius: var(--radius-2);

		label {
			font-size: var(--font-size-2);
			color: var(--text-2);
		}

		select {
			padding: var(--size-2) var(--size-3);
			border: 1px solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-1);
			color: var(--text-1);
			font-size: var(--font-size-2);
			cursor: pointer;

			&:focus {
				outline: 2px solid var(--brand);
				outline-offset: 2px;
			}
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
