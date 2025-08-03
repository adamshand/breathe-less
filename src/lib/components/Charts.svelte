<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import * as Plot from '@observablehq/plot'
	import { SvelteMap } from 'svelte/reactivity'

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
				const mp3Values = daySessions.map((s) => s.maxPause3)
				const dailyAverageMp3 =
					mp3Values.reduce((sum, val) => sum + val, 0) / mp3Values.length
				const lowestMp3 = Math.min(...mp3Values)
				const highestMp3 = Math.max(...mp3Values)

				return {
					averageMp3: dailyAverageMp3,
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
					averageCP1: averageCP1,
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

	const chartData = $derived.by(() => {
		if (sessions.length === 0) return []

		const mp3Data = getDailyMaxPauseData(sessions)
		const cp1Data = getDailyControlPauseData(sessions)

		// Combine data by date
		const combined = mp3Data.map((mp3Day) => {
			const cp1Day = cp1Data.find(
				(cp1) => cp1.date.getTime() === mp3Day.date.getTime(),
			)
			return {
				cp1Average: cp1Day?.averageCP1 || 0,
				cp1Lower: cp1Day?.lowestCP1 || 0,
				cp1Upper: cp1Day?.highestCP1 || 0,
				date: mp3Day.date,
				mp3Average: mp3Day.averageMp3,
				mp3Lower: mp3Day.lowestMp3,
				mp3Upper: mp3Day.highestMp3,
			}
		})

		return combined
	})

	const plotOptions = $derived({
		color: { legend: true },
		height: 500,
		marks: [
			Plot.areaY(chartData, {
				curve: 'basis',
				fill: 'var(--brand)',
				fillOpacity: 0.15,
				x: 'date',
				y1: 'mp3Lower',
				y2: 'mp3Upper',
			}),
			Plot.line(chartData, {
				curve: 'basis',
				stroke: 'var(--brand)',
				strokeOpacity: 0.6,
				strokeWidth: 2,
				x: 'date',
				y: 'mp3Average',
			}),
			Plot.areaY(chartData, {
				curve: 'basis',
				fill: 'var(--blue-7)',
				fillOpacity: 0.2,
				x: 'date',
				y1: 'cp1Lower',
				y2: 'cp1Upper',
			}),
			Plot.line(chartData, {
				curve: 'basis',
				stroke: 'var(--blue-7)',
				strokeOpacity: 0.6,
				strokeWidth: 2,
				x: 'date',
				y: 'cp1Average',
			}),
		],
		// x: { label: 'Date →' },
		y: {
			grid: true,
			// label: '↑ Seconds',
		},
	})

	const allDataPoints = $derived(chartData.length)
</script>

<section>
	{#if allDataPoints <= 2}
		<p>The chart is not shown until you have practiced for three days.</p>
	{:else}
		<ObservablePlot options={plotOptions} />
		<p>
			{sessions.length} sessions over {allDataPoints} days ({Math.round(
				(sessions.length / allDataPoints) * 10,
			) / 10} times a day)
		</p>
	{/if}
</section>

<style>
	section {
		width: 100%;
		margin-block: var(--size-3);
		padding: var(--size-3) var(--size-2);
		background: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-4);
	}
	p {
		margin-bottom: var(--size-3);
		font-size: var(--font-size-2);
		text-align: center;
	}
</style>
