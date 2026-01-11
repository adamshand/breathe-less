import type { BreathingSession } from '$lib/breathingStorage'

import type { ExerciseConfig, Stage } from './types'

const intro: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>The Diminished Breathing exercise is a gentler variation of the Classical Buteyko exercise.</p>
	<p>It focuses on reduced breathing without maximum pauses, making it suitable for those with lower control pauses.</p>`,
	logged: false,
	name: 'Diminished Breathing Exercise',
	shortName: 'start',
}

const relaxStart: Stage = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Find a comfortable position and allow your body to relax.</p>
	<p>Breathe naturally and let go of any tension.</p>`,
	logged: false,
	name: 'Relax',
	shortName: 'relax',
}

const pulse: Stage = {
	autoStart: false,
	duration: 15,
	instructions: `<p>Find your pulse in your neck or wrist. Count the number of heartbeats during the timer.</p>`,
	logged: true,
	name: 'Pulse',
	shortName: 'p',
}

const cp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>Release the hold at the first sign of discomfort.</p>`,
	logged: true,
	name: 'Control Pause',
	shortName: 'cp',
}

const diminishedBreathing: Stage = {
	autoStart: true,
	duration: 300,
	instructions: `
	<p>Practice reduced breathing by taking smaller, gentler breaths.</p>
	<p>Maintain a mild air hunger throughout.</p>`,
	logged: false,
	name: 'Diminished Breathing',
	shortName: 'db',
}

const middleCp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>Release the hold at the first sign of discomfort.</p>`,
	logged: true,
	name: 'Control Pause',
	shortName: 'cp',
}

const relaxEnd: Stage = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Allow your breathing to return to normal.</p>
	<p>Rest and observe how you feel.</p>`,
	logged: false,
	name: 'Relax',
	shortName: 'relax',
}

const finished: Stage = {
	autoStart: false,
	duration: 0,
	instructions:
		'Well done! You have completed the Diminished Breathing exercise.',
	logged: false,
	name: 'Finished',
	shortName: 'finished',
}

export const diminishedLayout: Stage[] = [
	intro,
	relaxStart,
	pulse,
	cp,
	diminishedBreathing,
	middleCp,
	{ ...diminishedBreathing },
	relaxEnd,
	{ ...pulse },
	{ ...cp },
	finished,
]

function mapLogToSession(log: number[], date: Date): BreathingSession {
	return {
		controlPause1: log[1] ?? 0,
		controlPause2: log[4] ?? 0,
		date,
		exerciseType: 'diminished',
		id: date.getTime().toString(),
		maxPause1: log[2] ?? 0,
		maxPause2: 0,
		maxPause3: 0,
		note: '',
		pulse1: log[0] ?? 0,
		pulse2: log[3] ?? 0,
	}
}

export const diminishedExercise: ExerciseConfig = {
	description:
		'A gentler variation focusing on reduced breathing without maximum pauses.',
	layout: diminishedLayout,
	mapLogToSession,
	name: 'Diminished Breathing',
	shortName: 'Diminished',
	type: 'diminished',
}
