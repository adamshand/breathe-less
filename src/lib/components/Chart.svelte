<script lang="ts">
	import { type BreathingSession } from '$lib/breathingStorage'
	import { median, percentile } from '$lib/stats'
	import { SvelteDate, SvelteSet } from 'svelte/reactivity'
	import { AreaY, AxisX, Dot, Line, Plot } from 'svelteplot'

	let { sessions }: { sessions: BreathingSession[] } = $props()

	const DEFAULT_DAYS = 30
	const ROLLING_WINDOW_DAYS = 7
	const MIN_DAYS_FOR_ROLLING = 3
	let showAll = $state(false)

	type DailyStats = {
		[key: string]: Date | number | string
		date: Date
		median: number
		q1: number
		q3: number
		series: string
	}

	type RollingPoint = {
		[key: string]: Date | number
		date: Date
		median: number
	}

	function computeRollingMedian(
		data: DailyStats[],
		windowDays: number,
	): RollingPoint[] {
		if (data.length < MIN_DAYS_FOR_ROLLING) return []

		const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime())
		const result: RollingPoint[] = []

		for (let i = 0; i < sorted.length; i++) {
			const currentDate = sorted[i].date
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- non-reactive computation
			const windowStart = new Date(currentDate)
			windowStart.setDate(windowStart.getDate() - windowDays + 1)

			const windowValues = sorted
				.filter((d) => d.date >= windowStart && d.date <= currentDate)
				.map((d) => d.median)

			if (windowValues.length > 0) {
				result.push({
					date: currentDate,
					median: median(windowValues),
				})
			}
		}

		return result
	}

	function groupAndSummarize(data: BreathingSession[]): DailyStats[] {
		const grouped: Record<string, BreathingSession[]> = {}

		for (const session of data) {
			const yyyymmdd = session.localDate

			if (!grouped[yyyymmdd]) {
				grouped[yyyymmdd] = []
			}
			grouped[yyyymmdd].push(session)
		}

		const result: DailyStats[] = []

		for (const [date, sessions] of Object.entries(grouped)) {
			const cp1s = sessions
				.filter((s) => s.exerciseType !== 'mcp')
				.map((s) => s.controlPause1)
				.filter((v) => v > 0)

			const mcpSessions = sessions.filter((s) => s.exerciseType === 'mcp')
			const mcpValues = mcpSessions
				.map((s) => s.controlPause1)
				.filter((v) => v > 0)

			if (cp1s.length) {
				result.push({
					date: new Date(date),
					median: median(cp1s),
					q1: percentile(cp1s, 25),
					q3: percentile(cp1s, 75),
					series: 'Control Pause',
				})
			}

			if (mcpValues.length) {
				const mcpMedian = median(mcpValues)
				result.push({
					date: new Date(date),
					median: mcpMedian,
					q1: mcpMedian,
					q3: mcpMedian,
					series: 'Morning CP',
				})
			}
		}

		return result
	}

	function filterToLastNDays(data: DailyStats[], days: number): DailyStats[] {
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
	const rollingCpData = $derived(
		computeRollingMedian(cpData, ROLLING_WINDOW_DAYS),
	)
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
		<p>
			The chart will display when you have {minDays} practice days in the last 30
			days.
		</p>
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
				fillOpacity={0.2}
				sort="date"
				x="date"
				y1="q1"
				y2="q3"
			/>
			<Dot
				data={cpData}
				fill="var(--surface-4)"
				fillOpacity={0.5}
				r={3}
				x="date"
				y="median"
			/>
			{#if rollingCpData.length >= MIN_DAYS_FOR_ROLLING}
				<Line
					curve="basis"
					data={rollingCpData}
					stroke="var(--surface-4)"
					strokeWidth={2}
					x="date"
					y="median"
				/>
			{/if}
			<Line
				curve="basis"
				data={mcpData}
				stroke="var(--brand)"
				strokeWidth={2}
				x="date"
				y="median"
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
				<span class="swatch cp-line"></span>
				CP 7-day trend
			</span>
			<span class="legend-item">
				<span class="swatch cp-dot"></span>
				CP daily
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
	.swatch.cp-line {
		background: var(--surface-4);
	}
	.swatch.cp-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--surface-4);
		opacity: 0.5;
	}
</style>
