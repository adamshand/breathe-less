<script lang="ts">
	import {
		type BreathingSession,
		breathingStorage,
	} from '$lib/breathingStorage'
	import { onMount } from 'svelte'
	import * as Plot from '@observablehq/plot'
	import ObservablePlot from '$lib/components/ObservablePlot.svelte'

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
				// Sort sessions by time to get first session of the day
				daySessions.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				)

				const firstSessionCP = daySessions[0].controlPause1
				// Calculate daily average of first CP from each session (controlPause1 only)
				const dailyAverageFirstCP =
					daySessions.reduce((sum, s) => sum + s.controlPause1, 0) /
					daySessions.length

				// Get lowest first CP and highest second CP for the day
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

	function getDailyMaxPauseData(sessions: BreathingSession[]) {
		const validSessions = sessions.filter((session) => session.maxPause3 > 0)
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
				// Calculate daily average of all mp3 values
				const dailyAverageMp3 =
					daySessions.reduce((sum, s) => sum + s.maxPause3, 0) /
					daySessions.length

				// Calculate average of mp1, mp2, mp3 for each session, then average those daily
				const sessionAverages = daySessions.map(
					(s) => (s.maxPause1 + s.maxPause2 + s.maxPause3) / 3,
				)
				const dailyAverageAllMp =
					sessionAverages.reduce((sum, avg) => sum + avg, 0) /
					sessionAverages.length

				// Find lowest and highest mp3 for the day
				const mp3Values = daySessions.map((s) => s.maxPause3)
				const lowestMp3 = Math.min(...mp3Values)
				const highestMp3 = Math.max(...mp3Values)

				return {
					averageAllMp: Math.round(dailyAverageAllMp * 10) / 10,
					averageMp3: Math.round(dailyAverageMp3 * 10) / 10,
					date: new Date(dateKey),
					highestMp3: highestMp3,
					lowestMp3: lowestMp3,
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	}

	const chartData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return getDailyControlPauseData(allSessions)
	})

	const maxPauseChartData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return getDailyMaxPauseData(allSessions)
	})

	const personalBestData = $derived.by(() => {
		if (allSessions.length === 0) return []
		return allSessions
			.filter(
				(session) => session.personalBest.maxPause3 && session.maxPause3 > 0,
			)
			.map((session) => ({
				date: new Date(session.date),
				value: session.maxPause3,
			}))
			.sort((a, b) => a.date.getTime() - b.date.getTime())
	})

	const bandChartData = $derived.by(() => {
		if (allSessions.length === 0) return []
		
		const mp3Data = getDailyMaxPauseData(allSessions)
		
		// Calculate CP1 data manually since we need different structure
		const validSessions = allSessions.filter(session => session.controlPause1 > 0)
		const dailyGroups = new Map<string, BreathingSession[]>()

		validSessions.forEach((session) => {
			const dateKey = new Date(session.date).toDateString()
			if (!dailyGroups.has(dateKey)) {
				dailyGroups.set(dateKey, [])
			}
			dailyGroups.get(dateKey)!.push(session)
		})

		const cp1Data = Array.from(dailyGroups.entries())
			.map(([dateKey, daySessions]) => {
				const firstCPs = daySessions.map((s) => s.controlPause1)
				const lowestCP1 = Math.min(...firstCPs)
				const highestCP1 = Math.max(...firstCPs)
				const averageCP1 = firstCPs.reduce((sum, cp) => sum + cp, 0) / firstCPs.length

				return {
					date: new Date(dateKey),
					lowestCP1,
					highestCP1,
					averageCP1
				}
			})
			.sort((a, b) => a.date.getTime() - b.date.getTime())
		
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

	const cpChartOptions = $derived.by(() => {
		if (chartData.length === 0) return {}
		
		return {
			height: 400,
			marginLeft: 60,
			y: { grid: true, label: "Control Pause (seconds)" },
			x: { label: "Date" },
			subtitle: "Daily Control Pause Trends",
			marks: [
				Plot.line(chartData, { 
					x: "date", 
					y: "firstCP", 
					stroke: "var(--brand)", 
					strokeWidth: 2,
					curve: "monotone-x"
				}),
				Plot.line(chartData, { 
					x: "date", 
					y: "averageCP", 
					stroke: "var(--blue-6)", 
					strokeWidth: 2,
					strokeDasharray: "5,5",
					curve: "monotone-x"
				}),
				Plot.line(chartData, { 
					x: "date", 
					y: "lowestFirstCP", 
					stroke: "var(--red-6)", 
					strokeWidth: 2,
					strokeDasharray: "2,2",
					curve: "cardinal"
				}),
				Plot.line(chartData, { 
					x: "date", 
					y: "highestSecondCP", 
					stroke: "var(--green-6)", 
					strokeWidth: 2,
					strokeDasharray: "8,3",
					curve: "cardinal"
				})
			]
		}
	})

	const maxPauseChartOptions = $derived.by(() => {
		if (maxPauseChartData.length === 0) return {}
		
		return {
			height: 400,
			marginLeft: 60,
			y: { grid: true, label: "Max Pause (seconds)" },
			x: { label: "Date" },
			subtitle: "Daily Max Pause Trends",
			marks: [
				Plot.line(maxPauseChartData, { 
					x: "date", 
					y: "averageMp3", 
					stroke: "var(--green-6)", 
					strokeWidth: 2,
					curve: "monotone-x"
				}),
				Plot.line(maxPauseChartData, { 
					x: "date", 
					y: "averageAllMp", 
					stroke: "var(--purple-6)", 
					strokeWidth: 2,
					strokeDasharray: "5,5",
					curve: "monotone-x"
				}),
				Plot.line(maxPauseChartData, { 
					x: "date", 
					y: "lowestMp3", 
					stroke: "var(--red-6)", 
					strokeWidth: 2,
					strokeDasharray: "2,2",
					curve: "cardinal"
				}),
				Plot.line(maxPauseChartData, { 
					x: "date", 
					y: "highestMp3", 
					stroke: "var(--cyan-6)", 
					strokeWidth: 2,
					strokeDasharray: "10,5",
					curve: "cardinal"
				}),
				...(personalBestData.length > 0 ? [
					Plot.dot(personalBestData, { 
						x: "date", 
						y: "value", 
						fill: "var(--yellow-6)", 
						strokeWidth: 2,
						r: 2
					})
				] : [])
			]
		}
	})

	const bandChartOptions = $derived.by(() => {
		if (bandChartData.length === 0) return {}
		
		return {
			height: 400,
			marginLeft: 60,
			y: { grid: true, label: "Seconds" },
			x: { label: "Date" },
			subtitle: "Daily MP3 and CP1 Range with Averages",
			marks: [
				// MP3 Band
				Plot.areaY(bandChartData, { 
					x: "date", 
					y1: "mp3Lower", 
					y2: "mp3Upper", 
					fill: "var(--orange-6)", 
					fillOpacity: 0.3,
					curve: "monotone-x"
				}),
				// CP1 Band  
				Plot.areaY(bandChartData, { 
					x: "date", 
					y1: "cp1Lower", 
					y2: "cp1Upper", 
					fill: "var(--blue-6)", 
					fillOpacity: 0.25,
					curve: "monotone-x"
				}),
				// Average lines
				Plot.line(bandChartData, { 
					x: "date", 
					y: "mp3Average", 
					stroke: "var(--orange-8)", 
					strokeWidth: 3,
					curve: "monotone-x"
				}),
				Plot.line(bandChartData, { 
					x: "date", 
					y: "cp1Average", 
					stroke: "var(--blue-8)", 
					strokeWidth: 3,
					curve: "monotone-x"
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

		{#if maxPauseChartData.length <= 2}
			<div class="single-point">
				<p>
					The max pause chart is not shown until you have practiced for three
					days.
				</p>
			</div>
		{:else}
			<div class="chart-container">
				<div class="chart-wrapper">
					<ObservablePlot options={maxPauseChartOptions} />
				</div>

				<div class="chart-info">
					<div class="legend">
						<div class="legend-item">
							<div
								class="legend-line solid"
								style="background-color: var(--green-6);"
							></div>
							<span>Average MP3 per Day</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-line dashed"
								style="background-color: var(--purple-6);"
							></div>
							<span>Average MP1,2,3 per Session</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-line dotted"
								style="background-color: var(--red-6);"
							></div>
							<span>Lowest MP3 per Day</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-line long-dashed"
								style="background-color: var(--cyan-6);"
							></div>
							<span>Highest MP3 per Day</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-dot"
								style="background-color: var(--yellow-6); border: 2px solid var(--yellow-9);"
							></div>
							<span>Personal Best MP3</span>
						</div>
					</div>
				</div>
			</div>

			<div class="chart-container">
				<div class="chart-wrapper">
					<ObservablePlot options={bandChartOptions} />
				</div>

				<div class="chart-info">
					<div class="legend">
						<div class="legend-item">
							<div
								class="legend-area"
								style="background-color: var(--orange-6); opacity: 0.3;"
							></div>
							<span>Daily MP3 Range (High-Low)</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-line solid thick"
								style="background-color: var(--orange-8);"
							></div>
							<span>Average MP3 per Day</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-area"
								style="background-color: var(--blue-6); opacity: 0.25;"
							></div>
							<span>Daily CP1 Range (High-Low)</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-line solid thick"
								style="background-color: var(--blue-8);"
							></div>
							<span>Average CP1 per Day</span>
						</div>
						<div class="legend-item">
							<div
								class="legend-star"
								style="color: var(--yellow-6); border-color: var(--yellow-9);"
							>
								★
							</div>
							<span>Personal Best MP3</span>
						</div>
					</div>
					<p>
						Bands show daily ranges between highest and lowest values for MP3
						and first Control Pause (CP1).
					</p>
				</div>
			</div>
		{/if}
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

	.legend-line.long-dashed {
		background-image: repeating-linear-gradient(
			to right,
			var(--cyan-6) 0px,
			var(--cyan-6) 10px,
			transparent 10px,
			transparent 15px
		);
		background-color: transparent;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		box-sizing: border-box;
	}

	.legend-area {
		width: 20px;
		height: 12px;
		border-radius: 2px;
	}

	.legend-line.thick {
		height: 3px;
	}

	.legend-star {
		font-size: 14px;
		line-height: 1;
		text-align: center;
		width: 20px;
		height: 20px;
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
		}
	}
</style>
