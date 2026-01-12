<script lang="ts">
	import { session } from '$lib/session.svelte'

	interface Props {
		autoStart: boolean
		duration: number
		onTimerDone?: (finalValue?: number) => void
	}

	let { autoStart = false, duration, onTimerDone }: Props = $props()

	const countingUp = duration == 0
	let count = $state(duration)
	let intervalId: null | ReturnType<typeof setInterval> = $state(null)

	function playDing() {
		session.ding?.play().catch(() => {
			console.error('error with countup timer alert sound.')
		})
	}

	function playDong() {
		session.dong?.play().catch(() => {
			console.error('error with countdown timer alert sound.')
		})
	}

	function countDown() {
		session.initializeAudio()
		session.running = true

		intervalId = setInterval(() => {
			count -= 1
			if (count <= 0) {
				playDong()
				finish()
			}
		}, 1000)
	}

	function countUp() {
		session.initializeAudio()
		playDing()
		session.running = true

		intervalId = setInterval(() => {
			count += 1
		}, 1000)
	}

	function cleanup() {
		session.running = false
		// Don't reset audio objects - they persist in session state
		// Only clear the interval
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
	}

	function finish() {
		cleanup()

		if (countingUp) {
			onTimerDone?.(count)
		} else {
			onTimerDone?.()
		}
	}

	$effect(() => {
		if (autoStart) {
			if (countingUp) {
				countUp()
			} else {
				countDown()
			}
		}
		return () => {
			// clear interval when cancel() isn't called (eg. shift-cmd-r)
			cleanup()
		}
	})
</script>

<section>
	<div id="timer">
		<time aria-live="polite">{count}</time>
		<p>
			{count == 1 ? 'second' : 'seconds'}
			{countingUp ? 'elapsed' : 'remaining'}
		</p>
	</div>

	{#if session.running}
		{#if countingUp}
			<button id="cancel" onclick={finish}>Finish</button>
		{:else if session.debugging}
			<button id="cancel" onclick={finish}>Skip</button>
		{/if}
	{:else}
		<button onclick={() => (countingUp ? countUp() : countDown())}>
			Start Timer
		</button>
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
