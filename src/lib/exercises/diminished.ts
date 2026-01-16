import { type BreathingSession, getLocalDateTime } from '$lib/breathingStorage'

import type { ExerciseConfig, Stage } from './types'

const intro: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>This exercise should be performed at least three times a day. Do not practice for two hours after a meal.</p> 
	<p>This is a gentle exercise which teaches you to reduce your breathing though relaxation.</p>
	<p>Learn more about this exercise by <a href="/instructions">reading the instructions</a> or <a href="https://www.breathingclinics.nz/practitioner-directory">taking a course</a>.</p>
	`,
	logged: false,
	name: 'Diminished Breathing Exercise',
	shortName: 'start',
}

const relaxStart: Stage = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Find a quiet spot with fresh air and allow your pulse and nervous system to settle.</p>
	<p>Sit with good posture, back straight, belly relaxed, knees slightly below your hips, and feet flat on the floor.</p>`,
	logged: false,
	name: 'Settle',
	shortName: 'settle',
}

const pulse: Stage = {
	autoStart: false,
	duration: 15,
	instructions: `
	<p>Find your pulse in your wrist and start the timer. Count the number of heartbeats during the timer.</p>
	<p>If you have a device which tracks your pulse, you can disable the timer in <a href="/settings">Settings</a>.</p>
	`,
	logged: true,
	name: 'Pulse',
	shortName: 'p',
}

const cp: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>After a normal inhale and exhale, hold your breath and pinch your nose shut.</p>
	<p>At the first gentle urge to breathe, stop the timer and inhale.</p>
	<p>If you feel any stress, discomfort, or have the desire to breath more deeply 
	this means you have exceeded your control pause.</p>
	`,
	logged: true,
	name: 'Control Pause',
	shortName: 'cp',
}

const diminishedBreathing: Stage = {
	autoStart: true,
	duration: 300,
	instructions: `
<p>Slowly relax all the muscles in your body. Starting at the top of your body and working your way down to your feet.</p>  
<p>As you relax you will notice that your breathing naturally reduces.  There is no need to control your breath.</p>
<p>Try and find a level of light air hunger that you can maintain for the entire five minutes.</p>
	`,
	logged: false,
	name: 'Diminished Breathing',
	shortName: 'db',
}

const ep: Stage = {
	autoStart: false,
	duration: 0,
	instructions: `
	<p>Without taking a break, pinch your nose and hold your breath until moderate air hunger.</p>
<p>If your control pause is below 20s, be gentle.  Hold until light air hunger or take a few minutes break.</p>
	`,
	logged: true,
	name: 'Extended Pause',
	shortName: 'ep',
}

const groundAndOrient: Stage = {
	autoStart: true,
	duration: 180,
	instructions: `
	<p>Allow the air hunger to fade and your breathing to settle. You feel relaxed and calm.</p>
<p>It can help to imagine yourself grounded down and into the earth.</p>
<p>Pay attention to your surroundings, taking note of any features, and reorienting to your environment.</p>
	`,
	logged: false,
	name: 'Ground & Orient',
	shortName: 'gao',
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
	ep,
	{ ...diminishedBreathing },
	groundAndOrient,
	{ ...pulse },
	{ ...cp },
	finished,
]

function mapLogToSession(log: number[], date: Date): BreathingSession {
	const local = getLocalDateTime(date)
	return {
		controlPause1: log[1] ?? 0,
		controlPause2: log[4] ?? 0,
		date,
		exerciseType: 'diminished',
		id: date.getTime().toString(),
		localDate: local.localDate,
		localTime: local.localTime,
		maxPause1: log[2] ?? 0,
		maxPause2: 0,
		maxPause3: 0,
		note: '',
		pulse1: log[0] ?? 0,
		pulse2: log[3] ?? 0,
		timezone: local.timezone,
	}
}

export const diminishedExercise: ExerciseConfig = {
	description:
		'A gentle exercise that uses relaxation to reduce your breathing.',
	layout: diminishedLayout,
	mapLogToSession,
	name: 'Diminished Breathing',
	shortName: 'Diminished',
	type: 'diminished',
}
