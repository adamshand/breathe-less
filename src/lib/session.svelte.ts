/* eslint-disable svelte/prefer-svelte-reactivity */
/* eslint-disable perfectionist/sort-classes */
import { browser, dev } from '$app/environment'
import { page } from '$app/state'
import { type BreathingSession, breathingStorage } from '$lib/breathingStorage'
import { layout } from '$lib/timers'
// import { layout } from '$lib/timersDebug'

export class Session {
	debugging = $derived(page.url.searchParams.get('debug') !== 'false' &&
		(page.url.searchParams.has('debug') ||
			page.url.hostname.startsWith('dev.') ||
			dev)
	)
	stage = $state(0)
	running = $state(false)
	finished = $derived(this.stage === layout.length - 1)

	autoStart = $derived(layout[this.stage].autoStart)
	duration = $derived(layout[this.stage].duration)
	instructions = $derived(layout[this.stage].instructions)
	name = $derived(layout[this.stage].name)
	loggedShortNames = layout
		.filter((stage) => stage.logged)
		.map((stage) => stage.shortName) // eg. [ 'p', 'cp', 'mp 1', 'mp 2', 'mp 3', 'cp', 'p' ]

	// iOS requires sounds to be instigated by user action (button, swipe etc)
	// Audio state is managed in session to persist across Timer component recreations
	audioInitialized = $state(false)
	ding: HTMLAudioElement | null = $state(null)
	dong: HTMLAudioElement | null = $state(null)

	initializeAudio() {
		if (!this.audioInitialized) {
			this.ding = new Audio('/ding.mp3')
			this.dong = new Audio('/dong.mp3')
			this.ding.load()
			this.dong.load()
			this.audioInitialized = true
		}
	}

	log: number[] = $state([])
	date = new Date() // doesn't need to be reactive
	todaysSessions: BreathingSession[] = $state([])

	saveError = $state('')
	sessionSaved = $state(false)
}

export const session = new Session()

export async function loadTodaysSessions() {
	try {
		const sessions = await breathingStorage.getSessionsByDate(new Date())
		session.todaysSessions = sessions.sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		)
	} catch (error) {
		console.error("Failed to load today's sessions:", error)
	}
}

export async function saveSession() {
	// TODO: I think this can be changed to session.finished = false
	if (!browser || session.log.length < 7) return

	try {
		const sessionData: BreathingSession = {
			controlPause1: session.log[1],
			controlPause2: session.log[5],
			date: session.date,
			id: session.date.getTime().toString(),
			maxPause1: session.log[2],
			maxPause2: session.log[3],
			maxPause3: session.log[4],
			note: '', // TODO: add note to session
			personalBest: {
				maxPause3: false, // This will be set by breathingStorage.saveSession()
			},
			pulse1: session.log[0],
			pulse2: session.log[6],
		}

		await breathingStorage.saveSession(sessionData)
		session.sessionSaved = true
		session.saveError = ''
		// Reload today's sessions to include the new one
		await loadTodaysSessions()
	} catch (error) {
		console.error('Failed to save session:', error)
		session.saveError = 'Failed to save session'
	}
}
