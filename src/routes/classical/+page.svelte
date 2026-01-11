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

		if (session.finished) {
			saveSession()
		}
	}

	function handlePulseRecorded(pulseValue: number) {
		session.log.push(pulseValue)
		session.stage++

		if (session.finished) {
			saveSession()
		}
	}

	const isPulseStage = $derived(
		session.layout[session.stage]?.shortName === 'p',
	)

	$effect(() => {
		if (session.finished && session.sessionSaved) {
			if (window.umami)
				window.umami.track('Session finish', { exercise: 'classical' })

			session.reset()
			goto('/history?exercise=classical')
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
		justify-content: space-between;
		align-items: center;

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
</style>
