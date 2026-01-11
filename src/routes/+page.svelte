<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- consistent with existing codebase patterns */
	import type { BreathingSession } from '$lib/breathingStorage'

	import { breathingStorage } from '$lib/breathingStorage'
	import { classicalExercise } from '$lib/exercises/classical'
	import { diminishedExercise } from '$lib/exercises/diminished'
	import { mcpExercise } from '$lib/exercises/mcp'
	import { onMount } from 'svelte'

	let todaysMCP: BreathingSession | null = $state(null)

	onMount(async () => {
		todaysMCP = await breathingStorage.getTodaysMCP()
	})

	const exercises = [
		{
			...classicalExercise,
			available: true,
			href: '/classical',
		},
		{
			...mcpExercise,
			available: true,
			href: '/mcp',
		},
		{
			...diminishedExercise,
			available: true,
			href: '/diminished',
		},
	]
</script>

<svelte:head>
	<title>Breathe Less | Buteyko Breathing Exercises</title>
	<meta
		name="description"
		content="Practice Buteyko breathing exercises to improve your control pause and overall breathing."
	/>
</svelte:head>

<article>
	<hgroup>
		<h1>Breathe Less</h1>
		<p>Choose an exercise to begin</p>
	</hgroup>

	<div class="exercise-grid">
		{#each exercises as exercise (exercise.type)}
			<a
				href={exercise.available ? exercise.href : undefined}
				class="exercise-card"
				class:disabled={!exercise.available}
			>
				<div class="card-content">
					<div class="card-text">
						<h2>{exercise.name}</h2>
						<p>{exercise.description}</p>
						{#if !exercise.available}
							<span class="coming-soon">Coming Soon</span>
						{/if}
					</div>
					{#if exercise.type === 'mcp'}
						<div class="mcp-badge" class:done={todaysMCP}>
							{todaysMCP ? `${todaysMCP.controlPause1}s` : '?'}
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</article>

<style>
	article {
		padding: var(--size-4);
		max-width: 800px;
		margin: 0 auto;
	}

	hgroup {
		text-align: center;
		margin-bottom: var(--size-6);

		h1 {
			font-size: var(--font-size-7);
			font-weight: var(--font-weight-6);
			color: var(--brand);
			margin: 0;
		}

		p {
			font-size: var(--font-size-3);
			color: var(--text-2);
			margin: var(--size-2) 0 0 0;
		}
	}

	.exercise-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--size-4);
	}

	.exercise-card {
		display: block;
		padding: var(--size-5);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		position: relative;

		&:hover:not(.disabled) {
			border-color: var(--brand);
			background: var(--surface-3);
			transform: translateY(-2px);
			box-shadow: var(--shadow-3);
		}

		h2 {
			font-size: var(--font-size-4);
			font-weight: var(--font-weight-6);
			color: var(--brand);
			margin: 0 0 var(--size-2) 0;
		}

		p {
			font-size: var(--font-size-2);
			color: var(--text-2);
			margin: 0;
			line-height: 1.5;
		}
	}

	.exercise-card.disabled {
		opacity: 0.6;
		cursor: not-allowed;

		h2 {
			color: var(--text-2);
		}
	}

	.coming-soon {
		display: inline-block;
		margin-top: var(--size-3);
		padding: var(--size-1) var(--size-2);
		background: var(--surface-3);
		border-radius: var(--radius-2);
		font-size: var(--font-size-0);
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.card-content {
		display: flex;
		align-items: center;
		gap: var(--size-3);
	}

	.card-text {
		flex: 1;
	}

	.mcp-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-9);
		height: var(--size-9);
		border-radius: var(--radius-round);
		border: 2px dashed var(--surface-4);
		color: var(--text-2);
		font-size: var(--font-size-2);
		font-weight: var(--font-weight-5);
		flex-shrink: 0;
	}

	.mcp-badge.done {
		border: 2px solid var(--teal-6);
		background: var(--teal-6);
		color: white;
	}
</style>
