<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import { SvelteDate, SvelteSet } from 'svelte/reactivity'
	import { AreaY, AxisX, Line, Plot } from 'svelteplot'

	let { sessions }: { sessions: BreathingSession[] } = $props()

	const DEFAULT_DAYS = 30
	let showAll = $state(false)

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

		const result: {
			avg: number
			date: Date
			high: number
			low: number
			series: string
		}[] = []

		for (const [date, sessions] of Object.entries(grouped)) {
			const cp1s = sessions.map((s) => s.controlPause1).filter((v) => v > 0)

			const mcpSessions = sessions.filter((s) => s.exerciseType === 'mcp')
			const mcpValues = mcpSessions
				.map((s) => s.controlPause1)
				.filter((v) => v > 0)

			if (cp1s.length) {
				result.push({
					avg: Math.round(cp1s.reduce((a, b) => a + b, 0) / cp1s.length),
					date: new Date(date),
					high: Math.max(...cp1s),
					low: Math.min(...cp1s),
					series: 'Control Pause',
				})
			}

			if (mcpValues.length) {
				const mcpAvg = Math.round(
					mcpValues.reduce((a, b) => a + b, 0) / mcpValues.length,
				)
				result.push({
					avg: mcpAvg,
					date: new Date(date),
					high: mcpAvg,
					low: mcpAvg,
					series: 'Morning CP',
				})
			}
		}

		return result
	}

	function filterToLastNDays(
		data: {
			avg: number
			date: Date
			high: number
			low: number
			series: string
		}[],
		days: number,
	) {
		const cutoff = new SvelteDate()
		cutoff.setDate(cutoff.getDate() - days)
		return data.filter((d) => d.date >= cutoff)
	}

	const minDays = 3
	// svelte-ignore state_referenced_locally
	const allPlotData = groupAndSummarize(sessions)
	const plotData = $derived(
		showAll ? allPlotData : filterToLastNDays(allPlotData, DEFAULT_DAYS),
	)
	const cpData = $derived(plotData.filter((d) => d.series === 'Control Pause'))
	const mcpData = $derived(plotData.filter((d) => d.series === 'Morning CP'))
	const totalDays = $derived(
		new Set(plotData.map((d) => d.date.toISOString().slice(0, 10))).size,
	)
	const allDays = $derived(
		new Set(allPlotData.map((d) => d.date.toISOString().slice(0, 10))).size,
	)
	const hasMoreData = $derived(allDays > DEFAULT_DAYS)

	const dateMarkers = $derived.by(() => {
		const uniqueDates = [
			...new Set(plotData.map((d) => d.date.toISOString().slice(0, 10))),
		]
			.map((d) => new Date(d))
			.sort((a, b) => a.getTime() - b.getTime())

		if (showAll) {
			const seen = new SvelteSet<string>()
			return uniqueDates.filter((d) => {
				const key = `${d.getFullYear()}-${d.getMonth()}`
				if (seen.has(key)) return false
				seen.add(key)
				return true
			})
		} else {
			return uniqueDates.filter((_, i) => i % 2 === 0)
		}
	})

	function formatDateLabel(d: unknown): string {
		if (!(d instanceof Date)) return ''
		if (showAll) {
			return d.toLocaleDateString('en-NZ', { month: 'short' })
		}
		return String(d.getDate())
	}
</script>

<p>
	{#if !hasMoreData}
		{sessions.length} sessions over {totalDays} days
	{:else if showAll}
		<span>
			{sessions.length} sessions over {totalDays} days
		</span>
		<span>
			<button class="toggle" onclick={() => (showAll = false)}
				>Show last {DEFAULT_DAYS} days</button
			>
		</span>
	{:else}
		Last {DEFAULT_DAYS} days
		<button class="toggle" onclick={() => (showAll = true)}
			>Show all {allDays} days</button
		>
	{/if}
</p>

<section>
	{#if totalDays < minDays}
		<p>The chart is not shown until you have practiced for {minDays} days.</p>
	{:else}
		<Plot
			height={350}
			marginBottom={25}
			x={{ axis: false }}
			y={{ grid: true, label: '↑ Seconds' }}
		>
			<AreaY
				data={cpData}
				curve="basis"
				fill="var(--surface-4)"
				fillOpacity={0.3}
				sort="date"
				x="date"
				y1="low"
				y2="high"
			/>
			<Line
				curve="basis"
				data={cpData}
				stroke="var(--surface-4)"
				strokeOpacity={0.5}
				strokeWidth={1}
				x="date"
				y="avg"
			/>
			<Line
				curve="basis"
				data={mcpData}
				stroke="var(--brand)"
				strokeWidth={2}
				x="date"
				y="avg"
			/>
			<AxisX
				ticks={dateMarkers}
				tickFormat={formatDateLabel}
				tickSize={3}
				stroke="var(--surface-4)"
				strokeOpacity={0.3}
				tickFontSize={10}
				removeDuplicateTicks={true}
			/>
		</Plot>
		<div class="legend">
			<span class="legend-item">
				<span class="swatch mcp"></span>
				Morning CP
			</span>
			<span class="legend-item">
				<span class="swatch cp"></span>
				Control Pause
			</span>
		</div>
	{/if}
</section>

<style>
	section {
		container-type: inline-size;
		overflow-x: auto;

		width: 100%;
		margin-block: var(--size-3);
		padding: var(--size-1) var(--size-3);
		background: var(--surface-2);
		border-radius: var(--radius-3);
		border: 1px solid var(--surface-4);
	}
	p {
		display: flex;
		width: 100%;
		justify-content: space-between;
		margin-bottom: var(--size-3);
		font-size: var(--font-size-1);
		text-align: center;
	}
	.toggle {
		margin-left: var(--size-2);
		padding: var(--size-1) var(--size-2);
		font-size: var(--font-size-0);
		background: transparent;
		border: 1px solid var(--surface-4);
		border-radius: var(--radius-2);
		color: var(--text-2);
		cursor: pointer;

		&:hover {
			background: var(--surface-3);
		}
	}
	.legend {
		display: flex;
		justify-content: center;
		gap: var(--size-4);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}
	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--size-1);
	}
	.swatch {
		display: inline-block;
		width: 1rem;
		height: 3px;
	}
	.swatch.mcp {
		background: var(--brand);
	}
	.swatch.cp {
		background: var(--surface-4);
		opacity: 0.5;
	}
</style>
