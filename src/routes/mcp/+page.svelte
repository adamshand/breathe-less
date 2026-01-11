<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- consistent with existing codebase patterns */
	import type { BreathingSession } from '$lib/breathingStorage'

	import { goto } from '$app/navigation'
	import { breathingStorage } from '$lib/breathingStorage'
	import Timer from '$lib/components/Timer.svelte'
	import { mcpExercise } from '$lib/exercises/mcp'
	import {
		loadTodaysSessions,
		saveMCPSession,
		session,
	} from '$lib/session.svelte'
	import { onMount } from 'svelte'

	let existingMCP: BreathingSession | null = $state(null)

	onMount(async () => {
		session.setExercise(mcpExercise)
		existingMCP = await breathingStorage.getTodaysMCP()
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

	function handleSave() {
		saveMCPSession()
	}

	$effect(() => {
		if (session.finished && session.sessionSaved) {
			if (window.umami)
				window.umami.track('Session finish', { exercise: 'mcp' })

			session.reset()
			goto('/history')
		} else {
			loadTodaysSessions()
		}
	})
</script>

<svelte:head>
	<title>Morning CP | Breathe Less</title>
	<meta
		name="description"
		content="Measure your morning Control Pause to track your baseline progress."
	/>
</svelte:head>

<section>
	<hgroup>
		<h2>{@html session.name}</h2>

		<div>{@html session.instructions}</div>
	</hgroup>

	{#if session.stage == 0}
		{#if existingMCP}
			<p class="existing-notice">
				You've already recorded your MCP today ({existingMCP.controlPause1}s).
				Recording again will update it.
			</p>
		{/if}
		<button data-umami-event="MCP begin" onclick={handleBegin}>Begin</button>
	{:else if !session.finished}
		{#key session.stage}
			<Timer
				autoStart={session.autoStart}
				duration={session.duration}
				onTimerDone={handleTimerDone}
			/>
		{/key}
	{:else if !session.sessionSaved}
		<div class="finished">
			<div class="result">
				<p class="value">{session.log[0]}s</p>
				<p class="label">Morning Control Pause</p>
			</div>
			<label>
				<span>Notes (optional)</span>
				<textarea
					bind:value={session.note}
					placeholder="How did it go?"
					rows="3"
				></textarea>
			</label>
			<button onclick={handleSave}>Save</button>
		</div>
	{/if}
</section>

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

	.existing-notice {
		font-size: var(--font-size-1);
		color: var(--text-2);
		background-color: var(--surface-2);
		padding: var(--size-3);
		border-radius: var(--radius-2);
		margin-bottom: var(--size-4);
	}

	.result {
		padding: var(--size-4);
		text-align: center;

		.value {
			font-size: var(--font-size-8);
			font-weight: var(--font-weight-7);
			color: var(--brand);
			margin: 0;
		}

		.label {
			font-size: var(--font-size-2);
			color: var(--text-2);
			margin: var(--size-2) 0 0 0;
		}
	}

	.finished {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		width: 100%;

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
