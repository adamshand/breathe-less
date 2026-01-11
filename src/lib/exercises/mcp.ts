import type { BreathingSession } from '$lib/breathingStorage'

import type { ExerciseConfig, Stage } from './types'

const intro: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>Measure your Control Pause immediately after waking, before getting out of bed, moving around, or talking.</p>
	<p>This is your baseline indicator of progress.</p>`,
	logged: false,
	name: 'Morning Control Pause',
	shortName: 'start',
}

const cp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>Release at the first sign of discomfort.</p>`,
	logged: true,
	name: 'Control Pause',
	shortName: 'cp',
}

const finished: Stage = {
	autoStart: false,
	duration: 0,
	instructions: 'Your morning baseline has been recorded.',
	logged: false,
	name: 'Finished',
	shortName: 'finished',
}

export const mcpLayout: Stage[] = [intro, cp, finished]

function mapLogToSession(log: number[], date: Date): BreathingSession {
	return {
		controlPause1: log[0] ?? 0,
		controlPause2: 0,
		date,
		exerciseType: 'mcp',
		id: date.getTime().toString(),
		maxPause1: 0,
		maxPause2: 0,
		maxPause3: 0,
		note: '',
		pulse1: 0,
		pulse2: 0,
	}
}

export const mcpExercise: ExerciseConfig = {
	description:
		'Measure your Control Pause first thing in the morning to track your baseline progress.',
	layout: mcpLayout,
	mapLogToSession,
	name: 'Morning CP',
	shortName: 'MCP',
	type: 'mcp',
}
