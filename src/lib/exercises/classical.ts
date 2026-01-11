import type { BreathingSession } from '$lib/breathingStorage'

import type { ExerciseConfig, Stage } from './types'

const intro: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
  <p>This exercise should be performed four times a day. Before breakfast, lunch, dinner and bed.</p> 
  <p>Do not practice for two hours after a meal or more than four times a day.</p> 
  <p>Learn more about this exercise by <a href="/instructions">reading the instructions</a>, 
	or by taking a free five-day beginners course from <a href="https://www.learnbuteykoonline.net/" 
	target="_blank">Learn Buteyko Online</a>.</p>`,
	logged: false,
	name: 'Classical Buteyko Exercise',
	shortName: 'start',
}

const finished: Stage = {
	autoStart: false,
	duration: 0,
	instructions: 'You have accumulated CO2, congratulations!',
	logged: false,
	name: 'Finished',
	shortName: 'finished',
}

const pulse: Stage = {
	autoStart: false,
	duration: 15,
	instructions: `<p>Find your pulse in your neck or wrist.  Count the number of heartbeats during the timer.</p>`,
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

const vsb: Stage = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Use shallow belly breathing to maintain gentle air hunger.</p>
	<p>Adjust the depth of breath to maintain air hunger while making 
	sure that your belly stays relaxed.</p>`,
	logged: false,
	name: 'Very Shallow Breathing',
	shortName: 'vsb',
}

const suppress: Stage = {
	autoStart: true,
	duration: 10,
	instructions: `
	<p>Strongly suppress the urge to take deep breaths by using very rapid and shallow breaths.</p>`,
	logged: false,
	name: 'Suppress',
	shortName: 'suppress',
}

const recover: Stage = {
	autoStart: true,
	duration: 30,
	instructions: `<p>Allow your body to breathe naturally and let the sense of air hunger fade.</p>`,
	logged: false,
	name: 'Recover',
	shortName: 'recover',
}

const mp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: '',
	logged: true,
	name: '',
	shortName: 'mp',
}

export const classicalLayout: Stage[] = [
	intro,
	pulse,
	cp,
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Light Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Hold as long as	you can 
		while remaining relaxed and still.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 1',
	},
	suppress,
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Medium Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Use rocking and
		twisting to help extend the breath hold.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 2',
	},
	{ ...suppress, duration: 20 },
	vsb,
	recover,

	{
		...mp,
		instructions: `<h3>Full Effort</h3>
		<p>After a normal exhale, pinch your nose and hold your breath. Add walking to help extend the breath hold.</p>`,
		name: 'Maximum Pause',
		shortName: 'mp 3',
	},
	{ ...suppress, duration: 30 },
	vsb,
	{ ...recover, duration: 60 },

	cp,
	pulse,
	finished,
]

function mapLogToSession(log: number[], date: Date): BreathingSession {
	return {
		controlPause1: log[1] ?? 0,
		controlPause2: log[5] ?? 0,
		date,
		exerciseType: 'classical',
		id: date.getTime().toString(),
		maxPause1: log[2] ?? 0,
		maxPause2: log[3] ?? 0,
		maxPause3: log[4] ?? 0,
		note: '',
		pulse1: log[0] ?? 0,
		pulse2: log[6] ?? 0,
	}
}

export const classicalExercise: ExerciseConfig = {
	description:
		'The full Buteyko Maximum Pause exercise with three breath holds of increasing intensity.',
	layout: classicalLayout,
	mapLogToSession,
	name: 'Classical Buteyko',
	shortName: 'Classical',
	type: 'classical',
}
