<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import { SvelteMap } from 'svelte/reactivity'
	import { Line, Plot } from 'svelteplot'

	let { sessions }: { sessions: BreathingSession[] } = $props()

	function getDailyBestMp3Data(sessions: BreathingSession[]) {
		const validSessions = sessions.filter((session) => session.maxPause3 > 0)
		const dailyGroups = new SvelteMap<string, BreathingSession[]>()

		validSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!dailyGroups.has(dateKey)) {
				dailyGroups.set(dateKey, [])
			}
			dailyGroups.get(dateKey)!.push(session)
		})

		return Array.from(dailyGroups.entries())
			.map(([dateKey, daySessions]) => {
				const bestMp3 = Math.max(...daySessions.map((s) => s.maxPause3))
				return {
					date: new Date(dateKey),
					value: bestMp3,
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	const chartData = $derived.by(() => {
		if (sessions.length === 0) return []
		return getDailyBestMp3Data(sessions)
	})

	const maxValue = $derived.by(() => {
		if (chartData.length > 0) {
			const values = chartData.map((d) => d.value)
			return Math.max(...values)
		}
		return 0
	})
	$inspect(chartData, chartData.length)
</script>

<section>
	{#if chartData.length <= 2}
		<div class="single-point">
			<p>You need at least two sessions to see your progress chart.</p>
		</div>
		<!-- 		    -->
	{:else}
		<div class="chart-container">
			<div class="chart-wrapper">
				<Plot
					height={300}
					x={{ label: '' }}
					y={{ grid: true, label: '' }}
					subtitle="Best Daily Max Pause 3"
				>
					<Line
						data={chartData}
						x="date"
						y="value"
						sort="Date"
						stroke="var(--brand)"
						strokeWidth={1.5}
					/>
				</Plot>
			</div>

			<div class="chart-info">
				<p>
					You have practiced {sessions.length} sessions over {chartData.length} days.
					<br />Your best max pause is {maxValue} seconds.
				</p>
			</div>
		</div>
	{/if}
</section>

<style>
	section {
		width: 100%;
		margin-block: var(--size-3);
		padding: var(--size-4);
		background: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
	}

	.single-point {
		text-align: center;
		padding: var(--size-6);
		color: var(--text-2);

		p {
			margin-bottom: var(--size-3);
			font-size: var(--font-size-3);
		}
	}

	.chart-container {
		text-align: center;
	}

	.chart-wrapper {
		width: 100%;
		overflow-x: auto;
		min-height: 320px; /* Accommodate chart height + padding */
	}

	.chart-wrapper :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.chart-info {
		font-size: var(--font-size-1);
	}

	@media (max-width: 400px) {
		.chart-info {
			grid-template-columns: 1fr;
			text-align: center;
		}
	}
</style>
