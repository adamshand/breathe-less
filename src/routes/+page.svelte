<script lang="ts">
	import { goto } from '$app/navigation'
	import PulseTimer from '$lib/components/PulseTimer.svelte'
	import Stages from '$lib/components/Stages.svelte'
	import Timer from '$lib/components/Timer.svelte'
	import { loadTodaysSessions, saveSession, session } from '$lib/session.svelte'
	import { layout } from '$lib/timers'

	function handleBegin() {
		session.stage = 1
		session.sessionSaved = false
		session.saveError = ''
		session.date = new Date()
		session.log = []
	}

	function handleTimerDone(finalValue: number | undefined) {
		// console.log('handleTimerDone()', { stage: session.stage }, { finalValue })

		if (finalValue != undefined) {
			session.log.push(finalValue)
		}
		session.stage++

		if (session.finished) {
			saveSession()
		}
	}

	function handlePulseRecorded(pulseValue: number) {
		// console.log('handlePulseRecorded()', { stage: session.stage }, { pulseValue })
		session.log.push(pulseValue)
		session.stage++

		if (session.finished) {
			saveSession()
		}
	}

	// Helper to determine if current stage is a pulse stage
	const isPulseStage = $derived(layout[session.stage]?.shortName === 'p')

	$effect(() => {
		if (session.finished) {
			// TODO: also send total number of sessions and days
			if (window.umami) window.umami.track('Session finish')

			session.stage = 0 // TODO: is this a hack?
			goto('/history')
		} else {
			loadTodaysSessions()
		}
	})
</script>

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
