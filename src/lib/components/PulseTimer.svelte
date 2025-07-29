<script lang="ts">
	import { session } from '$lib/session.svelte'

	interface Props {
		onPulseRecorded?: (pulseValue: number) => void
	}

	let { onPulseRecorded }: Props = $props()

	let count = $state(15)
	let intervalId: null | ReturnType<typeof setInterval> = $state(null)
	let countdownComplete = $state(false)
	let pulseInput = $state('')
	let pulseInputElement = $state<HTMLInputElement>()

	function playDong() {
		session.dong?.play().catch(() => {
			console.error('error with countdown timer alert sound.')
		})
	}

	function startCountdown() {
		session.initializeAudio()
		session.running = true
		count = 15

		intervalId = setInterval(() => {
			count -= 1
			if (count <= 0) {
				playDong()
				completeCountdown()
			}
		}, 1000)
	}

	function completeCountdown() {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
		countdownComplete = true
		// Auto-focus the input after a brief delay
		setTimeout(() => {
			pulseInputElement?.focus()
		}, 100)
	}

	function handleSubmit() {
		const inputValue = String(pulseInput).trim()
		const pulseCount = parseInt(inputValue)
		if (isNaN(pulseCount) || pulseCount <= 0) return

		const pulseBPM = pulseCount * 4
		session.running = false
		onPulseRecorded?.(pulseBPM)
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit()
		}
	}

	function cleanup() {
		session.running = false
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
	}

	$effect(() => {
		return () => {
			cleanup()
		}
	})
</script>

<section>
	{#if !countdownComplete}
		<div id="timer">
			<time aria-live="polite">{count}</time>
			<p>
				{count == 1 ? 'second' : 'seconds'} remaining
			</p>
		</div>

		{#if session.running}
			{#if session.debugging}
				<button id="cancel" onclick={completeCountdown}>Skip</button>
			{/if}
		{:else}
			<button onclick={startCountdown}>Start Timer</button>
		{/if}
	{:else}
		<div id="pulse-input">
			<h3>Enter Pulse Count</h3>
			<p>How many heartbeats did you count?</p>
			<input
				bind:this={pulseInputElement}
				bind:value={pulseInput}
				type="number"
				min="1"
				placeholder="Enter count"
				onkeydown={handleKeydown}
			/>
			<button
				onclick={handleSubmit}
				disabled={!String(pulseInput).trim() ||
					isNaN(parseInt(String(pulseInput)))}
			>
				Record Pulse
			</button>
		</div>
	{/if}
</section>

<style>
	section {
		width: 100%;
	}

	#timer {
		margin: 2rem auto;
		padding-block: 1rem;
		background-color: var(--surface-2);
		color: var(--orange-);
		border-radius: 1rem;

		time {
			font-size: 5rem;
		}
		p {
			margin-top: 0;
			font-size: var(--font-size-2);
			font-style: italic;
			letter-spacing: 0.7px;
		}
	}

	#pulse-input {
		margin: 2rem auto;
		padding: 2rem;
		background-color: var(--surface-2);
		border-radius: 1rem;
		text-align: center;

		h3 {
			margin-top: 0;
			color: var(--brand);
			font-size: var(--font-size-4);
		}

		p {
			margin-bottom: 1.5rem;
			font-size: var(--font-size-2);
			color: var(--text-2);
		}

		input {
			width: 100%;
			max-width: 200px;
			margin-bottom: 1rem;
			padding: 0.75rem;
			font-size: var(--font-size-3);
			text-align: center;
			border: 2px solid var(--brand);
			border-radius: var(--radius-2);
			background-color: var(--surface-1);
		}

		input:focus {
			outline: none;
			border-color: var(--orange-);
			box-shadow: 0 0 0 2px var(--orange-);
		}
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

	button:hover:not(:disabled) {
		background-color: var(--surface-1);
		color: var(--brand);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	#cancel {
		background-color: var(--red-6);
	}

	#cancel:hover {
		background-color: var(--surface-1);
		color: var(--red-6);
	}
</style>
