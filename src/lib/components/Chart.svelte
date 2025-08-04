<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import { AreaY, Line, Plot } from 'svelteplot'

	let { sessions }: { sessions: BreathingSession[] } = $props()

	function groupAndSummarize(data: BreathingSession[]) {
		const grouped: Record<string, BreathingSession[]> = {}

		for (const session of data) {
			const dateObj = new Date(session.date)
			const yyyymmdd = dateObj.toISOString().slice(0, 10)

			if (!grouped[yyyymmdd]) {
				grouped[yyyymmdd] = []
			}
			grouped[yyyymmdd].push(session)
		}

		const result = []

		for (const [date, sessions] of Object.entries(grouped)) {
			const cp1s = sessions.map((s) => s.controlPause1)
			const mp3s = sessions.map((s) => s.maxPause3)

			if (cp1s.length) {
				result.push({
					avg: Math.round(cp1s.reduce((a, b) => a + b, 0) / cp1s.length),
					date: new Date(date),
					high: Math.max(...cp1s),
					low: Math.min(...cp1s),
					series: 'Control Pause 1',
				})
			}

			if (mp3s.length) {
				result.push({
					avg: Math.round(mp3s.reduce((a, b) => a + b, 0) / mp3s.length),
					date: new Date(date),
					high: Math.max(...mp3s),
					low: Math.min(...mp3s),
					series: 'Max Pause 3',
				})
			}
		}

		return result
	}

	const minDays = 3
	const plotData = groupAndSummarize(sessions)
	const totalSessions = $derived(sessions.length)
	const totalDays = $derived(
		new Set(plotData.map((d) => d.date.toISOString().slice(0, 10))).size,
	)
</script>

<p>
	{totalSessions} sessions over {totalDays} days ({Math.round(
		(totalSessions / totalDays) * 10,
	) / 10} times a day)
</p>
<section>
	{#if totalDays < minDays}
		<p>The chart is not shown until you have practiced for {minDays} days.</p>
	{:else}
		<Plot
			color={{ legend: true }}
			height={350}
			x={{ label: 'Date →' }}
			y={{ grid: true, label: '↑ Seconds' }}
		>
			<AreaY
				data={plotData}
				curve="basis"
				fill="series"
				fillOpacity={0.2}
				sort="date"
				x="date"
				y1="low"
				y2="high"
			/>
			<Line
				curve="basis"
				data={plotData}
				sort={(p: { series: string }) => /Control/.test(p.series)}
				stroke="series"
				strokeWidth={1.5}
				x="date"
				y="avg"
			/>
		</Plot>
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
		overflow-x: auto;
		container-type: inline-size;
	}
	p {
		margin-bottom: var(--size-3);
		font-size: var(--font-size-1);
		text-align: center;
	}
</style>
