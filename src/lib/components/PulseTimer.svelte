<script lang="ts">
	import { session } from '$lib/session.svelte'
	import { settings } from '$lib/settings.svelte'

	interface Props {
		onPulseRecorded?: (pulseValue: number) => void
	}

	let { onPulseRecorded }: Props = $props()

	let count = $state(15)
	let intervalId: null | ReturnType<typeof setInterval> = $state(null)
	let countingDown = $state(true)
	let pulseInput = $state('')
	let pulseInputElement = $state<HTMLInputElement>()

	let directEntryMode = $derived(settings.hasPulseTracker)

	function playDing() {
		session.ding?.play().catch(() => {
			console.error('error with countdown timer start sound.')
		})
	}

	function playDong() {
		session.dong?.play().catch(() => {
			console.error('error with countdown timer alert sound.')
		})
	}

	function startCountdown() {
		session.initializeAudio()
		session.running = true
		count = 15
		playDing()

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
		countingDown = false
		// Auto-focus the input after a brief delay
		setTimeout(() => {
			pulseInputElement?.focus()
		}, 100)
	}

	function handleSubmit() {
		const inputValue = String(pulseInput).trim()
		const pulseCount = parseInt(inputValue)
		if (isNaN(pulseCount) || pulseCount <= 0) return

		const pulseBPM = directEntryMode ? pulseCount : pulseCount * 4
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
	{#if directEntryMode}
		<p class="direct-instruction">Enter your pulse rate from your smartwatch</p>
		<div id="pulse-input">
			<input
				bind:this={pulseInputElement}
				bind:value={pulseInput}
				type="number"
				placeholder="Heart rate (BPM)"
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
	{:else if countingDown}
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
			<input
				bind:this={pulseInputElement}
				bind:value={pulseInput}
				type="number"
				placeholder="Number of heartbeats"
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

	.direct-instruction {
		color: var(--text-2);
		font-size: var(--font-size-2);
		margin-bottom: var(--size-4);
	}

	#timer {
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
		height: 100%;
		background-color: var(--surface-2);
		border-radius: 1rem;
		text-align: center;

		input {
			width: 100%;
			margin-bottom: 2rem;
			padding: var(--size-4);
			border: 2px solid var(--brand);
			border-radius: var(--radius-2);
			background-color: var(--surface-2);
			font-size: var(--font-size-3);
			text-align: center;
		}

		input:focus {
			outline: none;
			border-color: var(--orange-);
			box-shadow: 0 0 0 2px var(--orange-);
		}
	}

	button {
		width: 100%;
		border-radius: var(--radius-5);
		box-shadow: none;
		background-color: var(--brand);
		color: var(--surface-1);
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
		background-color: var(--brand);
	}

	#cancel:hover {
		background-color: var(--surface-1);
		color: var(--brand);
	}
</style>
