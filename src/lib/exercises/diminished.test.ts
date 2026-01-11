import { describe, expect, it } from 'vitest'

import { diminishedExercise } from './diminished'

describe('diminished mapLogToSession', () => {
	const { mapLogToSession } = diminishedExercise
	const testDate = new Date('2026-01-08T18:16:19.548Z')

	it('maps full log array to session', () => {
		// Log order: [pulse1, cp1, middleCp, pulse2, cp2]
		const log = [60, 20, 22, 58, 24]
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('diminished')
		expect(session.pulse1).toBe(60)
		expect(session.controlPause1).toBe(20)
		expect(session.maxPause1).toBe(22) // middle CP stored in maxPause1
		expect(session.pulse2).toBe(58)
		expect(session.controlPause2).toBe(24)
		expect(session.date).toBe(testDate)
		expect(session.note).toBe('')
	})

	it('sets maxPause2 and maxPause3 to 0', () => {
		const log = [60, 20, 22, 58, 24]
		const session = mapLogToSession(log, testDate)

		expect(session.maxPause2).toBe(0)
		expect(session.maxPause3).toBe(0)
	})

	it('handles empty log array', () => {
		const log: number[] = []
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('diminished')
		expect(session.pulse1).toBe(0)
		expect(session.controlPause1).toBe(0)
		expect(session.maxPause1).toBe(0)
		expect(session.pulse2).toBe(0)
		expect(session.controlPause2).toBe(0)
	})

	it('handles partial log array', () => {
		// Only pulse1 and cp1 recorded
		const log = [60, 20]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(60)
		expect(session.controlPause1).toBe(20)
		expect(session.maxPause1).toBe(0)
		expect(session.pulse2).toBe(0)
		expect(session.controlPause2).toBe(0)
	})

	it('ignores extra values in log array', () => {
		const log = [60, 20, 22, 58, 24, 100, 200]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(60)
		expect(session.controlPause2).toBe(24)
		// Extra values should be ignored
	})

	it('generates id from date timestamp', () => {
		const log = [60, 20, 22, 58, 24]
		const session = mapLogToSession(log, testDate)

		expect(session.id).toBe(testDate.getTime().toString())
	})

	it('handles zero values in log', () => {
		const log = [0, 0, 0, 0, 0]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(0)
		expect(session.controlPause1).toBe(0)
		expect(session.maxPause1).toBe(0)
	})
})

describe('diminished exercise config', () => {
	it('has correct type', () => {
		expect(diminishedExercise.type).toBe('diminished')
	})

	it('has correct name', () => {
		expect(diminishedExercise.name).toBe('Diminished Breathing')
	})

	it('has layout with multiple stages', () => {
		expect(diminishedExercise.layout.length).toBeGreaterThan(0)
	})

	it('layout starts with intro', () => {
		expect(diminishedExercise.layout[0].shortName).toBe('start')
	})

	it('layout ends with finished', () => {
		const lastStage =
			diminishedExercise.layout[diminishedExercise.layout.length - 1]
		expect(lastStage.shortName).toBe('finished')
	})

	it('has logged stages for pulse and cp', () => {
		const loggedStages = diminishedExercise.layout.filter((s) => s.logged)
		expect(loggedStages.length).toBe(5) // pulse, cp, middleCp, pulse, cp
	})
})
