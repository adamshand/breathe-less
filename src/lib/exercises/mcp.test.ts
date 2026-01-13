import { describe, expect, it } from 'vitest'

import { mcpExercise } from './mcp'

describe('mcp mapLogToSession', () => {
	const { mapLogToSession } = mcpExercise
	const testDate = new Date('2026-01-08T07:00:00.000Z')

	it('maps log array with single CP value to session', () => {
		// Log order: [cp1] - only one value for MCP
		const log = [18]
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('mcp')
		expect(session.controlPause1).toBe(18)
		expect(session.date).toBe(testDate)
		expect(session.note).toBe('')
	})

	it('sets all other values to 0', () => {
		const log = [18]
		const session = mapLogToSession(log, testDate)

		expect(session.controlPause2).toBe(0)
		expect(session.maxPause1).toBe(0)
		expect(session.maxPause2).toBe(0)
		expect(session.maxPause3).toBe(0)
		expect(session.pulse1).toBe(0)
		expect(session.pulse2).toBe(0)
	})

	it('handles empty log array', () => {
		const log: number[] = []
		const session = mapLogToSession(log, testDate)

		expect(session.exerciseType).toBe('mcp')
		expect(session.controlPause1).toBe(0)
	})

	it('ignores extra values in log array', () => {
		const log = [18, 100, 200, 300]
		const session = mapLogToSession(log, testDate)

		expect(session.controlPause1).toBe(18)
		// Extra values should be ignored
		expect(session.controlPause2).toBe(0)
		expect(session.pulse1).toBe(0)
	})

	it('generates id from date timestamp', () => {
		const log = [18]
		const session = mapLogToSession(log, testDate)

		expect(session.id).toBe(testDate.getTime().toString())
	})

	it('handles zero CP value', () => {
		const log = [0]
		const session = mapLogToSession(log, testDate)

		expect(session.controlPause1).toBe(0)
	})

	it('handles high CP value', () => {
		const log = [120]
		const session = mapLogToSession(log, testDate)

		expect(session.controlPause1).toBe(120)
	})
})

describe('mcp exercise config', () => {
	it('has correct type', () => {
		expect(mcpExercise.type).toBe('mcp')
	})

	it('has correct name', () => {
		expect(mcpExercise.name).toBe('Morning Control Pause')
	})

	it('has correct short name', () => {
		expect(mcpExercise.shortName).toBe('MCP')
	})

	it('has minimal layout', () => {
		expect(mcpExercise.layout.length).toBe(3) // intro, cp, finished
	})

	it('layout starts with intro', () => {
		expect(mcpExercise.layout[0].shortName).toBe('start')
	})

	it('layout ends with finished', () => {
		const lastStage = mcpExercise.layout[mcpExercise.layout.length - 1]
		expect(lastStage.shortName).toBe('finished')
	})

	it('has only one logged stage (cp)', () => {
		const loggedStages = mcpExercise.layout.filter((s) => s.logged)
		expect(loggedStages.length).toBe(1)
		expect(loggedStages[0].shortName).toBe('cp')
	})
})
