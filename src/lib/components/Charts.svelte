<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import { SvelteMap } from 'svelte/reactivity'
	import * as Plot from '@observablehq/plot'
	import ObservablePlot from './ObservablePlot.svelte'

	let { sessions }: { sessions: BreathingSession[] } = $props()

	function getDailyMaxPauseData(sessions: BreathingSession[]) {
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
				// Calculate daily average of all mp3 values
				const mp3Values = daySessions.map((s) => s.maxPause3)
				const dailyAverageMp3 =
					mp3Values.reduce((sum, val) => sum + val, 0) / mp3Values.length

				// Find lowest and highest mp3 for the day
				const lowestMp3 = Math.min(...mp3Values)
				const highestMp3 = Math.max(...mp3Values)

				return {
					averageMp3: Math.round(dailyAverageMp3 * 10) / 10,
					date: new Date(dateKey),
					highestMp3: highestMp3,
					lowestMp3: lowestMp3,
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	function getDailyControlPauseData(sessions: BreathingSession[]) {
		const validSessions = sessions.filter(
			(session) => session.controlPause1 > 0,
		)
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
				const firstCPs = daySessions.map((s) => s.controlPause1)
				const lowestCP1 = Math.min(...firstCPs)
				const highestCP1 = Math.max(...firstCPs)
				const averageCP1 =
					firstCPs.reduce((sum, cp) => sum + cp, 0) / firstCPs.length

				return {
					averageCP1: Math.round(averageCP1 * 10) / 10,
					date: new Date(dateKey),
					highestCP1,
					lowestCP1,
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	function getMp3PersonalBestData(sessions: BreathingSession[]) {
		return sessions
			.filter(
				(session) => session.personalBest.maxPause3 && session.maxPause3 > 0,
			)
			.map((session) => ({
				date: new Date(session.date),
				value: session.maxPause3,
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	const maxPauseChartData = $derived.by(() => {
		if (sessions.length === 0) return []
		return getDailyMaxPauseData(sessions)
	})

	const cp1ChartData = $derived.by(() => {
		if (sessions.length === 0) return []
		return getDailyControlPauseData(sessions)
	})

	const personalBestData = $derived.by(() => {
		if (sessions.length === 0) return []
		return getMp3PersonalBestData(sessions)
	})

	const chartData = $derived.by(() => {
		if (sessions.length === 0) return []
		
		const mp3Data = getDailyMaxPauseData(sessions)
		const cp1Data = getDailyControlPauseData(sessions)
		
		// Combine data by date
		const combined = mp3Data.map(mp3Day => {
			const cp1Day = cp1Data.find(cp1 => cp1.date.getTime() === mp3Day.date.getTime())
			return {
				date: mp3Day.date,
				mp3Lower: mp3Day.lowestMp3,
				mp3Upper: mp3Day.highestMp3,
				mp3Average: mp3Day.averageMp3,
				cp1Lower: cp1Day?.lowestCP1 || 0,
				cp1Upper: cp1Day?.highestCP1 || 0,
				cp1Average: cp1Day?.averageCP1 || 0
			}
		})
		
		return combined
	})

	const plotOptions = $derived.by(() => {
		if (chartData.length === 0) return {}
		
		return {
			height: 350,
			marginLeft: 60,
			y: { grid: true, label: "↑ Seconds" },
			x: { label: "Date →" },
			marks: [
				// MP3 Band
				Plot.areaY(chartData, { 
					x: "date", 
					y1: "mp3Lower", 
					y2: "mp3Upper", 
					fill: "var(--orange-6)", 
					fillOpacity: 0.3,
					curve: "basis"
				}),
				// CP1 Band  
				Plot.areaY(chartData, { 
					x: "date", 
					y1: "cp1Lower", 
					y2: "cp1Upper", 
					fill: "var(--blue-6)", 
					fillOpacity: 0.25,
					curve: "basis"
				}),
				// Average lines
				Plot.line(chartData, { 
					x: "date", 
					y: "mp3Average", 
					stroke: "var(--orange-8)", 
					strokeWidth: 2,
					curve: "basis"
				}),
				Plot.line(chartData, { 
					x: "date", 
					y: "cp1Average", 
					stroke: "var(--blue-8)", 
					strokeWidth: 2,
					curve: "basis"
				}),
				// Personal bests
				...(personalBestData.length > 0 ? [
					Plot.dot(personalBestData, { 
						x: "date", 
						y: "value", 
						fill: "var(--yellow-6)", 
						stroke: "var(--yellow-9)",
						strokeWidth: 2,
						r: 4,
						symbol: "star"
					})
				] : [])
			]
		}
	})

	const maxMp3Value = $derived.by(() => {
		if (chartData.length > 0) {
			const values = chartData.map((d) => d.mp3Average)
			return Math.max(...values)
		}
		return 0
	})

	const allDataPoints = $derived.by(() => {
		return chartData.length
	})
</script>

<section>
	{#if allDataPoints <= 2}
		<div class="single-point">
			<p>The chart is not shown until you have practiced for three days.</p>
		</div>
		<!-- 		    -->
	{:else}
		<div class="chart-container">
			<div class="chart-wrapper">
				<ObservablePlot options={plotOptions} />
			</div>

			<div class="chart-info">
				<div class="legend">
					<div class="legend-item">
						<div
							class="legend-area"
							style="background-color: var(--orange-6); opacity: 0.3;"
						></div>
						<span>Daily MP3 Range</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-line solid thick"
							style="background-color: var(--orange-8);"
						></div>
						<span>Average MP3</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-area"
							style="background-color: var(--blue-6); opacity: 0.25;"
						></div>
						<span>Daily CP1 Range</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-line solid thick"
							style="background-color: var(--blue-8);"
						></div>
						<span>Average CP1</span>
					</div>
					<div class="legend-item">
						<div
							class="legend-star"
							style="color: var(--yellow-6); border-color: var(--yellow-9);"
						>
							★
						</div>
						<span>Personal Best</span>
					</div>
				</div>
				<p>
					{sessions.length} sessions over {chartData.length} days. Best MP3: {maxMp3Value}s.
					{#if personalBestData.length > 0}
						{personalBestData.length} personal best{personalBestData.length === 1 ? '' : 's'}!
					{/if}
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
		min-height: 370px; /* Accommodate chart height + padding */
	}

	.chart-wrapper :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.chart-info {
		text-align: center;
		margin-top: var(--size-3);
	}

	.legend {
		display: flex;
		justify-content: center;
		gap: var(--size-3);
		margin-bottom: var(--size-2);
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--size-1);
		font-size: var(--font-size-1);
	}

	.legend-area {
		width: 16px;
		height: 10px;
		border-radius: 2px;
	}

	.legend-line {
		width: 16px;
		height: 2px;
		border-radius: 1px;
	}

	.legend-line.thick {
		height: 3px;
	}

	.legend-star {
		font-size: 12px;
		line-height: 1;
		text-align: center;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
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
			gap: var(--size-2);
		}
	}
</style>
