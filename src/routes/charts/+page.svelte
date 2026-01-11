<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Map used in pure functions, not reactive state */
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

	function getMCPData(sessions: BreathingSession[]) {
		const mcpSessions = sessions.filter(
			(s) => s.exerciseType === 'mcp' && s.controlPause1 > 0,
		)

		const dailyMCP = new Map<string, number>()
		mcpSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!dailyMCP.has(dateKey)) {
				dailyMCP.set(dateKey, session.controlPause1)
			}
		})

		return Array.from(dailyMCP.entries())
			.map(([dateKey, mcp]) => ({
				date: new Date(dateKey),
				mcp,
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	function getDailyCP1BandData(sessions: BreathingSession[]) {
		const nonMcpSessions = sessions.filter(
			(s) => s.exerciseType !== 'mcp' && s.controlPause1 > 0,
		)

		const dailyGroups = new Map<string, BreathingSession[]>()
		nonMcpSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!dailyGroups.has(dateKey)) {
				dailyGroups.set(dateKey, [])
			}
			dailyGroups.get(dateKey)!.push(session)
		})

		return Array.from(dailyGroups.entries())
			.map(([dateKey, daySessions]) => {
				const cp1Values = daySessions.map((s) => s.controlPause1)
				const lowestCP1 = Math.min(...cp1Values)
				const highestCP1 = Math.max(...cp1Values)

				return {
					cp1High: highestCP1,
					cp1Low: lowestCP1,
					date: new Date(dateKey),
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	const mcpData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return getMCPData(allSessions)
	})

	const cp1BandData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return getDailyCP1BandData(allSessions)
	})

	const hasEnoughData = $derived(mcpData.length >= 3 || cp1BandData.length >= 3)

	const chartOptions = $derived.by(() => {
		if (!hasEnoughData) return {}

		const marks = []

		if (cp1BandData.length >= 3) {
			marks.push(
				Plot.areaY(cp1BandData, {
					curve: 'monotone-x',
					fill: 'var(--brand)',
					fillOpacity: 0.2,
					x: 'date',
					y1: 'cp1Low',
					y2: 'cp1High',
				}),
			)
		}

		if (mcpData.length >= 3) {
			marks.push(
				Plot.line(mcpData, {
					curve: 'monotone-x',
					stroke: 'var(--teal-6)',
					strokeWidth: 2,
					x: 'date',
					y: 'mcp',
				}),
			)
		}

		return {
			height: 400,
			marginLeft: 60,
			marks,
			subtitle: 'Morning CP and Daily CP Range',
			x: { label: 'Date' },
			y: { grid: true, label: 'Control Pause (seconds)' },
		}
	})

	const totalDays = $derived(
		new Set([
			...cp1BandData.map((d) => d.date.toDateString()),
			...mcpData.map((d) => d.date.toDateString()),
		]).size,
	)
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
		<p>Track your progress over time</p>
	</hgroup>

	{#if loading}
		<div class="loading">Loading chart data...</div>
	{:else if error}
		<div class="error">Error: {error}</div>
	{:else if !hasEnoughData}
		<div class="single-point">
			<p>The chart is not shown until you have practiced for three days.</p>
		</div>
	{:else}
		<div class="chart-container">
			<div class="chart-wrapper">
				<ObservablePlot options={chartOptions} />
			</div>

			<div class="chart-info">
				<div class="legend">
					{#if mcpData.length >= 3}
						<div class="legend-item">
							<div
								class="legend-line solid"
								style="background-color: var(--teal-6);"
							></div>
							<span>Morning CP (MCP)</span>
						</div>
					{/if}
					{#if cp1BandData.length >= 3}
						<div class="legend-item">
							<div
								class="legend-area"
								style="background-color: var(--brand); opacity: 0.2;"
							></div>
							<span>Daily CP1 Range (High-Low)</span>
						</div>
					{/if}
				</div>
				<p>
					Tracking {allSessions.length} sessions over {totalDays} days.
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

	.legend-area {
		width: 20px;
		height: 12px;
		border-radius: 2px;
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
