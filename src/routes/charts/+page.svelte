<script lang="ts">
	import {
		type BreathingSession,
		breathingStorage,
	} from '$lib/breathingStorage'
	import ObservablePlot from '$lib/components/ObservablePlot.svelte'
	import * as Plot from '@observablehq/plot'
	import { onMount } from 'svelte'

	let allSessions: BreathingSession[] = $state([])
	let loading = $state(true)
	let error = $state('')

	onMount(async () => {
		try {
			const sessions = await breathingStorage.getAllSessions()
			allSessions = sessions
			loading = false
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load sessions'
			loading = false
		}
	})

	function getDailyControlPauseData(sessions: BreathingSession[]) {
		const validSessions = sessions.filter(
			(session) => session.controlPause1 > 0,
		)
		const dailyGroups = new Map<string, BreathingSession[]>()

		validSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!dailyGroups.has(dateKey)) {
				dailyGroups.set(dateKey, [])
			}
			dailyGroups.get(dateKey)!.push(session)
		})

		return Array.from(dailyGroups.entries())
			.map(([dateKey, daySessions]) => {
				daySessions.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				)

				const firstSessionCP = daySessions[0].controlPause1
				const dailyAverageFirstCP =
					daySessions.reduce((sum, s) => sum + s.controlPause1, 0) /
					daySessions.length

				const firstCPs = daySessions.map((s) => s.controlPause1)
				const secondCPs = daySessions
					.filter((s) => s.controlPause2 > 0)
					.map((s) => s.controlPause2)

				const lowestFirstCP = Math.min(...firstCPs)
				const highestSecondCP =
					secondCPs.length > 0 ? Math.max(...secondCPs) : 0

				return {
					averageCP: Math.round(dailyAverageFirstCP * 10) / 10,
					date: new Date(dateKey),
					firstCP: firstSessionCP,
					highestSecondCP: highestSecondCP,
					lowestFirstCP: lowestFirstCP,
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	const chartData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return getDailyControlPauseData(allSessions)
	})

	const cpChartOptions = $derived.by(() => {
		if (chartData.length === 0) return {}

		return {
			height: 400,
			marginLeft: 60,
			marks: [
				Plot.line(chartData, {
					curve: 'monotone-x',
					stroke: 'var(--brand)',
					strokeWidth: 2,
					x: 'date',
					y: 'firstCP',
				}),
				Plot.line(chartData, {
					curve: 'monotone-x',
					stroke: 'var(--blue-6)',
					strokeDasharray: '5,5',
					strokeWidth: 2,
					x: 'date',
					y: 'averageCP',
				}),
				Plot.line(chartData, {
					curve: 'cardinal',
					stroke: 'var(--red-6)',
					strokeDasharray: '2,2',
					strokeWidth: 2,
					x: 'date',
					y: 'lowestFirstCP',
				}),
				Plot.line(chartData, {
					curve: 'cardinal',
					stroke: 'var(--green-6)',
					strokeDasharray: '8,3',
					strokeWidth: 2,
					x: 'date',
					y: 'highestSecondCP',
				}),
			],
			subtitle: 'Daily Control Pause Trends',
			x: { label: 'Date' },
			y: { grid: true, label: 'Control Pause (seconds)' },
		}
	})
</script>

<svelte:head>
	<title>Control Pause Charts | Breathe Less</title>
	<meta
		name="description"
		content="View your control pause trends over time."
	/>
</svelte:head>

<article>
	<hgroup>
		<h1>Control Pause Charts</h1>
		<p>Track your daily control pause trends</p>
	</hgroup>

	{#if loading}
		<div class="loading">Loading chart data...</div>
	{:else if error}
		<div class="error">Error: {error}</div>
	{:else if chartData.length <= 2}
		<div class="single-point">
			<p>The chart is not shown until you have practiced for three days.</p>
		</div>
	{:else}
		<div class="chart-container">
			<div class="chart-wrapper">
				<ObservablePlot options={cpChartOptions} />
			</div>

			<div class="chart-info">
				<div class="legend">
					<div class="legend-item">
						<div
							class="legend-line solid"
							style="background-color: var(--brand);"
						></div>
						<span>First CP of Day</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-line dashed"
							style="background-color: var(--blue-6);"
						></div>
						<span>Daily Average First CP</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-line dotted"
							style="background-color: var(--red-6);"
						></div>
						<span>Lowest First CP per Day</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-line medium-dashed"
							style="background-color: var(--green-6);"
						></div>
						<span>Highest Second CP per Day</span>
					</div>
				</div>
				<p>
					Tracking {allSessions.length} sessions over {chartData.length} days.
				</p>
			</div>
		</div>
	{/if}
</article>

<style>
	article {
		padding: var(--size-4);
		max-width: 800px;
		margin: 0 auto;
	}

	hgroup {
		margin-bottom: var(--size-4);

		h1 {
			font-size: var(--font-size-6);
			font-weight: var(--font-weight-6);
			margin: 0;
		}

		p {
			font-size: var(--font-size-3);
			color: var(--text-2);
			margin: var(--size-2) 0 0 0;
		}
	}

	.loading,
	.error {
		font-size: var(--font-size-3);
		text-align: center;
		padding: var(--size-6);
	}

	.error {
		color: var(--red-6);
	}

	.single-point {
		text-align: center;
		padding: var(--size-6);
		color: var(--text-2);
		background: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);

		p {
			margin-bottom: var(--size-3);
			font-size: var(--font-size-3);
		}
	}

	.chart-container {
		background: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-3);
		padding: var(--size-4);
	}

	.chart-wrapper {
		width: 100%;
		overflow-x: auto;
		min-height: 420px;
	}

	.chart-wrapper :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.chart-info {
		margin-top: var(--size-4);
		text-align: center;
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: var(--size-4);
		margin-bottom: var(--size-3);
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--size-2);
		font-size: var(--font-size-2);
	}

	.legend-line {
		width: 20px;
		height: 2px;
		border-radius: 1px;
	}

	.legend-line.dashed {
		background-image: repeating-linear-gradient(
			to right,
			var(--blue-6) 0px,
			var(--blue-6) 5px,
			transparent 5px,
			transparent 10px
		);
		background-color: transparent;
	}

	.legend-line.dotted {
		background-image: repeating-linear-gradient(
			to right,
			var(--red-6) 0px,
			var(--red-6) 2px,
			transparent 2px,
			transparent 4px
		);
		background-color: transparent;
	}

	.legend-line.medium-dashed {
		background-image: repeating-linear-gradient(
			to right,
			var(--green-6) 0px,
			var(--green-6) 8px,
			transparent 8px,
			transparent 11px
		);
		background-color: transparent;
	}

	.chart-info p {
		font-size: var(--font-size-1);
		color: var(--text-2);
		margin: 0;
	}

	@media (max-width: 400px) {
		.legend {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
