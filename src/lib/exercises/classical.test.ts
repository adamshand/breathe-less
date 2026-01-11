import { describe, expect, it } from 'vitest'

import { classicalExercise } from './classical'

describe('classical mapLogToSession', () => {
	const { mapLogToSession } = classicalExercise
	const testDate = new Date('2026-01-08T18:16:19.548Z')

	it('maps full log array to session', () => {
		// Log order: [pulse1, cp1, mp1, mp2, mp3, cp2, pulse2]
		const log = [60, 20, 30, 35, 40, 25, 58]
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('classical')
		expect(session.pulse1).toBe(60)
		expect(session.controlPause1).toBe(20)
		expect(session.maxPause1).toBe(30)
		expect(session.maxPause2).toBe(35)
		expect(session.maxPause3).toBe(40)
		expect(session.controlPause2).toBe(25)
		expect(session.pulse2).toBe(58)
		expect(session.date).toBe(testDate)
		expect(session.note).toBe('')
	})

	it('handles empty log array', () => {
		const log: number[] = []
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('classical')
		expect(session.pulse1).toBe(0)
		expect(session.controlPause1).toBe(0)
		expect(session.maxPause1).toBe(0)
		expect(session.maxPause2).toBe(0)
		expect(session.maxPause3).toBe(0)
		expect(session.controlPause2).toBe(0)
		expect(session.pulse2).toBe(0)
	})

	it('handles partial log array', () => {
		// Only pulse1 and cp1 recorded
		const log = [60, 20]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(60)
		expect(session.controlPause1).toBe(20)
		expect(session.maxPause1).toBe(0)
		expect(session.maxPause2).toBe(0)
		expect(session.maxPause3).toBe(0)
		expect(session.controlPause2).toBe(0)
		expect(session.pulse2).toBe(0)
	})

	it('ignores extra values in log array', () => {
		const log = [60, 20, 30, 35, 40, 25, 58, 100, 200]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(60)
		expect(session.pulse2).toBe(58)
		// Extra values should be ignored
	})

	it('generates id from date timestamp', () => {
		const log = [60, 20, 30, 35, 40, 25, 58]
		const session = mapLogToSession(log, testDate)

		expect(session.id).toBe(testDate.getTime().toString())
	})

	it('handles zero values in log', () => {
		const log = [0, 0, 0, 0, 0, 0, 0]
		const session = mapLogToSession(log, testDate)

		expect(session.pulse1).toBe(0)
		expect(session.controlPause1).toBe(0)
		expect(session.maxPause1).toBe(0)
	})
})

describe('classical exercise config', () => {
	it('has correct type', () => {
		expect(classicalExercise.type).toBe('classical')
	})

	it('has correct name', () => {
		expect(classicalExercise.name).toBe('Classical Buteyko')
	})

	it('has layout with multiple stages', () => {
		expect(classicalExercise.layout.length).toBeGreaterThan(0)
	})

	it('layout starts with intro', () => {
		expect(classicalExercise.layout[0].shortName).toBe('start')
	})

	it('layout ends with finished', () => {
		const lastStage =
			classicalExercise.layout[classicalExercise.layout.length - 1]
		expect(lastStage.shortName).toBe('finished')
	})

	it('has logged stages for pulse and cp', () => {
		const loggedStages = classicalExercise.layout.filter((s) => s.logged)
		expect(loggedStages.length).toBe(7) // pulse, cp, mp1, mp2, mp3, cp, pulse
	})
})
