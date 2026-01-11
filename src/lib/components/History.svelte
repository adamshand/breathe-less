<script lang="ts">
	import type { BreathingSession, ExerciseType } from '$lib/breathingStorage'

	import { CheckIcon, ClipboardCopyIcon } from '@lucide/svelte'

	let { date, sessions }: { date: string; sessions: BreathingSession[] } =
		$props()

	let copied = $state(false)

	const sortedSessions = $derived(
		[...sessions].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		),
	)

	function displayValue(value: number): string {
		return value === 0 ? '-' : String(value)
	}

	function getExerciseBadge(type: ExerciseType): string {
		switch (type) {
			case 'classical':
				return 'C'
			case 'diminished':
				return 'D'
			case 'mcp':
				return 'M'
		}
	}

	async function copyHTML() {
		const copiedHTML = document.getElementById('copyme')

		if (copiedHTML) {
			const clipboardItem = new ClipboardItem({
				'text/html': new Blob([copiedHTML.outerHTML], {
					type: 'text/html',
				}),
				'text/plain': new Blob([copiedHTML.outerText.trim()], {
					type: 'text/plain',
				}),
			})

			await navigator.clipboard.write([clipboardItem])
		}
		copied = true

		setTimeout(() => {
			copied = false
		}, 2000)
	}
</script>

<section>
	<h3>
		{new Date(date).toLocaleDateString('en-NZ', {
			day: 'numeric',
			month: 'long',
			weekday: 'long',
			year: 'numeric',
		})}

		<button title="Copy to clipboard" onclick={copyHTML}>
			{#if copied}
				<span style="font-size: var(--font-size-0)">Copied</span>
				<CheckIcon color="var(--brand)" size={8} strokeWidth={2} />
			{:else}
				<ClipboardCopyIcon color="var(--brand)" size={8} strokeWidth={2} />
			{/if}
		</button>
	</h3>

	{#if sortedSessions.length > 0}
		<table id="copyme">
			<thead>
				<tr>
					<th></th>
					<th>Time</th> <th>P1</th> <th>CP1</th> <th>MP1</th> <th>MP2</th>
					<th>MP3</th>
					<th>CP2</th> <th>P2</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedSessions as session (session.id)}
					<tr>
						<td
							><span title={session.exerciseType} class="exercise-badge"
								>{getExerciseBadge(session.exerciseType)}</span
							></td
						>
						<td>
							{new Date(session.date).toLocaleTimeString('en-NZ', {
								hour: '2-digit',
								hour12: true,
								minute: '2-digit',
							})}
						</td>
						<td>{displayValue(session.pulse1)}</td>
						<td>{displayValue(session.controlPause1)}</td>
						<td>{displayValue(session.maxPause1)}</td>
						<td>{displayValue(session.maxPause2)}</td>
						<td>{displayValue(session.maxPause3)}</td>
						<td>{displayValue(session.controlPause2)}</td>
						<td>{displayValue(session.pulse2)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</section>

<style>
	section {
		width: 100%;
	}

	h3 {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;

		margin-left: var(--size-1);
		color: var(--brand);
		font-size: var(--font-size-3);
		text-align: left;

		button {
			padding: var(--size-2);
			border: none;
			cursor: pointer;
			font-size: var(--font-size-1);

			&:hover {
				box-shadow: unset;
				background-color: var(--surface-4);
				color: white;
			}
		}
	}

	table {
		width: 100%;
		margin-inline: auto;
		border-collapse: collapse;
		color: var(--text-1);
		font-size: var(--font-size-1);
		font-weight: var(--font-weight-4);

		thead {
			background-color: var(--brand);
			color: var(--surface-1);
		}
		th,
		td {
			padding: var(--size-2) var(--size-1);

			border-bottom: 1px solid var(--surface-3);
			text-align: center;
		}
		thead th {
			background-color: var(--surface-2);
			color: var(--text-1);
			border-bottom: 1px solid var(--brand);
		}

		tbody > tr:hover {
			background-color: var(--surface-3);
		}
	}

	.exercise-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		padding-top: 3px;
		padding-right: 0px;
		border: 1.5px solid var(--brand);
		border-radius: var(--radius-round);
		color: var(--brand);
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-9);
	}
</style>
