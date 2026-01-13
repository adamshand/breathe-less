<script lang="ts">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Map/Date used in pure functions, not reactive state */
	import type { BreathingSession } from '$lib/breathingStorage'

	interface Props {
		sessions: BreathingSession[]
	}

	let { sessions }: Props = $props()

	const MAX_DAYS = 14
	const TARGET_SESSIONS = 3

	interface DayData {
		count: number
		date: Date
		isFuture: boolean
		isToday: boolean
	}

	function getQualifyingSessions(
		sessions: BreathingSession[],
	): BreathingSession[] {
		return sessions.filter(
			(s) => s.exerciseType === 'classical' || s.exerciseType === 'diminished',
		)
	}

	function groupByDate(sessions: BreathingSession[]): Map<string, number> {
		const counts = new Map<string, number>()
		for (const session of sessions) {
			const dateKey = new Date(session.date).toDateString()
			counts.set(dateKey, (counts.get(dateKey) || 0) + 1)
		}
		return counts
	}

	function getFirstSessionDate(sessions: BreathingSession[]): Date | null {
		if (sessions.length === 0) return null
		const earliest = sessions.reduce((min, s) =>
			new Date(s.date) < new Date(min.date) ? s : min,
		)
		const date = new Date(earliest.date)
		date.setHours(0, 0, 0, 0)
		return date
	}

	function daysBetween(date1: Date, date2: Date): number {
		const msPerDay = 24 * 60 * 60 * 1000
		return Math.floor((date2.getTime() - date1.getTime()) / msPerDay)
	}

	function calculateStreaks(sessionsByDate: Map<string, number>): {
		currentStreak: number
		goodStreak: number
		streakSessions: number
	} {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		let currentStreak = 0
		let streakSessions = 0
		let checkDate = new Date(today)

		// Check if today has sessions - if not, start checking from yesterday
		// but don't break the streak (today is "in progress")
		const todayKey = today.toDateString()
		const todayCount = sessionsByDate.get(todayKey) || 0

		if (todayCount > 0) {
			currentStreak = 1
			streakSessions = todayCount
			checkDate.setDate(checkDate.getDate() - 1)
		} else {
			checkDate.setDate(checkDate.getDate() - 1)
		}

		// Count consecutive days going backwards
		while (true) {
			const dateKey = checkDate.toDateString()
			const count = sessionsByDate.get(dateKey) || 0
			if (count > 0) {
				currentStreak++
				streakSessions += count
				checkDate.setDate(checkDate.getDate() - 1)
			} else {
				break
			}
		}

		// Calculate "good streak" (consecutive days with 3+ sessions)
		let goodStreak = 0
		checkDate = new Date(today)

		if (todayCount >= TARGET_SESSIONS) {
			goodStreak = 1
			checkDate.setDate(checkDate.getDate() - 1)
		} else {
			// If today doesn't have 3+, start from yesterday
			checkDate.setDate(checkDate.getDate() - 1)
		}

		while (true) {
			const dateKey = checkDate.toDateString()
			const count = sessionsByDate.get(dateKey) || 0
			if (count >= TARGET_SESSIONS) {
				goodStreak++
				checkDate.setDate(checkDate.getDate() - 1)
			} else {
				break
			}
		}

		return { currentStreak, goodStreak, streakSessions }
	}

	function generateDayData(
		sessionsByDate: Map<string, number>,
		firstSessionDate: Date | null,
	): DayData[] {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const days: DayData[] = []

		// Determine the start date for the 14-day window
		// Growing mode: start from first session date, pad with future days
		// Rolling mode: start from 13 days ago (today is rightmost)
		// No sessions: start from today, pad with future days
		const startDate = new Date(today)
		const daysSinceFirst = firstSessionDate
			? daysBetween(firstSessionDate, today)
			: 0

		if (daysSinceFirst >= MAX_DAYS - 1) {
			// Rolling mode: show last 14 days ending at today
			startDate.setDate(today.getDate() - (MAX_DAYS - 1))
		} else if (firstSessionDate) {
			// Growing mode: start from first session date
			startDate.setTime(firstSessionDate.getTime())
		}
		// else: no sessions, startDate is today

		for (let i = 0; i < MAX_DAYS; i++) {
			const date = new Date(startDate)
			date.setDate(startDate.getDate() + i)
			const dateKey = date.toDateString()
			const isFuture = date > today
			const isToday = date.toDateString() === today.toDateString()
			days.push({
				count: isFuture ? 0 : sessionsByDate.get(dateKey) || 0,
				date,
				isFuture,
				isToday,
			})
		}

		return days
	}

	const qualifyingSessions = $derived(getQualifyingSessions(sessions))
	const sessionsByDate = $derived(groupByDate(qualifyingSessions))
	const firstSessionDate = $derived(getFirstSessionDate(qualifyingSessions))
	const streaks = $derived(calculateStreaks(sessionsByDate))
	const days = $derived(generateDayData(sessionsByDate, firstSessionDate))
	const firstRowDays = $derived(days.slice(0, 7))
	const secondRowDays = $derived(days.slice(7))
	const avgPerDay = $derived(
		streaks.currentStreak > 0
			? (streaks.streakSessions / streaks.currentStreak).toFixed(1)
			: '0',
	)
	const hasData = $derived(qualifyingSessions.length > 0)
</script>

<div class="streak-widget">
	<div class="stats">
		{#if !hasData}
			<span class="stat">Start your streak today!</span>
		{:else if streaks.currentStreak === 0}
			<span class="stat">Start your streak today!</span>
		{:else}
			<span class="stat">{streaks.currentStreak} day practice streak </span>
			{#if streaks.goodStreak > 0}
				<span class="stat">{avgPerDay} / day </span>
			{/if}
		{/if}
	</div>
	<div class="days">
		<div class="row">
			{#each firstRowDays as day (day.date.toISOString())}
				<div
					class="day"
					class:missed={(day.count === 0 && !day.isToday) || day.isFuture}
					class:low={day.count > 0 && day.count < TARGET_SESSIONS}
					class:good={day.count >= TARGET_SESSIONS}
					class:today={day.isToday && day.count === 0}
				>
					{#if day.count > 0}
						<span class="count">{day.count}</span>
					{:else if !day.isFuture && !day.isToday}
						<span class="count">0</span>
					{/if}
				</div>
			{/each}
		</div>
		<div class="row">
			{#each secondRowDays as day (day.date.toISOString())}
				<div
					class="day"
					class:missed={(day.count === 0 && !day.isToday) || day.isFuture}
					class:low={day.count > 0 && day.count < TARGET_SESSIONS}
					class:good={day.count >= TARGET_SESSIONS}
					class:today={day.isToday && day.count === 0}
				>
					{#if day.count > 0}
						<span class="count">{day.count}</span>
					{:else if !day.isFuture && !day.isToday}
						<span class="count">0</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	<center class="stat">
		{streaks.goodStreak} day optimal practice streak
	</center>
</div>

<style>
	center.stat {
		margin-top: var(--size-3);
	}
	.streak-widget {
		padding: var(--size-4);
		background: var(--surface-2);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3);
	}

	.stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--size-3);
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.stat {
		font-size: var(--font-size-2);
		color: var(--text-2);
	}

	.days {
		display: flex;
		flex-direction: column;
		gap: var(--size-1);
	}

	.row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--size-1);
		width: 100%;
	}

	.day {
		aspect-ratio: 1;
		width: 100%;
		border-radius: var(--radius-round);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-2);
		font-weight: var(--font-weight-5);
	}

	.day.missed {
		background: var(--surface-3);
		border: 1px solid var(--surface-4);
		color: var(--brand);
	}

	.day.today {
		background: transparent;
		border: 2px dashed var(--brand);
	}

	.day.low {
		background: transparent;
		border: 2px solid var(--brand);
		color: var(--brand);
	}

	.day.good {
		background: var(--brand);
		border: 2px solid var(--brand);
		color: var(--surface-1);
	}

	.count {
		line-height: 1;
	}
</style>
