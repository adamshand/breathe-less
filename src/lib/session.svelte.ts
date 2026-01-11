/* eslint-disable svelte/prefer-svelte-reactivity */
/* eslint-disable perfectionist/sort-classes */
import type { BreathingSession } from '$lib/breathingStorage'
import type { ExerciseConfig, Stage } from '$lib/exercises/types'

import { browser, dev } from '$app/environment'
import { page } from '$app/state'
import { breathingStorage } from '$lib/breathingStorage'
import { classicalExercise } from '$lib/exercises/classical'

export class Session {
	private _config: ExerciseConfig = $state(classicalExercise)

	debugging = $derived(
		page.url.searchParams.get('debug') !== 'false' &&
			(page.url.searchParams.has('debug') ||
				page.url.hostname.startsWith('dev.') ||
				dev),
	)
	stage = $state(0)
	running = $state(false)

	layout = $derived(this._config.layout)
	finished = $derived(this.stage === this.layout.length - 1)

	autoStart = $derived(this.layout[this.stage].autoStart)
	duration = $derived(this.layout[this.stage].duration)
	instructions = $derived(this.layout[this.stage].instructions)
	name = $derived(this.layout[this.stage].name)
	loggedShortNames = $derived(
		this.layout
			.filter((stage: Stage) => stage.logged)
			.map((stage: Stage) => stage.shortName),
	)

	exerciseType = $derived(this._config.type)
	exerciseName = $derived(this._config.name)

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

	setExercise(config: ExerciseConfig) {
		this._config = config
		this.reset()
	}

	reset() {
		this.stage = 0
		this.log = []
		this.date = new Date()
		this.sessionSaved = false
		this.saveError = ''
	}

	mapLogToSession(): BreathingSession {
		return this._config.mapLogToSession(this.log, this.date)
	}
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

export async function saveMCPSession() {
	if (!browser) return

	const loggedStages = session.layout.filter((s: Stage) => s.logged)
	if (session.log.length < loggedStages.length) return

	try {
		const existingMCP = await breathingStorage.getTodaysMCP()
		const sessionData = session.mapLogToSession()

		if (existingMCP) {
			sessionData.id = existingMCP.id
			sessionData.date = existingMCP.date
			await breathingStorage.saveOrUpdateSession(sessionData)
		} else {
			await breathingStorage.saveSession(sessionData)
		}

		session.sessionSaved = true
		session.saveError = ''
		await loadTodaysSessions()
	} catch (error) {
		console.error('Failed to save MCP session:', error)
		session.saveError = 'Failed to save session'
	}
}

export async function saveSession() {
	if (!browser) return

	const loggedStages = session.layout.filter((s: Stage) => s.logged)
	if (session.log.length < loggedStages.length) return

	try {
		const sessionData = session.mapLogToSession()

		await breathingStorage.saveSession(sessionData)
		session.sessionSaved = true
		session.saveError = ''
		await loadTodaysSessions()
	} catch (error) {
		console.error('Failed to save session:', error)
		session.saveError = 'Failed to save session'
	}
}
