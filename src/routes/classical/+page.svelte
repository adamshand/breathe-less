<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- consistent with existing codebase patterns */
	import { goto } from '$app/navigation'
	import PulseTimer from '$lib/components/PulseTimer.svelte'
	import Stages from '$lib/components/Stages.svelte'
	import Timer from '$lib/components/Timer.svelte'
	import { classicalExercise } from '$lib/exercises/classical'
	import { loadTodaysSessions, saveSession, session } from '$lib/session.svelte'
	import { onMount } from 'svelte'

	onMount(() => {
		session.setExercise(classicalExercise)
	})

	function handleBegin() {
		session.stage = 1
		session.sessionSaved = false
		session.saveError = ''
		session.date = new Date()
		session.log = []
	}

	if (session.debugging) {
		console.log('Debug mode: true')
	}

	function handleTimerDone(finalValue: number | undefined) {
		if (finalValue != undefined) {
			session.log.push(finalValue)
		}
		session.stage++
	}

	function handlePulseRecorded(pulseValue: number) {
		session.log.push(pulseValue)
		session.stage++
	}

	function handleSave() {
		saveSession()
	}

	const isPulseStage = $derived(
		session.layout[session.stage]?.shortName === 'p',
	)

	$effect(() => {
		if (session.finished && session.sessionSaved) {
			if (window.umami)
				window.umami.track('Session finish', { exercise: 'classical' })

			session.reset()
			goto('/history')
		} else {
			loadTodaysSessions()
		}
	})
</script>

<svelte:head>
	<title>Classical Buteyko | Breathe Less</title>
	<meta
		name="description"
		content="Practice the Classical Buteyko Maximum Pause breathing exercise."
	/>
</svelte:head>

<section>
	<hgroup>
		<h2>{@html session.name}</h2>

		<div>{@html session.instructions}</div>
	</hgroup>

	{#if session.stage == 0}
		<button data-umami-event="Session begin" onclick={handleBegin}>Begin</button
		>
	{:else if session.finished && !session.sessionSaved}
		<div class="finished">
			<p>Well done!</p>
			<label>
				<span>Notes (optional)</span>
				<textarea
					bind:value={session.note}
					placeholder="How did it go?"
					rows="3"
				></textarea>
			</label>
			<button onclick={handleSave}>Save Session</button>
		</div>
	{:else}
		{#key session.stage}
			{#if isPulseStage}
				<PulseTimer onPulseRecorded={handlePulseRecorded} />
			{:else}
				<Timer
					autoStart={session.autoStart}
					duration={session.duration}
					onTimerDone={handleTimerDone}
				/>
			{/if}
		{/key}
	{/if}
</section>

<Stages log={session.log} />

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		flex: 1;

		margin: 1rem;
		text-align: center;
		font-size: var(--font-size-3);
	}
	h2 {
		font-size: var(--font-size-6);
		font-weight: var(--font-weight-5);
	}

	button {
		width: 100%;
		background-color: var(--brand);
		color: var(--surface-1);
		border-radius: var(--radius-5);
		box-shadow: none;

		font-family: var(--font-humanist);
		font-size: var(--font-size-5);
		font-weight: var(--font-weight-5);
		cursor: pointer;
	}
	button:hover {
		background-color: var(--surface-1);
		color: var(--brand);
	}

	.finished {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		width: 100%;

		p {
			font-size: var(--font-size-5);
			color: var(--brand);
		}

		label {
			display: flex;
			flex-direction: column;
			gap: var(--size-2);
			text-align: left;

			span {
				font-size: var(--font-size-2);
				color: var(--text-2);
			}
		}

		textarea {
			width: 100%;
			padding: var(--size-2);
			border: 1px solid var(--surface-4);
			border-radius: var(--radius-2);
			background: var(--surface-3);
			color: var(--text-1);
			font-family: var(--font-humanist);
			font-size: var(--font-size-2);
			resize: vertical;

			&:focus {
				outline: 2px solid var(--brand);
				outline-offset: 2px;
			}
		}
	}
</style>
