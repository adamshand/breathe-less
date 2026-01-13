import { type BreathingSession, getLocalDateTime } from '$lib/breathingStorage'

import type { ExerciseConfig, Stage } from './types'

const intro: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>Measure your control pause immediately after waking and before talking or getting out of bed. </p>
  <p>Ideally, you should do the test in the same body position in which you woke up.</p>
	<p>Learn more at <a href="https://www.normalbreathing.com/learn-why-morning-cp/">normalbreathing.com</a>.</p>`,
	logged: false,
	name: 'Morning Control Pause',
	shortName: 'start',
}

const cp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>At the first gentle urge to breathe, stop the timer and inhale.</p>
	<p>If you feel any stress, discomfort, or have the urge to breath more deeply this means you have exceeded your control pause.</p>`,
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
	const local = getLocalDateTime(date)
	return {
		controlPause1: log[0] ?? 0,
		controlPause2: 0,
		date,
		exerciseType: 'mcp',
		id: date.getTime().toString(),
		localDate: local.localDate,
		localTime: local.localTime,
		maxPause1: 0,
		maxPause2: 0,
		maxPause3: 0,
		note: '',
		pulse1: 0,
		pulse2: 0,
		timezone: local.timezone,
	}
}

export const mcpExercise: ExerciseConfig = {
	description:
		'Your morning control pause is one of the best ways to track your progress.',
	layout: mcpLayout,
	mapLogToSession,
	name: 'Morning Control Pause',
	shortName: 'MCP',
	type: 'mcp',
}
